import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureOrigin, requireTdsPermission } from '@/lib/tds-auth';

const recordInclude = {
  assignedTo: { select: { id: true, employeeId: true, name: true } },
  deducteeEmployee: { select: { id: true, employeeId: true, name: true } },
  deducteeCollege: { select: { id: true, code: true, name: true } },
  createdBy: { select: { id: true, employeeId: true, name: true } },
  updatedBy: { select: { id: true, employeeId: true, name: true } },
  correctionOf: { select: { id: true, acknowledgementRef: true, revision: true } },
};
const categories = ['CLIENT', 'EMPLOYEE', 'VENDOR'];
const filingStatuses = ['PENDING', 'IN_PROGRESS', 'FILED'];
const responsibilityStatuses = ['UNASSIGNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
const validDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(new Date(value).getTime());

function dateBounds(from: string | null, to: string | null) {
  if (from && !validDate(from)) throw new Error('Invalid date filter');
  if (to && !validDate(to)) throw new Error('Invalid date filter');
  const end = to ? new Date(to) : undefined;
  if (end && /^\d{4}-\d{2}-\d{2}$/.test(to!)) end.setHours(23, 59, 59, 999);
  return from || to ? { gte: from ? new Date(from) : undefined, lte: end } : undefined;
}

export async function GET(request: Request) {
  const auth = await requireTdsPermission('VIEW');
  if (auth.response) return auth.response;
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category') || undefined;
    const staffId = searchParams.get('staffId') || undefined;
    const financialYear = searchParams.get('financialYear') || undefined;
    const quarter = searchParams.get('quarter') || undefined;
    const status = searchParams.get('status') || undefined;
    const responsibilityStatus = searchParams.get('responsibilityStatus') || undefined;
    const dueDate = dateBounds(searchParams.get('dueFrom'), searchParams.get('dueTo'));
    const filingDate = dateBounds(searchParams.get('from'), searchParams.get('to'));
    const dueDateFilter = { ...(dueDate || {}), ...(status === 'OVERDUE' ? { lt: new Date(), not: null } : {}) };
    const where = {
      deducteeCategory: category,
      assignedToId: staffId,
      financialYear,
      quarter,
      responsibilityStatus,
      status: status === 'OVERDUE' ? undefined : status,
      ...(status === 'OVERDUE' ? { status: { not: 'FILED' } } : {}),
      ...(dueDate || status === 'OVERDUE' ? { dueDate: dueDateFilter } : {}),
      ...(filingDate ? { filingDate } : {}),
      ...(q ? { OR: [
        { deducteeName: { contains: q } }, { deducteeReference: { contains: q } },
        { deducteeEmployee: { employeeId: { contains: q } } }, { deducteeCollege: { code: { contains: q } } },
        { assignedTo: { name: { contains: q } } }, { assignedTo: { employeeId: { contains: q } } },
      ] } : {}),
    };
    const records = await prisma.tdsFiling.findMany({ where, include: recordInclude, orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }] });
    const now = new Date();
    const [total, filed, pending, inProgress, overdue, amount] = await Promise.all([
      prisma.tdsFiling.count(), prisma.tdsFiling.count({ where: { status: 'FILED' } }),
      prisma.tdsFiling.count({ where: { status: 'PENDING', OR: [{ dueDate: null }, { dueDate: { gte: now } }] } }),
      prisma.tdsFiling.count({ where: { status: 'IN_PROGRESS', OR: [{ dueDate: null }, { dueDate: { gte: now } }] } }),
      prisma.tdsFiling.count({ where: { status: { not: 'FILED' }, dueDate: { lt: now, not: null } } }),
      prisma.tdsFiling.aggregate({ _sum: { tdsAmount: true } }),
    ]);
    return NextResponse.json({
      records: records.map((record) => ({ ...record, status: record.status !== 'FILED' && record.dueDate && record.dueDate < now ? 'OVERDUE' : record.status })),
      summary: { total, filed, pending, inProgress, overdue, amount: amount._sum.tdsAmount || 0 },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to read TDS filing records.' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  const auth = await requireTdsPermission('MANAGE');
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const category = String(body.deducteeCategory || '');
    if (!categories.includes(category) || typeof body.deducteeName !== 'string' || !body.deducteeName.trim()) return NextResponse.json({ error: 'Deductee category and name are required.' }, { status: 400 });
    if (typeof body.financialYear !== 'string' || !/^\d{4}-\d{2,4}$/.test(body.financialYear) || !['Q1', 'Q2', 'Q3', 'Q4'].includes(body.quarter)) return NextResponse.json({ error: 'Financial year or quarter is invalid.' }, { status: 400 });
    if (typeof body.tdsAmount !== 'number' || !Number.isFinite(body.tdsAmount) || body.tdsAmount < 0) return NextResponse.json({ error: 'TDS amount must be a non-negative number.' }, { status: 400 });
    if (!filingStatuses.includes(body.status || 'PENDING')) return NextResponse.json({ error: 'Filing status is invalid.' }, { status: 400 });
    if (!responsibilityStatuses.includes(body.responsibilityStatus || 'ASSIGNED')) return NextResponse.json({ error: 'Responsibility status is invalid.' }, { status: 400 });
    if (!body.assignedToId || !await prisma.employee.findFirst({ where: { id: body.assignedToId, status: 'ACTIVE' }, select: { id: true } })) return NextResponse.json({ error: 'Assign an active staff member.' }, { status: 400 });
    if (body.dueDate && !validDate(body.dueDate) || body.filingDate && !validDate(body.filingDate)) return NextResponse.json({ error: 'Filing dates are invalid.' }, { status: 400 });

    let deducteeEmployeeId: string | null = null;
    let deducteeCollegeId: string | null = null;
    let deducteeName = body.deducteeName.trim();
    if (category === 'EMPLOYEE') {
      const employee = body.deducteeEmployeeId && await prisma.employee.findFirst({ where: { id: body.deducteeEmployeeId, status: 'ACTIVE' }, select: { id: true, name: true } });
      if (!employee) return NextResponse.json({ error: 'Select an existing active employee as deductee.' }, { status: 400 });
      deducteeEmployeeId = employee.id;
      deducteeName = employee.name;
    } else if (category === 'CLIENT' && body.deducteeCollegeId) {
      const college = await prisma.college.findFirst({ where: { id: body.deducteeCollegeId, status: 'ACTIVE' }, select: { id: true, name: true } });
      if (!college) return NextResponse.json({ error: 'Selected client record is unavailable.' }, { status: 400 });
      deducteeCollegeId = college.id;
      deducteeName = college.name;
    }

    const returnType = typeof body.returnType === 'string' && body.returnType.trim() ? body.returnType.trim().toUpperCase() : 'OTHER';
    if (!/^[A-Z0-9_-]{1,16}$/.test(returnType)) return NextResponse.json({ error: 'Return type is invalid.' }, { status: 400 });
    if (body.revision !== undefined && (!Number.isInteger(body.revision) || body.revision < 0)) return NextResponse.json({ error: 'Revision must be a non-negative whole number.' }, { status: 400 });
    const revision = Number.isInteger(body.revision) && body.revision >= 0 ? body.revision : 0;
    const correctionReason = typeof body.correctionReason === 'string' ? body.correctionReason.trim() : '';
    const correctionOfId = typeof body.correctionOfId === 'string' && body.correctionOfId ? body.correctionOfId : null;
    if (revision > 0 && (!correctionReason || !correctionOfId)) return NextResponse.json({ error: 'Corrections require the original filing and a reason.' }, { status: 400 });
    if (correctionOfId) {
      const original = await prisma.tdsFiling.findUnique({ where: { id: correctionOfId }, select: { revision: true, deducteeCategory: true, financialYear: true, quarter: true, returnType: true, deducteeEmployeeId: true, deducteeCollegeId: true, deducteeReference: true, deducteeNameKey: true } });
      const identity = deducteeEmployeeId ? `employee:${deducteeEmployeeId}` : deducteeCollegeId ? `college:${deducteeCollegeId}` : body.deducteeReference ? `${category.toLowerCase()}:${String(body.deducteeReference).trim().toLocaleLowerCase('en')}` : `${category.toLowerCase()}:${deducteeName.trim().toLocaleLowerCase('en')}`;
      const identityKey = `#${identity}`;
      if (!original || revision !== original.revision + 1 || original.deducteeCategory !== category || original.financialYear !== body.financialYear || original.quarter !== body.quarter || original.returnType !== returnType || original.deducteeNameKey !== identityKey) return NextResponse.json({ error: 'Correction must reference the previous revision for the same deductee and filing period.' }, { status: 400 });
    }
    const identity = deducteeEmployeeId ? `employee:${deducteeEmployeeId}` : deducteeCollegeId ? `college:${deducteeCollegeId}` : body.deducteeReference ? `${category.toLowerCase()}:${String(body.deducteeReference).trim().toLocaleLowerCase('en')}` : `${category.toLowerCase()}:${deducteeName.trim().toLocaleLowerCase('en')}`;
    const data = {
      deducteeName, deducteeNameKey: `#${identity}`, deducteeCategory: category,
      deducteeReference: typeof body.deducteeReference === 'string' ? body.deducteeReference.trim() || null : null,
      deducteeEmployeeId, deducteeCollegeId,
      panNumber: typeof body.panNumber === 'string' && body.panNumber.trim() ? body.panNumber.trim().toUpperCase() : null,
      tanNumber: typeof body.tanNumber === 'string' && body.tanNumber.trim() ? body.tanNumber.trim().toUpperCase() : null,
      financialYear: body.financialYear, quarter: body.quarter, returnType, revision, correctionReason: correctionReason || null, correctionOfId,
      tdsAmount: body.tdsAmount, status: body.status || 'PENDING',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      filingDate: body.filingDate ? new Date(body.filingDate) : null,
      acknowledgementRef: typeof body.acknowledgementRef === 'string' ? body.acknowledgementRef.trim() || null : null,
      assignedToId: body.assignedToId, assignedAt: new Date(), responsibilityStatus: body.responsibilityStatus || 'ASSIGNED',
      responsibilityRemarks: typeof body.responsibilityRemarks === 'string' ? body.responsibilityRemarks.trim() || null : null,
      completedAt: body.status === 'FILED' ? (body.filingDate ? new Date(body.filingDate) : new Date()) : null,
      remarks: typeof body.remarks === 'string' ? body.remarks.trim() || null : null,
      createdById: auth.actor!.employee.id, updatedById: auth.actor!.employee.id,
    };
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.tdsFiling.create({ data, include: recordInclude });
      await tx.tdsStatusHistory.create({ data: { filingId: created.id, actorId: auth.actor!.employee.id, action: 'CREATED', toStatus: created.status, details: 'Filing record created' } });
      await tx.tdsAssignmentHistory.create({ data: { filingId: created.id, assignedToId: created.assignedToId, fromAssignedToId: null, actorId: auth.actor!.employee.id, toStatus: created.responsibilityStatus, remarks: created.responsibilityRemarks || 'Initial responsibility assigned' } });
      return created;
    });
    return NextResponse.json(record, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'This filing revision already exists. Use a new revision for a correction.' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to create TDS filing record.' }, { status: 400 });
  }
}
