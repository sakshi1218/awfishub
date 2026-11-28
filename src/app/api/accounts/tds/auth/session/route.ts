import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTdsActor } from '@/lib/tds-auth';

export async function GET() {
  const actor = await getTdsActor();
  if (!actor) return NextResponse.json({ authenticated: false }, { status: 401 });
  const access = actor.employee.role === 'FOUNDER' ? 'ADMIN' : (await prisma.tdsAccess.findUnique({ where: { employeeId: actor.employee.id } }))?.permission || null;
  if (!access) return NextResponse.json({ authenticated: true, authorized: false }, { status: 403 });
  return NextResponse.json({ authenticated: true, authorized: true, permission: access, employee: actor.employee }, { headers: { 'Cache-Control': 'private, no-store' } });
}
