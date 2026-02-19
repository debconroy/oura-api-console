import { NextRequest, NextResponse } from "next/server";
import { getCredentials, setCredentials } from "@/lib/oauth";

export async function GET() {
  const { clientId, clientSecret, redirectUri } = getCredentials();

  return NextResponse.json({
    clientId,
    hasSecret: Boolean(clientSecret),
    redirectUri,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      clientId?: string;
      clientSecret?: string;
      redirectUri?: string;
    };

    if (!body.clientId) {
      return NextResponse.json(
        { error: "clientId is required." },
        { status: 400 },
      );
    }

    const existing = getCredentials();

    // Use provided secret, or keep existing if user left it blank
    const secret = body.clientSecret || existing.clientSecret;
    if (!secret) {
      return NextResponse.json(
        { error: "clientSecret is required." },
        { status: 400 },
      );
    }

    setCredentials({
      clientId: body.clientId,
      clientSecret: secret,
      redirectUri: body.redirectUri || existing.redirectUri || "",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
