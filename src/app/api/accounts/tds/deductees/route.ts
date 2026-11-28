import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireTdsPermission } from '@/lib/tds-auth';

export async function GET() {
  const auth = await requireTdsPermission('VIEW');
  if (auth.response) return auth.response;
  const [employees, clients] = await Promise.all([
    prisma.employee.findMany({ where: { status: 'ACTIVE' }, select: { id: true, employeeId: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.college.findMany({ where: { status: 'ACTIVE' }, select: { id: true, code: true, name: true }, orderBy: { name: 'asc' } }),
  ]);
  return NextResponse.json({ employees, clients }, { headers: { 'Cache-Control': 'private, no-store' } });
}

