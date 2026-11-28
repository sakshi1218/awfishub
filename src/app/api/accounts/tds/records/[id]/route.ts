import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureOrigin, requireTdsPermission } from '@/lib/tds-auth';

const include = {
  assignedTo: { select: { id: true, employeeId: true, name: true } },
  deducteeEmployee: { select: { id: true, employeeId: true, name: true } },
  deducteeCollege: { select: { id: true, code: true, name: true } },
  createdBy: { select: { id: true, employeeId: true, name: true } },
  updatedBy: { select: { id: true, employeeId: true, name: true } },
  correctionOf: { select: { id: true, acknowledgementRef: true, revision: true } },
};

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireTdsPermission('VIEW');
  if (auth.response) return auth.response;
  const record = await prisma.tdsFiling.findUnique({ where: { id: params.id }, include });
  if (!record) return NextResponse.json({ error: 'Filing record not found.' }, { status: 404 });
  return NextResponse.json(record, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  const auth = await requireTdsPermission('MANAGE');
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    if ('assignedToId' in body || 'responsibilityStatus' in body) return NextResponse.json({ error: 'Update staff responsibility through the responsibility workflow.' }, { status: 400 });
    const current = await prisma.tdsFiling.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: 'Filing record not found.' }, { status: 404 });
    const category = String(body.deducteeCategory ?? current.deducteeCategory);
    const status = String(body.status ?? current.status);
    const quarter = String(body.quarter ?? current.quarter);
    const financialYear = String(body.financialYear ?? current.financialYear);
    const tdsAmount = body.tdsAmount ?? current.tdsAmount;
    if (!['CLIENT', 'EMPLOYEE', 'VENDOR'].includes(category) || !['PENDING', 'IN_PROGRESS', 'FILED'].includes(status) || !['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) return NextResponse.json({ error: 'Category, quarter, or filing status is invalid.' }, { status: 400 });
    if (!/^\d{4}-\d{2,4}$/.test(financialYear) || typeof tdsAmount !== 'number' || !Number.isFinite(tdsAmount) || tdsAmount < 0) return NextResponse.json({ error: 'Financial year or TDS amount is invalid.' }, { status: 400 });
    if (body.returnType !== undefined && (typeof body.returnType !== 'string' || !/^[A-Z0-9_-]{1,16}$/i.test(body.returnType))) return NextResponse.json({ error: 'Return type is invalid.' }, { status: 400 });
    const reference = typeof body.deducteeReference === 'string' ? body.deducteeReference.trim() || null : current.deducteeReference;
    const employeeId = category === 'EMPLOYEE' ? String(body.deducteeEmployeeId || current.deducteeEmployeeId || '') || null : null;
    const collegeId = category === 'CLIENT' ? String(('deducteeCollegeId' in body ? body.deducteeCollegeId : current.deducteeCollegeId) || '') || null : null;
    let name = typeof body.deducteeName === 'string' ? body.deducteeName.trim() : current.deducteeName;
    if (category === 'EMPLOYEE' && !employeeId) return NextResponse.json({ error: 'Select an existing employee as deductee.' }, { status: 400 });
    if (employeeId) {
      const employee = await prisma.employee.findFirst({ where: { id: employeeId, status: 'ACTIVE' }, select: { id: true, name: true } });
      if (!employee) return NextResponse.json({ error: 'Selected deductee employee is unavailable.' }, { status: 400 });
      name = employee.name;
    } else if (collegeId) {
      const college = await prisma.college.findFirst({ where: { id: collegeId, status: 'ACTIVE' }, select: { id: true, name: true } });
      if (!college) return NextResponse.json({ error: 'Selected client record is unavailable.' }, { status: 400 });
      name = college.name;
    }
    if (!name) return NextResponse.json({ error: 'Deductee name is required.' }, { status: 400 });
    const identity = employeeId ? `employee:${employeeId}` : collegeId ? `college:${collegeId}` : reference ? `${category.toLowerCase()}:${reference.toLocaleLowerCase('en')}` : `${category.toLowerCase()}:${name.toLocaleLowerCase('en')}`;
    const data: Record<string, unknown> = {
      deducteeCategory: category, deducteeName: name, deducteeNameKey: `#${identity}`,
      deducteeReference: reference, deducteeEmployeeId: employeeId, deducteeCollegeId: collegeId,
      financialYear, quarter, tdsAmount, status, updatedById: auth.actor!.employee.id,
    };
    for (const field of ['panNumber', 'tanNumber', 'acknowledgementRef', 'remarks'] as const) {
      if (field in body) data[field] = typeof body[field] === 'string' ? body[field].trim() || null : null;
    }
    if ('returnType' in body) data.returnType = String(body.returnType).toUpperCase();
    for (const field of ['dueDate', 'filingDate'] as const) if (field in body) {
      if (body[field] && (typeof body[field] !== 'string' || Number.isNaN(new Date(body[field]).getTime()))) return NextResponse.json({ error: `${field} is invalid.` }, { status: 400 });
      data[field] = body[field] ? new Date(body[field]) : null;
    }
    const nextFilingDate = 'filingDate' in data ? data.filingDate : current.filingDate;
    data.completedAt = status === 'FILED' ? (nextFilingDate || new Date()) : null;
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.tdsFiling.update({ where: { id: params.id }, data, include });
      await tx.tdsStatusHistory.create({ data: {
        filingId: result.id, actorId: auth.actor!.employee.id,
        action: current.status !== result.status ? 'STATUS_CHANGED' : 'UPDATED',
        fromStatus: current.status, toStatus: result.status,
        details: typeof body.remarks === 'string' ? body.remarks : 'Filing record updated',
      } });
      return result;
    });
    return NextResponse.json(updated, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'This filing revision already exists.' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to update TDS filing record.' }, { status: 400 });
  }
}
