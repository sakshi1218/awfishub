import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const allEmployees = await prisma.employee.findMany({
      include: {
        department: true,
        reportingManager: true,
        reportingDirector: true,
      },
      orderBy: { name: 'asc' },
    });

    // Founder
    const founder = allEmployees.find((e) => e.role === 'FOUNDER');

    // Directors reporting to Founder
    const directors = allEmployees.filter(
      (e) => e.role === 'DIRECTOR' || e.role === 'SALES_DIRECTOR'
    );

    // Build tree
    const tree = founder
      ? {
          ...founder,
          children: directors.map((director) => {
            // Managers reporting to this director
            const managers = allEmployees.filter(
              (e) => e.role === 'MANAGER' && (e.reportingDirectorId === director.id || e.reportingManagerId === director.id)
            );

            // Direct employees reporting to this director (not under a manager)
            const directReports = allEmployees.filter(
              (e) =>
                (e.role === 'EMPLOYEE' || e.role === 'SALES_EMPLOYEE') &&
                e.reportingDirectorId === director.id &&
                !e.reportingManagerId
            );

            return {
              ...director,
              children: [
                ...managers.map((manager) => {
                  const subordinates = allEmployees.filter(
                    (e) => e.reportingManagerId === manager.id
                  );
                  return {
                    ...manager,
                    children: subordinates,
                  };
                }),
                ...directReports.map((emp) => ({
                  ...emp,
                  children: [],
                })),
              ],
            };
          }),
        }
      : null;

    return NextResponse.json({ tree, allEmployees });
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    return NextResponse.json({ error: 'Failed to fetch hierarchy' }, { status: 500 });
  }
}
