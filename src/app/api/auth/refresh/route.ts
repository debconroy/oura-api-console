import { NextResponse } from "next/server";
import { getTokens, refreshAccessToken } from "@/lib/oauth";

export async function POST() {
  const tokens = getTokens();
  if (!tokens) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const refreshed = await refreshAccessToken();
    return NextResponse.json({
      expiresAt: refreshed.expiresAt,
      scopes: refreshed.scopes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token refresh failed";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
