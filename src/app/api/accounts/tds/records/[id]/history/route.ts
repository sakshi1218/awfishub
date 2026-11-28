import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireTdsPermission } from '@/lib/tds-auth';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireTdsPermission('VIEW');
  if (auth.response) return auth.response;
  const exists = await prisma.tdsFiling.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: 'Filing record not found.' }, { status: 404 });
  const [filingHistory, assignmentHistory] = await Promise.all([
    prisma.tdsStatusHistory.findMany({ where: { filingId: params.id }, include: { actor: { select: { id: true, employeeId: true, name: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.tdsAssignmentHistory.findMany({ where: { filingId: params.id }, include: {
      actor: { select: { id: true, employeeId: true, name: true } },
      assignedTo: { select: { id: true, employeeId: true, name: true } },
      fromAssignedTo: { select: { id: true, employeeId: true, name: true } },
    }, orderBy: { createdAt: 'desc' } }),
  ]);
  return NextResponse.json({ filingHistory, assignmentHistory }, { headers: { 'Cache-Control': 'private, no-store' } });
}

