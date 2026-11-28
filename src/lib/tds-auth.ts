import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const scrypt = promisify(scryptCallback);
const COOKIE = 'tds_session';
const SESSION_MS = 8 * 60 * 60 * 1000;
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expectedHex] = encoded.split('$');
  if (algorithm !== 'scrypt' || !salt || !expectedHex) return false;
  const actual = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(expectedHex, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function validPassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 12 && password.length <= 200;
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

export async function getTdsActor() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.tdsSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { employee: { select: { id: true, employeeId: true, name: true, email: true, role: true, status: true } } },
  });
  if (!session || session.expiresAt <= new Date() || session.employee.status !== 'ACTIVE') return null;
  return { employee: session.employee, sessionId: session.id };
}

export async function requireTdsPermission(permission: 'VIEW' | 'MANAGE' | 'ADMIN') {
  const actor = await getTdsActor();
  if (!actor) return { response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  if (actor.employee.role === 'FOUNDER') return { actor };
  if (permission === 'ADMIN') return { response: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
  const access = await prisma.tdsAccess.findUnique({ where: { employeeId: actor.employee.id } });
  const allowed = access && (access.permission === 'MANAGE' || (permission === 'VIEW' && access.permission === 'VIEW'));
  if (!allowed) return { response: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
  return { actor };
}

export async function createTdsSession(employeeId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await prisma.tdsSession.create({ data: { employeeId, tokenHash: hashToken(token), expiresAt } });
  cookies().set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/accounts/tds', expires: expiresAt });
}

export async function revokeTdsSession() {
  const token = cookies().get(COOKIE)?.value;
  if (token) await prisma.tdsSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookies().set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/accounts/tds', maxAge: 0 });
}

export function ensureOrigin(request: Request) {
  return isSameOrigin(request) ? null : NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
}

export function generateSetupToken() { return randomBytes(32).toString('base64url'); }
export const setupTokenHash = hashToken;
export const setupExpiry = () => new Date(Date.now() + 30 * 60 * 1000);
export const passwordHash = hashPassword;

export async function bootstrapSecretValid(request: Request) {
  const configured = process.env.TDS_BOOTSTRAP_SECRET;
  const supplied = request.headers.get('x-tds-bootstrap-secret') || '';
  if (!configured || configured.length < 32 || !supplied) return false;
  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

