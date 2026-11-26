import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        contacts: true,
        visits: { orderBy: { visitDate: 'desc' } },
        fdpSessions: { orderBy: { sessionDate: 'desc' } },
        agreements: { orderBy: { expiryDate: 'desc' } },
        leads: true,
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, state, city, address, website, tier, type, notes } = body;

    const existing = await prisma.college.findFirst({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: 'College with this name already exists' }, { status: 400 });
    }

    const college = await prisma.college.create({
      data: {
        name,
        code: code || name.substring(0, 4).toUpperCase(),
        state,
        city,
        address,
        website,
        tier: tier || 'TIER_2',
        type: type || 'ENGINEERING',
        notes,
      },
    });

    return NextResponse.json(college, { status: 201 });
  } catch (error) {
    console.error('Error creating college:', error);
    return NextResponse.json({ error: 'Failed to create college' }, { status: 500 });
  }
}
