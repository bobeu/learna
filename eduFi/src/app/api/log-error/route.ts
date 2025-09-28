import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // For now, just console log. Hook up to your logging platform later.
    // eslint-disable-next-line no-console
    console.error('Client error log:', body);
  } catch {}
  return NextResponse.json({ ok: true });
}


