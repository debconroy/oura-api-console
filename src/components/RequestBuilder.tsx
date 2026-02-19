"use client";

import { useState, useEffect, useCallback } from "react";
import { resolveUrl } from "@/lib/endpoints";
import type { EndpointDef, HttpMethod } from "@/lib/types";

interface SendPayload {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: unknown | null;
  endpointId: string;
}

interface RequestBuilderProps {
  endpoint: EndpointDef | null;
  onSend: (request: SendPayload) => void;
  loading: boolean;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-method-get",
  POST: "bg-method-post",
};

type Tab = "params" | "body" | "headers";

export default function RequestBuilder({
  endpoint,
  onSend,
  loading,
}: RequestBuilderProps) {
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("params");

  useEffect(() => {
    if (!endpoint) return;
    const initialPath: Record<string, string> = {};
    for (const p of endpoint.pathParams) {
      initialPath[p.name] = p.placeholder;
    }
    setPathValues(initialPath);

    const initialQuery: Record<string, string> = {};
    for (const q of endpoint.queryParams) {
      initialQuery[q.name] = "";
    }
    setQueryValues(initialQuery);

    if (endpoint.bodyTemplate !== null) {
      setBodyText(JSON.stringify(endpoint.bodyTemplate, null, 2));
    } else {
      setBodyText("");
    }

    setActiveTab("params");
  }, [endpoint?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildUrl = useCallback((): string => {
    if (!endpoint) return "";
    const base = resolveUrl(endpoint, pathValues);
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(queryValues)) {
      if (val.trim()) {
        params.set(key, val.trim());
      }
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [endpoint, pathValues, queryValues]);

  const handleSend = () => {
    if (!endpoint) return;
    const url = buildUrl();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    let body: unknown | null = null;
    if (endpoint.hasBody && bodyText.trim()) {
      try {
        body = JSON.parse(bodyText);
      } catch {
        alert("Invalid JSON in request body");
        return;
      }
    }
    onSend({
      method: endpoint.method,
      url,
      headers,
      body,
      endpointId: endpoint.id,
    });
  };

  if (!endpoint) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center">
          <span className="text-text-tertiary text-lg">&#8592;</span>
        </div>
        <span className="text-text-tertiary text-sm">Select an endpoint</span>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "params", label: "Params", show: true },
    { id: "body", label: "Body", show: endpoint.hasBody },
    { id: "headers", label: "Headers", show: true },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Endpoint name */}
      <div>
        <h2 className="text-base font-semibold text-text-primary">{endpoint.name}</h2>
        <p className="text-xs text-text-tertiary mt-0.5">{endpoint.description}</p>
      </div>

      {/* URL bar */}
      <div className="flex items-center gap-2">
        <span
          className={`${METHOD_COLORS[endpoint.method]} min-w-[3.25rem] text-center px-2 py-1.5 rounded text-[11px] font-bold font-mono text-white/90`}
        >
          {endpoint.method}
        </span>
        <input
          type="text"
          readOnly
          value={buildUrl()}
          className="flex-1 bg-surface border border-border rounded px-3 py-1.5 text-sm font-mono text-text-secondary focus:border-accent/50 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover active:bg-accent-active disabled:bg-accent/40 disabled:cursor-not-allowed text-[#1F2958] px-5 py-1.5 rounded text-sm font-semibold transition-colors shadow-sm"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Path params */}
      {endpoint.pathParams.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-2">
            Path Parameters
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {endpoint.pathParams.map((param) => (
              <div key={param.name}>
                <label className="block text-xs text-text-secondary mb-1">
                  {param.name}
                  <span className="text-text-tertiary ml-1.5">{param.description}</span>
                </label>
                <input
                  type="text"
                  value={pathValues[param.name] || ""}
                  onChange={(e) =>
                    setPathValues((prev) => ({
                      ...prev,
                      [param.name]: e.target.value,
                    }))
                  }
                  placeholder={param.placeholder}
                  className="w-full bg-surface border border-border rounded px-2 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent/50 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex gap-px border-b border-border">
          {tabs
            .filter((t) => t.show)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>

        <div className="mt-3">
          {activeTab === "params" && (
            <div>
              {endpoint.queryParams.length === 0 ? (
                <p className="text-text-tertiary text-sm py-2">
                  No query parameters for this endpoint
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {endpoint.queryParams.map((qp) => (
                    <div key={qp.name} className="flex items-center gap-3">
                      <label className="min-w-[130px] text-xs text-text-secondary font-mono">
                        {qp.name}
                        {qp.required && (
                          <span className="text-error ml-1">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={queryValues[qp.name] || ""}
                        onChange={(e) =>
                          setQueryValues((prev) => ({
                            ...prev,
                            [qp.name]: e.target.value,
                          }))
                        }
                        placeholder={qp.description}
                        className="flex-1 bg-surface border border-border rounded px-2 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary/40 focus:border-accent/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "body" && endpoint.hasBody && (
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={12}
              className="w-full bg-surface border border-border rounded px-3 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-tertiary/40 resize-y focus:border-accent/50 transition-colors leading-relaxed"
              placeholder="Request body (JSON)"
            />
          )}

          {activeTab === "headers" && (
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex gap-3 py-1">
                <span className="text-text-tertiary font-mono text-xs min-w-[130px]">
                  Authorization
                </span>
                <span className="text-text-tertiary/60 text-xs">
                  Bearer [attached by proxy]
                </span>
              </div>
              <div className="flex gap-3 py-1">
                <span className="text-text-tertiary font-mono text-xs min-w-[130px]">
                  Content-Type
                </span>
                <span className="text-text-tertiary/60 text-xs">application/json</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
