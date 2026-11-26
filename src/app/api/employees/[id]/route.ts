import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        avatarUrl: true,
        designation: true,
        role: true,
        status: true,
        joiningDate: true,
        department: { select: { id: true, name: true } },
        reportingManager: { select: { id: true, name: true, designation: true } },
        reportingDirector: { select: { id: true, name: true, designation: true } },
        subordinates: { select: { id: true, employeeId: true, name: true, designation: true, status: true } },
        directorSubordinates: { select: { id: true, employeeId: true, name: true, designation: true, status: true } },
        tasksAssigned: { take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, taskId: true, title: true, status: true, createdAt: true } },
        tasksReceived: { take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, taskId: true, title: true, status: true, createdAt: true } },
        dailyReports: { take: 5, orderBy: { reportDate: 'desc' }, select: { id: true, reportDate: true, status: true } },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const history = await prisma.reportingHistory.findMany({
      where: { employeeId: params.id },
      orderBy: { changeDate: 'desc' },
    });

    return NextResponse.json({ ...employee, reportingHistory: history });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

export async function DELETE() {
  return NextResponse.json({ error: 'Employee management requires an authenticated administrator session.' }, { status: 401 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Employee management requires an authenticated administrator session.' }, { status: 401 });
}
