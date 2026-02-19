import { NextResponse } from "next/server";
import { getCredentials, getTokens, isAuthenticated } from "@/lib/oauth";

export async function GET() {
  const { clientId, clientSecret } = getCredentials();
  const tokens = getTokens();

  return NextResponse.json({
    authenticated: isAuthenticated(),
    hasCredentials: Boolean(clientId && clientSecret),
    expiresAt: tokens?.expiresAt ?? null,
    scopes: tokens?.scopes ?? [],
  });
}
