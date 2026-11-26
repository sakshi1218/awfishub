import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const requests = await prisma.leaveRequest.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: {
        employee: {
          include: { department: true, reportingManager: true },
        },
        approvedBy: {
          select: { id: true, name: true, designation: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, leaveType, startDate, endDate, totalDays, reason } = body;

    const count = await prisma.leaveRequest.count();
    const leaveNumber = `LV-2026-${String(count + 1).padStart(3, '0')}`;

    const leave = await prisma.leaveRequest.create({
      data: {
        leaveNumber,
        employeeId,
        leaveType: leaveType || 'CASUAL',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays: Number(totalDays) || 1,
        reason,
        status: 'PENDING',
      },
      include: {
        employee: {
          include: { reportingManager: true, reportingDirector: true },
        },
      },
    });

    // Notify reporting manager
    const managerId = leave.employee.reportingManagerId || leave.employee.reportingDirectorId;
    if (managerId) {
      await prisma.notification.create({
        data: {
          recipientId: managerId,
          title: `New Leave Request: ${leave.employee.name}`,
          message: `${leave.employee.name} requested ${totalDays} day(s) ${leaveType} leave.`,
          type: 'LEAVE',
          linkUrl: '/attendance',
        },
      });
    }

    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, approvedById, rejectionReason } = body;

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById: status === 'APPROVED' ? approvedById : null,
        approvedAt: new Date(),
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      },
      include: {
        employee: true,
        approvedBy: true,
      },
    });

    // Notify employee of approval outcome
    await prisma.notification.create({
      data: {
        recipientId: updated.employeeId,
        title: `Leave Application ${status}`,
        message: `Your leave request ${updated.leaveNumber} has been ${status}.`,
        type: 'LEAVE',
        linkUrl: '/attendance',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}
