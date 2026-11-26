import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const employeeId = searchParams.get('employeeId');
    const departmentId = searchParams.get('departmentId');

    const reports = await prisma.dailyReport.findMany({
      where: {
        reportDate: date || undefined,
        employeeId: employeeId || undefined,
        employee: departmentId ? { departmentId } : undefined,
      },
      include: {
        employee: {
          include: { department: true, reportingManager: true, reportingDirector: true },
        },
        reviewedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also get list of employees who have NOT submitted for a specified date
    let missingEmployees: any[] = [];
    if (date) {
      const submittedEmpIds = reports.map((r) => r.employeeId);
      missingEmployees = await prisma.employee.findMany({
        where: {
          status: 'ACTIVE',
          role: { not: 'FOUNDER' },
          id: { notIn: submittedEmpIds },
          departmentId: departmentId || undefined,
        },
        include: { department: true, reportingManager: true },
      });
    }

    return NextResponse.json({ reports, missingEmployees });
  } catch (error) {
    console.error('Error fetching daily reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      employeeId,
      reportDate,
      tasksWorkedOn,
      tasksCompleted,
      tasksPending,
      timeSpentHours,
      workDescription,
      challengesFaced,
      planForTomorrow,
    } = body;

    if (!employeeId || !reportDate || !workDescription) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Upsert so if employee updates their report for the day, it updates cleanly
    const report = await prisma.dailyReport.upsert({
      where: {
        employeeId_reportDate: {
          employeeId,
          reportDate,
        },
      },
      create: {
        employeeId,
        reportDate,
        tasksWorkedOn: JSON.stringify(tasksWorkedOn || []),
        tasksCompleted: JSON.stringify(tasksCompleted || []),
        tasksPending: JSON.stringify(tasksPending || []),
        timeSpentHours: Number(timeSpentHours) || 8.0,
        workDescription,
        challengesFaced,
        planForTomorrow,
        status: 'SUBMITTED',
      },
      update: {
        tasksWorkedOn: JSON.stringify(tasksWorkedOn || []),
        tasksCompleted: JSON.stringify(tasksCompleted || []),
        tasksPending: JSON.stringify(tasksPending || []),
        timeSpentHours: Number(timeSpentHours) || 8.0,
        workDescription,
        challengesFaced,
        planForTomorrow,
        status: 'SUBMITTED',
      },
      include: {
        employee: {
          include: { reportingManager: true, reportingDirector: true },
        },
      },
    });

    // Notify reporting manager
    if (report.employee.reportingManagerId) {
      await prisma.notification.create({
        data: {
          recipientId: report.employee.reportingManagerId,
          title: `Daily Report: ${report.employee.name}`,
          message: `${report.employee.name} submitted daily work report for ${reportDate}.`,
          type: 'REPORT',
          linkUrl: '/daily-reports',
        },
      });
    }

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error submitting daily report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, reviewComments, reviewedById } = body;

    const updated = await prisma.dailyReport.update({
      where: { id },
      data: {
        status,
        reviewComments,
        reviewedById,
        reviewedAt: new Date(),
      },
      include: {
        employee: true,
        reviewedBy: true,
      },
    });

    // Notify employee of review outcome
    await prisma.notification.create({
      data: {
        recipientId: updated.employeeId,
        title: `Report Review: ${status}`,
        message: `Your daily report for ${updated.reportDate} was reviewed with status ${status}.`,
        type: 'REPORT',
        linkUrl: '/daily-reports',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error reviewing daily report:', error);
    return NextResponse.json({ error: 'Failed to review report' }, { status: 500 });
  }
}
