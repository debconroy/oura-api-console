import fs from "fs";
import path from "path";
import type { OAuthCredentials, OAuthTokens } from "./types";

// ---------------------------------------------------------------------------
// File-based credential storage (survives server restarts / HMR)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const CREDS_FILE = path.join(DATA_DIR, "credentials.json");

function readCredsFromDisk(): OAuthCredentials | null {
  try {
    if (fs.existsSync(CREDS_FILE)) {
      const raw = fs.readFileSync(CREDS_FILE, "utf-8");
      const parsed = JSON.parse(raw) as OAuthCredentials;
      if (parsed.clientId && parsed.clientSecret) {
        return parsed;
      }
    }
  } catch {
    // Ignore read errors — fall through to .env
  }
  return null;
}

function writeCredsToDisk(creds: OAuthCredentials): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2), "utf-8");
  } catch {
    // Best-effort persist — in-memory still works
  }
}

export function getCredentials(): OAuthCredentials {
  const fromDisk = readCredsFromDisk();
  if (fromDisk) {
    return fromDisk;
  }
  return {
    clientId: process.env.OURA_CLIENT_ID ?? "",
    clientSecret: process.env.OURA_CLIENT_SECRET ?? "",
    redirectUri: process.env.OURA_REDIRECT_URI ?? "",
  };
}

export function setCredentials(creds: OAuthCredentials): void {
  writeCredsToDisk(creds);
}

// ---------------------------------------------------------------------------
// File-based token storage (survives server restarts / HMR)
// ---------------------------------------------------------------------------

const TOKENS_FILE = path.join(DATA_DIR, "tokens.json");

function readTokensFromDisk(): OAuthTokens | null {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const raw = fs.readFileSync(TOKENS_FILE, "utf-8");
      return JSON.parse(raw) as OAuthTokens;
    }
  } catch {
    // Ignore read errors
  }
  return null;
}

function writeTokensToDisk(tokens: OAuthTokens | null): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (tokens) {
      fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), "utf-8");
    } else if (fs.existsSync(TOKENS_FILE)) {
      fs.unlinkSync(TOKENS_FILE);
    }
  } catch {
    // Best-effort
  }
}

export function getTokens(): OAuthTokens | null {
  return readTokensFromDisk();
}

export function setTokens(tokens: OAuthTokens): void {
  writeTokensToDisk(tokens);
}

export function clearTokens(): void {
  writeTokensToDisk(null);
}

export function isAuthenticated(): boolean {
  const tokens = getTokens();
  return tokens !== null && !isTokenExpired();
}

export function isTokenExpired(): boolean {
  const tokens = getTokens();
  if (!tokens) {
    return false;
  }
  return Date.now() >= tokens.expiresAt;
}

// ---------------------------------------------------------------------------
// OAuth flow helpers — Oura OAuth 2.0
// ---------------------------------------------------------------------------

const OURA_AUTH_URL = "https://cloud.ouraring.com/oauth/authorize";
const OURA_TOKEN_URL = "https://api.ouraring.com/oauth/token";

export function buildAuthUrl(scopes: string[], state?: string): string {
  const creds = getCredentials();

  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: creds.redirectUri,
    response_type: "code",
    scope: scopes.join("+"),
  });

  if (state) {
    params.set("state", state);
  }

  return `${OURA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
): Promise<OAuthTokens> {
  const creds = getCredentials();

  const res = await fetch(OURA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      redirect_uri: creds.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errorBody}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };

  const tokens: OAuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    scopes: [], // Oura doesn't return scopes in token response
  };

  setTokens(tokens);
  return tokens;
}

export async function refreshAccessToken(): Promise<OAuthTokens> {
  const existing = getTokens();
  if (!existing?.refreshToken) {
    throw new Error("No refresh token available");
  }

  const creds = getCredentials();

  const res = await fetch(OURA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: existing.refreshToken,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${errorBody}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  const tokens: OAuthTokens = {
    accessToken: data.access_token,
    refreshToken: existing.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    scopes: existing.scopes,
  };

  setTokens(tokens);
  return tokens;
}

export async function revokeToken(): Promise<void> {
  // Oura doesn't document a revocation endpoint — clear tokens locally
  clearTokens();
}

export async function getValidAccessToken(): Promise<string> {
  const tokens = getTokens();
  if (!tokens) {
    throw new Error("Not authenticated");
  }

  if (isTokenExpired()) {
    const refreshed = await refreshAccessToken();
    return refreshed.accessToken;
  }

  return tokens.accessToken;
}
