import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            designation: true,
            role: true,
            status: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description, headOfDepartmentId } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
    }

    const existing = await prisma.department.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Department name or code already exists' }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        headOfDepartmentId: headOfDepartmentId || null,
      },
      include: {
        employees: true,
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, headOfDepartmentId, isActive } = body;

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name,
        description,
        headOfDepartmentId,
        isActive,
      },
      include: {
        employees: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}
