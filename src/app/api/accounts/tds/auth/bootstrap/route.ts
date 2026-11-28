import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { bootstrapSecretValid, createTdsSession, ensureOrigin, hashPassword, validPassword } from '@/lib/tds-auth';

export async function POST(request: Request) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  if (!await bootstrapSecretValid(request)) return NextResponse.json({ error: 'Bootstrap authorization failed.' }, { status: 401 });
  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || !validPassword(password)) return NextResponse.json({ error: 'Valid email and a password of at least 12 characters are required.' }, { status: 400 });
    const founder = await prisma.employee.findFirst({ where: { email: email.trim(), role: 'FOUNDER', status: 'ACTIVE' }, include: { tdsCredential: true } });
    if (!founder) return NextResponse.json({ error: 'Bootstrap unavailable.' }, { status: 404 });
    if (founder.tdsCredential?.passwordHash) return NextResponse.json({ error: 'Bootstrap has already been completed.' }, { status: 409 });
    const passwordHashValue = await hashPassword(password);
    if (founder.tdsCredential) {
      const updated = await prisma.tdsCredential.updateMany({ where: { id: founder.tdsCredential.id, passwordHash: null }, data: { passwordHash: passwordHashValue } });
      if (!updated.count) return NextResponse.json({ error: 'Bootstrap has already been completed.' }, { status: 409 });
    } else {
      try { await prisma.tdsCredential.create({ data: { employeeId: founder.id, passwordHash: passwordHashValue } }); }
      catch { return NextResponse.json({ error: 'Bootstrap has already been completed.' }, { status: 409 }); }
    }
    await createTdsSession(founder.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to initialize TDS administrator.' }, { status: 400 });
  }
}
