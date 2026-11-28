import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createTdsSession, ensureOrigin, verifyPassword } from '@/lib/tds-auth';

export async function POST(request: Request) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string') return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
    const employee = await prisma.employee.findFirst({ where: { email: { equals: email.trim() } }, include: { tdsCredential: true } });
    const credential = employee?.tdsCredential;
    const now = new Date();
    const matches = !!employee && employee.status === 'ACTIVE' && !!credential?.passwordHash && (!credential.lockedUntil || credential.lockedUntil <= now) && await verifyPassword(password, credential.passwordHash);
    if (!matches) {
      if (credential && (!credential.lockedUntil || credential.lockedUntil <= now)) {
        const attempts = credential.failedLoginAttempts + 1;
        await prisma.tdsCredential.update({ where: { id: credential.id }, data: { failedLoginAttempts: attempts >= 5 ? 0 : attempts, lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null } });
      }
      return NextResponse.json({ error: 'Invalid credentials or account temporarily locked.' }, { status: 401 });
    }
    await prisma.tdsCredential.update({ where: { id: credential!.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
    await createTdsSession(employee!.id);
    return NextResponse.json({ employee: { id: employee!.id, employeeId: employee!.employeeId, name: employee!.name, role: employee!.role } }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 400 });
  }
}

