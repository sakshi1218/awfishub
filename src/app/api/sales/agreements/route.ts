import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const agreements = await prisma.collegeAgreement.findMany({
      include: {
        college: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(now.getDate() + 30);

    // Dynamic expiry flag update
    const enhancedAgreements = agreements.map((agr) => {
      let dynamicStatus = agr.agreementStatus;
      const expiry = new Date(agr.expiryDate);
      if (agr.agreementStatus !== 'RENEWED') {
        if (expiry < now) {
          dynamicStatus = 'EXPIRED';
        } else if (expiry <= thirtyDaysAhead) {
          dynamicStatus = 'EXPIRING_SOON';
        } else {
          dynamicStatus = 'ACTIVE';
        }
      }
      return {
        ...agr,
        dynamicStatus,
        daysToExpiry: Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      };
    });

    return NextResponse.json(enhancedAgreements);
  } catch (error) {
    console.error('Error fetching college agreements:', error);
    return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      collegeId,
      agreementType,
      signingDate,
      validityMonths,
      expiryDate,
      authorizedSignatoryMindLyft,
      authorizedSignatoryCollege,
      notes,
    } = body;

    const agreement = await prisma.collegeAgreement.create({
      data: {
        collegeId,
        agreementType: agreementType || 'MOU',
        signingDate: new Date(signingDate),
        validityMonths: Number(validityMonths) || 12,
        expiryDate: new Date(expiryDate),
        authorizedSignatoryMindLyft: authorizedSignatoryMindLyft || 'Director of Sales',
        authorizedSignatoryCollege: authorizedSignatoryCollege || 'Dean / Principal',
        agreementStatus: 'ACTIVE',
        notes,
      },
      include: {
        college: true,
      },
    });

    return NextResponse.json(agreement, { status: 201 });
  } catch (error) {
    console.error('Error creating college agreement:', error);
    return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, agreementStatus, renewalDate, notes } = body;

    const updated = await prisma.collegeAgreement.update({
      where: { id },
      data: {
        agreementStatus,
        renewalDate: renewalDate ? new Date(renewalDate) : undefined,
        notes,
      },
      include: {
        college: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating agreement:', error);
    return NextResponse.json({ error: 'Failed to update agreement' }, { status: 500 });
  }
}
