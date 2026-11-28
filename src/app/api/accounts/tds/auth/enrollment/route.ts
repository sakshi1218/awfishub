import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureOrigin, generateSetupToken, hashPassword, requireTdsPermission, setupExpiry, setupTokenHash, validPassword } from '@/lib/tds-auth';

export async function POST(request: Request) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  const auth = await requireTdsPermission('ADMIN');
  if (auth.response) return auth.response;
  try {
    const { employeeId } = await request.json();
    const employee = await prisma.employee.findFirst({ where: { id: employeeId, status: 'ACTIVE' }, select: { id: true, name: true, role: true } });
    if (!employee || employee.role === 'FOUNDER') return NextResponse.json({ error: 'Choose an active non-admin employee.' }, { status: 400 });
    const token = generateSetupToken();
    await prisma.$transaction(async (tx) => {
      await tx.tdsCredential.upsert({ where: { employeeId }, create: { employeeId, setupTokenHash: setupTokenHash(token), setupTokenExpiresAt: setupExpiry() }, update: { passwordHash: null, setupTokenHash: setupTokenHash(token), setupTokenExpiresAt: setupExpiry() } });
      await tx.tdsSession.deleteMany({ where: { employeeId } });
    });
    return NextResponse.json({ token, employee });
  } catch {
    return NextResponse.json({ error: 'Unable to create enrollment token.' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  try {
    const { employeeId, token, password } = await request.json();
    if (typeof employeeId !== 'string' || typeof token !== 'string' || !validPassword(password)) return NextResponse.json({ error: 'Invalid or expired enrollment.' }, { status: 400 });
    const credential = await prisma.tdsCredential.findUnique({ where: { employeeId } });
    if (!credential?.setupTokenHash || credential.setupTokenHash !== setupTokenHash(token) || !credential.setupTokenExpiresAt || credential.setupTokenExpiresAt <= new Date()) return NextResponse.json({ error: 'Invalid or expired enrollment.' }, { status: 400 });
    const consumed = await prisma.$transaction(async (tx) => {
      const result = await tx.tdsCredential.updateMany({
        where: { id: credential.id, setupTokenHash: setupTokenHash(token), setupTokenExpiresAt: { gt: new Date() } },
        data: { passwordHash: await hashPassword(password), setupTokenHash: null, setupTokenExpiresAt: null, failedLoginAttempts: 0, lockedUntil: null },
      });
      if (result.count) await tx.tdsSession.deleteMany({ where: { employeeId } });
      return result;
    });
    if (!consumed.count) return NextResponse.json({ error: 'Invalid or expired enrollment.' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to complete enrollment.' }, { status: 400 });
  }
}

