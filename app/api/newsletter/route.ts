import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const result = await subscribeToNewsletter(payload);

  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }

  // A repeat sign-up is a valid, successful request — it just changed nothing.
  return NextResponse.json(result, { status: result.outcome === "duplicate" ? 200 : 201 });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
