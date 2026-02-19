import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated, getValidAccessToken } from "@/lib/oauth";
import {
  getOrCreateCurrentSession,
  addRequestToSession,
  generateRequestId,
} from "@/lib/history";
import type { HistoryRequest, HttpMethod } from "@/lib/types";

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      method: HttpMethod;
      url: string;
      headers?: Record<string, string>;
      body?: string | null;
      endpointId?: string;
    };

    const { method, url, headers: customHeaders, body: requestBody, endpointId } = body;

    // Get a valid access token (auto-refreshes if expired)
    const accessToken = await getValidAccessToken();

    // Build request headers
    const proxyHeaders: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Make the proxied request
    const startTime = Date.now();

    const fetchOptions: RequestInit = {
      method,
      headers: proxyHeaders,
    };

    if (requestBody && method !== "GET") {
      fetchOptions.body = requestBody;
    }

    const response = await fetch(url, fetchOptions);
    const durationMs = Date.now() - startTime;

    // Parse response
    const contentType = response.headers.get("content-type") ?? "";
    let responseBody: unknown;

    if (contentType.includes("application/json")) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    // Collect response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Save to history with REDACTED authorization header
    const redactedHeaders = { ...proxyHeaders };
    if (redactedHeaders.Authorization) {
      redactedHeaders.Authorization = "Bearer [REDACTED]";
    }

    const session = getOrCreateCurrentSession();
    const historyId = generateRequestId();

    const historyRequest: HistoryRequest = {
      id: historyId,
      timestamp: new Date().toISOString(),
      endpoint: endpointId ?? "",
      method,
      url,
      requestHeaders: redactedHeaders,
      requestBody: requestBody ? JSON.parse(requestBody) : null,
      status: response.status,
      statusText: response.statusText,
      responseHeaders,
      responseBody,
      durationMs,
    };

    addRequestToSession(session.id, historyRequest);

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      durationMs,
      historyId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Proxy request failed";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
