import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        reportingManager: {
          select: { id: true, name: true, designation: true },
        },
        reportingDirector: {
          select: { id: true, name: true, designation: true },
        },
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      employeeId,
      name,
      email,
      phone,
      designation,
      role,
      departmentId,
      reportingManagerId,
      reportingDirectorId,
      joiningDate,
      status,
      responsibilities,
    } = body;

    // Check unique employeeId and email
    const existing = await prisma.employee.findFirst({
      where: {
        OR: [{ employeeId }, { email }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Employee with this ID or Email already exists' },
        { status: 400 }
      );
    }

    const newEmployee = await prisma.employee.create({
      data: {
        employeeId,
        name,
        email,
        phone,
        designation,
        role: role || 'EMPLOYEE',
        departmentId: departmentId || null,
        reportingManagerId: reportingManagerId || null,
        reportingDirectorId: reportingDirectorId || null,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        status: status || 'ACTIVE',
        responsibilities,
      },
      include: {
        department: true,
        reportingManager: true,
        reportingDirector: true,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Employee',
        entityId: newEmployee.id,
        details: `Created new employee: ${name} (${employeeId}) - ${designation}`,
      },
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      email,
      phone,
      designation,
      role,
      departmentId,
      reportingManagerId,
      reportingDirectorId,
      status,
      responsibilities,
      reasonForChange,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Check previous reporting lines to record in ReportingHistory
    const current = await prisma.employee.findUnique({
      where: { id },
    });

    if (current && (current.reportingManagerId !== reportingManagerId || current.reportingDirectorId !== reportingDirectorId)) {
      await prisma.reportingHistory.create({
        data: {
          employeeId: id,
          previousManagerId: current.reportingManagerId,
          newManagerId: reportingManagerId,
          previousDirectorId: current.reportingDirectorId,
          newDirectorId: reportingDirectorId,
          reason: reasonForChange || 'Organizational restructuring / Promotion',
        },
      });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        designation,
        role,
        departmentId: departmentId || null,
        reportingManagerId: reportingManagerId || null,
        reportingDirectorId: reportingDirectorId || null,
        status,
        responsibilities,
      },
      include: {
        department: true,
        reportingManager: true,
        reportingDirector: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}
