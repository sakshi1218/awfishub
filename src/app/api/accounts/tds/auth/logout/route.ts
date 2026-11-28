import { NextResponse } from 'next/server';
import { ensureOrigin, revokeTdsSession } from '@/lib/tds-auth';

export async function POST(request: Request) {
  const originError = ensureOrigin(request);
  if (originError) return originError;
  await revokeTdsSession();
  return NextResponse.json({ ok: true });
}

