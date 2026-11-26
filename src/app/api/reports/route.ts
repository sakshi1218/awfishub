import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const employeeId = searchParams.get('employeeId');

    const [employees, departments, tasks, reports, visits, agreements, attendances, leaves] =
      await Promise.all([
        prisma.employee.findMany({
          where: {
            departmentId: departmentId || undefined,
            id: employeeId || undefined,
          },
          include: { department: true },
        }),
        prisma.department.findMany({ include: { employees: true } }),
        prisma.task.findMany({
          where: {
            departmentId: departmentId || undefined,
            assignedToId: employeeId || undefined,
          },
          include: { assignedTo: true, assignedBy: true, department: true },
        }),
        prisma.dailyReport.findMany({
          where: {
            employeeId: employeeId || undefined,
            employee: departmentId ? { departmentId } : undefined,
          },
          include: { employee: true },
        }),
        prisma.collegeVisit.findMany({
          where: { visitedById: employeeId || undefined },
          include: { college: true, visitedBy: true },
        }),
        prisma.collegeAgreement.findMany({
          include: { college: true },
        }),
        prisma.attendance.findMany({
          where: { employeeId: employeeId || undefined },
          include: { employee: true },
        }),
        prisma.leaveRequest.findMany({
          where: { employeeId: employeeId || undefined },
          include: { employee: true },
        }),
      ]);

    return NextResponse.json({
      employees,
      departments,
      tasks,
      reports,
      visits,
      agreements,
      attendances,
      leaves,
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
