"use client";

import { useState } from "react";
import JsonViewer from "./JsonViewer";

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  durationMs: number;
}

interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

interface ResponseViewerProps {
  response: ResponseData | null;
  request: RequestData | null;
  error: string | null;
}

type Tab = "response" | "headers" | "rawRequest";

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 400 && status < 500) return "text-warning";
  if (status >= 500) return "text-error";
  return "text-text-tertiary";
}

function getStatusBg(status: number): string {
  if (status >= 200 && status < 300) return "bg-success/10";
  if (status >= 400 && status < 500) return "bg-warning/10";
  if (status >= 500) return "bg-error/10";
  return "bg-surface-raised";
}

function generateCurl(request: RequestData): string {
  const parts: string[] = [`curl -X ${request.method} '${request.url}'`];
  for (const [key, value] of Object.entries(request.headers)) {
    parts.push(`  -H '${key}: ${value}'`);
  }
  if (request.body) {
    const bodyStr =
      typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body);
    parts.push(`  -d '${bodyStr}'`);
  }
  return parts.join(" \\\n");
}

export default function ResponseViewer({
  response,
  request,
  error,
}: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("response");
  const [copied, setCopied] = useState<string | null>(null);

  if (error) {
    return (
      <div className="bg-error/5 border border-error/20 rounded-lg px-4 py-3 text-error text-sm">
        {error}
      </div>
    );
  }

  if (!response) {
    return null;
  }

  const curlCmd = request ? generateCurl(request) : "";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "response", label: "Response" },
    { id: "headers", label: "Headers" },
    { id: "rawRequest", label: "cURL" },
  ];

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <button
      onClick={() => copyToClipboard(text, label)}
      className="text-[11px] text-text-tertiary hover:text-text-secondary border border-border hover:border-text-tertiary px-2 py-0.5 rounded transition-colors"
    >
      {copied === label ? "Copied" : label}
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`${getStatusColor(response.status)} ${getStatusBg(response.status)} font-bold font-mono text-sm px-2 py-0.5 rounded`}
          >
            {response.status}
          </span>
          <span className="text-text-tertiary text-xs">{response.statusText}</span>
          <span className="text-text-tertiary/50 text-xs">&middot;</span>
          <span className="text-text-tertiary text-xs font-mono">{response.durationMs}ms</span>
        </div>
        <div className="flex gap-1.5">
          <CopyButton
            text={typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2)}
            label="JSON"
          />
          <CopyButton text={curlCmd} label="cURL" />
          {request && <CopyButton text={request.url} label="URL" />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-px border-b border-border">
        {tabs.map((tab) => (
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

      {/* Tab content */}
      <div>
        {activeTab === "response" && <JsonViewer data={response.body} />}

        {activeTab === "headers" && (
          <div className="bg-surface rounded-lg p-3 border border-border-subtle shadow-sm">
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(response.headers).map(([key, value]) => (
                  <tr key={key} className="border-b border-border-subtle last:border-0">
                    <td className="py-1.5 pr-4 text-text-tertiary font-mono whitespace-nowrap align-top">
                      {key}
                    </td>
                    <td className="py-1.5 text-text-secondary font-mono break-all">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "rawRequest" && (
          <pre className="bg-surface rounded-lg p-4 text-xs font-mono text-text-secondary overflow-auto whitespace-pre-wrap border border-border-subtle shadow-sm leading-relaxed">{curlCmd}</pre>
        )}
      </div>
    </div>
  );
}
