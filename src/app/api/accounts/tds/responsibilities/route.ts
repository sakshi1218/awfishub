import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireTdsPermission } from '@/lib/tds-auth';

const dateFilter = (from: string | null, to: string | null) => {
  if (from && Number.isNaN(new Date(from).getTime()) || to && Number.isNaN(new Date(to).getTime())) throw new Error('Invalid date filter');
  const end = to ? new Date(to) : undefined;
  if (end && /^\d{4}-\d{2}-\d{2}$/.test(to!)) end.setHours(23, 59, 59, 999);
  return from || to ? { gte: from ? new Date(from) : undefined, lte: end } : undefined;
};

export async function GET(request: Request) {
  const auth = await requireTdsPermission('VIEW');
  if (auth.response) return auth.response;
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const staffId = searchParams.get('staffId') || undefined;
    const responsibilityStatus = searchParams.get('responsibilityStatus') || undefined;
    const filingStatus = searchParams.get('filingStatus') || undefined;
    const category = searchParams.get('category') || undefined;
    const financialYear = searchParams.get('financialYear') || undefined;
    const quarter = searchParams.get('quarter') || undefined;
    const assignedAt = dateFilter(searchParams.get('assignedFrom'), searchParams.get('assignedTo'));
    const dueDate = dateFilter(searchParams.get('dueFrom'), searchParams.get('dueTo'));
    const filingDate = dateFilter(searchParams.get('filingFrom'), searchParams.get('filingTo'));
    const dueDateFilter = { ...(dueDate || {}), ...(filingStatus === 'OVERDUE' ? { lt: new Date(), not: null } : {}) };
    const where = {
      assignedToId: staffId, responsibilityStatus, status: filingStatus === 'OVERDUE' ? undefined : filingStatus,
      deducteeCategory: category, financialYear, quarter,
      ...(filingStatus === 'OVERDUE' ? { status: { not: 'FILED' } } : {}),
      ...(assignedAt ? { assignedAt } : {}), ...(dueDate || filingStatus === 'OVERDUE' ? { dueDate: dueDateFilter } : {}), ...(filingDate ? { filingDate } : {}),
      ...(q ? { OR: [{ assignedTo: { name: { contains: q } } }, { assignedTo: { employeeId: { contains: q } } }, { deducteeName: { contains: q } }, { deducteeReference: { contains: q } }, { deducteeEmployee: { employeeId: { contains: q } } }, { deducteeCollege: { code: { contains: q } } }] } : {}),
    };
    const records = await prisma.tdsFiling.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, employeeId: true, name: true } },
        deducteeEmployee: { select: { id: true, employeeId: true, name: true } },
        deducteeCollege: { select: { id: true, code: true, name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { assignedAt: 'asc' }, { updatedAt: 'desc' }],
    });
    const now = new Date();
    const mapped = records.map((record) => ({ ...record, filingStatus: record.status !== 'FILED' && record.dueDate && record.dueDate < now ? 'OVERDUE' : record.status }));
    const [total, assigned, inProgress, completed, unassigned, overdue] = await Promise.all([
      prisma.tdsFiling.count(),
      prisma.tdsFiling.count({ where: { assignedToId: { not: null } } }),
      prisma.tdsFiling.count({ where: { responsibilityStatus: 'IN_PROGRESS' } }),
      prisma.tdsFiling.count({ where: { responsibilityStatus: 'COMPLETED' } }),
      prisma.tdsFiling.count({ where: { assignedToId: null } }),
      prisma.tdsFiling.count({ where: { status: { not: 'FILED' }, dueDate: { lt: now, not: null } } }),
    ]);
    return NextResponse.json({ records: mapped, summary: { total, assigned, inProgress, completed, unassigned, overdue } }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load responsibility records.' }, { status: 400 });
  }
}
