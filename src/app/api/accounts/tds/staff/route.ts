import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireTdsPermission } from '@/lib/tds-auth';

export async function GET() {
  const auth = await requireTdsPermission('VIEW');
  if (auth.response) return auth.response;
  const staff = await prisma.employee.findMany({ where: { status: 'ACTIVE' }, select: { id: true, employeeId: true, name: true, role: true }, orderBy: { name: 'asc' } });
  return NextResponse.json(staff, { headers: { 'Cache-Control': 'no-store' } });
}

