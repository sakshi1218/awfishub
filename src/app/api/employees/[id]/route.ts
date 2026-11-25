import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        reportingManager: true,
        reportingDirector: true,
        subordinates: true,
        directorSubordinates: true,
        tasksAssigned: { take: 5, orderBy: { createdAt: 'desc' } },
        tasksReceived: { take: 5, orderBy: { createdAt: 'desc' } },
        dailyReports: { take: 5, orderBy: { reportDate: 'desc' } },
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Soft deactivate or delete
    const updated = await prisma.employee.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error deactivating employee:', error);
    return NextResponse.json({ error: 'Failed to deactivate employee' }, { status: 500 });
  }
}
