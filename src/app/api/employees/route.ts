import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const directorySelect = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  avatarUrl: true,
  designation: true,
  role: true,
  status: true,
  department: { select: { id: true, name: true } },
  reportingManager: { select: { id: true, name: true, designation: true } },
} as const;

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      select: directorySelect,
      orderBy: [{ name: 'asc' }],
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// This application currently has no server-verified identity or session.
// Do not enable mutations based on client role state or request body values.
export async function POST() {
  return NextResponse.json({ error: 'Employee management requires an authenticated administrator session.' }, { status: 401 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Employee management requires an authenticated administrator session.' }, { status: 401 });
}
