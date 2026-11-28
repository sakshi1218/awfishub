import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureOrigin, requireTdsPermission } from '@/lib/tds-auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  const auth = await requireTdsPermission('MANAGE');
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const current = await prisma.tdsFiling.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: 'Filing record not found.' }, { status: 404 });
    const assignedToId = body.assignedToId === undefined ? current.assignedToId : (body.assignedToId || null);
    const allowedStatuses = ['UNASSIGNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
    const responsibilityStatus = String(body.responsibilityStatus || (assignedToId ? 'ASSIGNED' : 'UNASSIGNED'));
    if (!allowedStatuses.includes(responsibilityStatus) || (assignedToId && responsibilityStatus === 'UNASSIGNED') || (!assignedToId && responsibilityStatus !== 'UNASSIGNED')) return NextResponse.json({ error: 'Assignment and responsibility status do not match.' }, { status: 400 });
    if (assignedToId && !await prisma.employee.findFirst({ where: { id: assignedToId, status: 'ACTIVE' }, select: { id: true } })) return NextResponse.json({ error: 'Select an active staff member.' }, { status: 400 });
    const remarks = typeof body.remarks === 'string' ? body.remarks.trim() || null : current.responsibilityRemarks;
    const assignmentChanged = assignedToId !== current.assignedToId || responsibilityStatus !== current.responsibilityStatus || remarks !== current.responsibilityRemarks;
    if (!assignmentChanged) return NextResponse.json({ error: 'No responsibility changes were provided.' }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.tdsFiling.update({ where: { id: params.id }, data: {
        assignedToId, assignedAt: assignedToId ? (assignedToId !== current.assignedToId || !current.assignedAt ? new Date() : current.assignedAt) : null,
        responsibilityStatus, responsibilityRemarks: remarks, updatedById: auth.actor!.employee.id,
      }, include: { assignedTo: { select: { id: true, employeeId: true, name: true } } } });
      await tx.tdsAssignmentHistory.create({ data: {
        filingId: updated.id, assignedToId: updated.assignedToId, fromAssignedToId: current.assignedToId, actorId: auth.actor!.employee.id,
        fromStatus: current.responsibilityStatus, toStatus: updated.responsibilityStatus,
        remarks: remarks || (assignedToId !== current.assignedToId ? 'Responsibility reassigned' : 'Responsibility updated'),
      } });
      return updated;
    });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to update filing responsibility.' }, { status: 400 });
  }
}

