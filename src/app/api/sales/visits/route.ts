import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const visits = await prisma.collegeVisit.findMany({
      include: {
        college: true,
        visitedBy: {
          select: { id: true, name: true, designation: true },
        },
      },
      orderBy: { visitDate: 'desc' },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error('Error fetching college visits:', error);
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      collegeId,
      visitedById,
      visitDate,
      contactPersonName,
      contactDesignation,
      contactPhone,
      contactEmail,
      purpose,
      discussionDetails,
      outcome,
      interestLevel,
      nextFollowupDate,
    } = body;

    const visit = await prisma.collegeVisit.create({
      data: {
        collegeId,
        visitedById,
        visitDate: new Date(visitDate),
        contactPersonName,
        contactDesignation,
        contactPhone,
        contactEmail,
        purpose,
        discussionDetails,
        outcome: outcome || 'FOLLOWUP_REQUIRED',
        interestLevel: interestLevel || 'MEDIUM',
        nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : null,
      },
      include: {
        college: true,
        visitedBy: true,
      },
    });

    // Also update/sync college contact if not exists
    const existingContact = await prisma.collegeContact.findFirst({
      where: { collegeId, name: contactPersonName },
    });
    if (!existingContact && contactPersonName && contactPhone) {
      await prisma.collegeContact.create({
        data: {
          collegeId,
          name: contactPersonName,
          designation: contactDesignation,
          phone: contactPhone || '',
          email: contactEmail || '',
        },
      });
    }

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error('Error recording college visit:', error);
    return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
  }
}
