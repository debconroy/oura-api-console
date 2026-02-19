import { NextResponse } from "next/server";
import { revokeToken } from "@/lib/oauth";

export async function POST() {
  try {
    await revokeToken();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token revocation failed";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
