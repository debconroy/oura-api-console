"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import EndpointCatalog from "@/components/EndpointCatalog";
import RequestBuilder from "@/components/RequestBuilder";
import ResponseViewer from "@/components/ResponseViewer";
import HistoryPanel from "@/components/HistoryPanel";
import ScopeSelector from "@/components/ScopeSelector";
import ThemeToggle from "@/components/ThemeToggle";
import { SCOPES } from "@/lib/endpoints";
import type { EndpointDef, AuthStatus, HistoryRequest, HttpMethod } from "@/lib/types";

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  durationMs: number;
}

interface LastRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

export default function HomePage() {
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointDef | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    expiresAt: null,
    scopes: [],
  });
  const [hasCredentials, setHasCredentials] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    SCOPES.map((s) => s.scope),
  );
  const [showScopes, setShowScopes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [lastRequest, setLastRequest] = useState<LastRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        setAuthStatus({
          authenticated: data.authenticated,
          expiresAt: data.expiresAt,
          scopes: data.scopes,
        });
        setHasCredentials(data.hasCredentials ?? false);
      }
    } catch {
      // Silently ignore fetch errors
    }
  }, []);

  useEffect(() => {
    fetchAuthStatus();
    const interval = setInterval(fetchAuthStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchAuthStatus]);

  const handleAuthorize = () => {
    const scopeParam = selectedScopes.join(" ");
    window.location.href = `/api/auth/authorize?scopes=${encodeURIComponent(scopeParam)}`;
  };

  const handleRevoke = async () => {
    try {
      await fetch("/api/auth/revoke", { method: "POST" });
      await fetchAuthStatus();
      setResponse(null);
      setLastRequest(null);
      setError(null);
    } catch {
      // Silently ignore errors
    }
  };

  const handleSend = async (request: {
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body: unknown | null;
    endpointId: string;
  }) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setLastRequest({
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
    });

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body ? JSON.stringify(request.body) : null,
          endpointId: request.endpointId,
        }),
      });

      const data = await res.json();

      if (data.error && !data.status) {
        setError(data.error);
      } else {
        setResponse({
          status: data.status,
          statusText: data.statusText,
          headers: data.headers,
          body: data.body,
          durationMs: data.durationMs,
        });
      }
    } catch {
      setError("Failed to send request. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromHistory = (req: HistoryRequest) => {
    setLastRequest({
      method: req.method,
      url: req.url,
      headers: req.requestHeaders,
      body: req.requestBody,
    });
    setResponse({
      status: req.status,
      statusText: req.statusText,
      headers: req.responseHeaders,
      body: req.responseBody,
      durationMs: req.durationMs,
    });
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <h1 className="text-sm font-semibold tracking-tight text-text-primary">
            Oura API Console
          </h1>
          <span className="text-xs font-mono text-text-tertiary">v2</span>
        </div>

        <div className="flex items-center gap-2">
          {authStatus.authenticated ? (
            <>
              <div className="flex items-center gap-1.5 mr-1">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-xs text-text-secondary">
                  {authStatus.scopes.length} {authStatus.scopes.length === 1 ? "scope" : "scopes"}
                </span>
              </div>
              <button
                onClick={() => setShowScopes(!showScopes)}
                className="text-xs text-text-secondary hover:text-text-primary border border-border hover:border-text-tertiary px-2.5 py-1 rounded transition-colors"
              >
                Scopes
              </button>
              <button
                onClick={handleAuthorize}
                className="text-xs text-accent hover:text-accent-light border border-accent-muted hover:border-accent px-2.5 py-1 rounded transition-colors"
              >
                Re-authorize
              </button>
              <button
                onClick={handleRevoke}
                className="text-xs text-error/80 hover:text-error border border-error/20 hover:border-error/40 px-2.5 py-1 rounded transition-colors"
              >
                Revoke
              </button>
            </>
          ) : (
            <>
              {!hasCredentials && (
                <span className="text-xs text-warning/80 mr-1">
                  Configure credentials first
                </span>
              )}
              <button
                onClick={() => setShowScopes(!showScopes)}
                className="text-xs text-text-secondary hover:text-text-primary border border-border hover:border-text-tertiary px-2.5 py-1 rounded transition-colors"
              >
                Scopes ({selectedScopes.length})
              </button>
              <button
                onClick={handleAuthorize}
                disabled={!hasCredentials}
                title={!hasCredentials ? "Set credentials in Settings first" : "Authorize with Oura"}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  hasCredentials
                    ? "text-accent hover:text-accent-light border-accent-muted hover:border-accent"
                    : "text-text-tertiary/50 border-border/50 cursor-not-allowed"
                }`}
              >
                Authorize
              </button>
            </>
          )}
          <div className="w-px h-4 bg-border mx-1" />
          <Link
            href="/settings"
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Settings
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Scope selector */}
      {showScopes && (
        <div className="border-b border-border bg-surface px-5 py-4 shrink-0">
          <ScopeSelector
            selectedScopes={selectedScopes}
            onChange={setSelectedScopes}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 border-r border-border bg-surface overflow-y-auto py-3 px-2 shrink-0">
          <EndpointCatalog
            activeEndpointId={activeEndpoint?.id ?? null}
            onSelect={(ep) => {
              setActiveEndpoint(ep);
              setResponse(null);
              setLastRequest(null);
              setError(null);
            }}
          />
        </aside>

        {/* Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5">
            <RequestBuilder
              endpoint={activeEndpoint}
              onSend={handleSend}
              loading={loading}
            />
            {(response || error) && (
              <>
                <div className="border-t border-border-subtle my-5" />
                <ResponseViewer
                  response={response}
                  request={lastRequest}
                  error={error}
                />
              </>
            )}
          </div>

          <HistoryPanel onLoadRequest={handleLoadFromHistory} />
        </div>
      </div>
    </div>
  );
}
