import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCredentials, buildAuthUrl } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const { clientId, clientSecret } = getCredentials();

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "OAuth credentials not configured. Set clientId and clientSecret first." },
      { status: 400 },
    );
  }

  const scopes = request.nextUrl.searchParams.get("scopes");
  if (!scopes) {
    return NextResponse.json(
      { error: "Missing required 'scopes' query parameter." },
      { status: 400 },
    );
  }

  // Scopes may be space-separated (OAuth 2.0 standard) or comma-separated
  const scopeList = scopes.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);

  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = buildAuthUrl(scopeList, state);

  const response = NextResponse.redirect(authUrl);

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: false, // localhost
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
