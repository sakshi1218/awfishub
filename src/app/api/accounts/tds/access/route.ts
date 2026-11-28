import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureOrigin, requireTdsPermission } from '@/lib/tds-auth';

export async function GET() {
  const auth = await requireTdsPermission('ADMIN');
  if (auth.response) return auth.response;
  const [employees, grants] = await Promise.all([
    prisma.employee.findMany({ where: { status: 'ACTIVE' }, select: { id: true, employeeId: true, name: true, role: true }, orderBy: { name: 'asc' } }),
    prisma.tdsAccess.findMany({ include: { employee: { select: { id: true, employeeId: true, name: true, role: true } }, grantedBy: { select: { name: true } } } }),
  ]);
  return NextResponse.json({ employees, grants }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  const auth = await requireTdsPermission('ADMIN');
  if (auth.response) return auth.response;
  try {
    const { employeeId, permission } = await request.json();
    if (!['VIEW', 'MANAGE'].includes(permission)) return NextResponse.json({ error: 'Permission must be VIEW or MANAGE.' }, { status: 400 });
    const employee = await prisma.employee.findFirst({ where: { id: employeeId, status: 'ACTIVE', role: { not: 'FOUNDER' } } });
    if (!employee) return NextResponse.json({ error: 'Active non-admin employee not found.' }, { status: 400 });
    const grant = await prisma.tdsAccess.upsert({ where: { employeeId }, create: { employeeId, permission, grantedById: auth.actor!.employee.id }, update: { permission, grantedById: auth.actor!.employee.id } });
    return NextResponse.json(grant, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to grant access.' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  const auth = await requireTdsPermission('ADMIN');
  if (auth.response) return auth.response;
  const employeeId = new URL(request.url).searchParams.get('employeeId');
  if (!employeeId) return NextResponse.json({ error: 'Employee ID is required.' }, { status: 400 });
  await prisma.tdsAccess.deleteMany({ where: { employeeId } });
  return NextResponse.json({ ok: true });
}

