import { NextResponse } from "next/server";
import { submitInquiry } from "@/lib/actions/inquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const result = await submitInquiry(payload);

  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json(result, { status: 201 });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
