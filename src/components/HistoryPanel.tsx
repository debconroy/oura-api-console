"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { HttpMethod, HistoryRequest, HistoryData, HistorySession } from "@/lib/types";

interface HistoryPanelProps {
  onLoadRequest: (request: HistoryRequest) => void;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-method-get",
  POST: "bg-method-post",
};

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 400 && status < 500) return "text-warning";
  if (status >= 500) return "text-error";
  return "text-text-tertiary";
}

export default function HistoryPanel({ onLoadRequest }: HistoryPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<HistoryData>({ sessions: [] });
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set(),
  );
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const json: HistoryData = await res.json();
        setData(json);
      }
    } catch {
      // Silently ignore fetch errors
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!expanded) return;
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [expanded, fetchHistory]);

  useEffect(() => {
    if (editingLabel && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingLabel]);

  const totalRequests = data.sessions.reduce(
    (sum, s) => sum + s.requests.length,
    0,
  );

  const toggleSession = (id: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const postAction = async (action: string, payload?: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      if (res.ok) {
        await fetchHistory();
      }
    } catch {
      // Silently ignore errors
    }
  };

  const handleNewSession = () => {
    postAction("createSession");
  };

  const handleClearAll = () => {
    if (confirm("Clear all history? This cannot be undone.")) {
      postAction("clearAll");
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Delete this session?")) {
      postAction("deleteSession", { sessionId });
    }
  };

  const startEditing = (session: HistorySession) => {
    setEditingLabel(session.id);
    setEditValue(session.label);
  };

  const saveLabel = (sessionId: string) => {
    if (editValue.trim()) {
      postAction("updateLabel", { sessionId, label: editValue.trim() });
    }
    setEditingLabel(null);
  };

  return (
    <div className="border-t border-border">
      {/* Toggle bar */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(!expanded); }}
        className="w-full flex items-center justify-between px-5 py-2 hover:bg-surface-raised transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-text-tertiary text-[10px]">{expanded ? "\u25B2" : "\u25BC"}</span>
          <span className="text-xs font-medium text-text-secondary">History</span>
          {totalRequests > 0 && (
            <span className="bg-surface-raised text-text-tertiary text-[10px] px-1.5 py-px rounded-full font-mono">
              {totalRequests}
            </span>
          )}
        </div>
        <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleNewSession}
            className="text-[11px] text-accent/70 hover:text-accent transition-colors"
          >
            New Session
          </button>
          <button
            onClick={handleClearAll}
            className="text-[11px] text-text-tertiary hover:text-error transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Panel content */}
      {expanded && (
        <div className="max-h-96 overflow-auto px-5 pb-3">
          {data.sessions.length === 0 ? (
            <p className="text-text-tertiary text-xs py-3">
              No history yet
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.sessions.map((session) => (
                <div key={session.id} className="border border-border rounded-lg overflow-hidden shadow-sm">
                  {/* Session header */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-raised/50">
                    <button
                      onClick={() => toggleSession(session.id)}
                      className="text-text-tertiary hover:text-text-primary text-[10px] transition-colors"
                    >
                      {expandedSessions.has(session.id) ? "\u25BC" : "\u25B6"}
                    </button>
                    {editingLabel === session.id ? (
                      <input
                        ref={editRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveLabel(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveLabel(session.id);
                        }}
                        className="bg-surface border border-border rounded px-1.5 text-xs text-text-primary flex-1 focus:border-accent/50 transition-colors"
                      />
                    ) : (
                      <span
                        className="text-xs text-text-secondary flex-1 cursor-pointer hover:text-text-primary transition-colors"
                        onDoubleClick={() => startEditing(session)}
                      >
                        {session.label}
                      </span>
                    )}
                    <span className="text-[10px] text-text-tertiary font-mono">
                      {session.requests.length}
                    </span>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-[11px] text-text-tertiary hover:text-error transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Session requests */}
                  {expandedSessions.has(session.id) && (
                    <div className="flex flex-col">
                      {session.requests.length === 0 ? (
                        <p className="text-text-tertiary text-xs px-3 py-2">
                          No requests in this session
                        </p>
                      ) : (
                        session.requests.map((req) => (
                          <div key={req.id} className="border-t border-border-subtle">
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedRequest(expandedRequest === req.id ? null : req.id); }}
                              className={`flex items-center gap-2 px-3 py-1.5 text-left hover:bg-surface-raised transition-colors cursor-pointer ${expandedRequest === req.id ? "bg-surface-raised/50" : ""}`}
                            >
                              <span className="text-text-tertiary text-[10px]">
                                {expandedRequest === req.id ? "\u25BC" : "\u25B6"}
                              </span>
                              <span
                                className={`${METHOD_COLORS[req.method]} min-w-[2.25rem] text-center px-1 py-px rounded text-[10px] font-bold font-mono text-white/90`}
                              >
                                {req.method}
                              </span>
                              <span className="text-xs text-text-secondary flex-1 truncate">
                                {req.endpoint}
                              </span>
                              <span
                                className={`text-[11px] font-mono ${getStatusColor(req.status)}`}
                              >
                                {req.status}
                              </span>
                              <span className="text-[10px] text-text-tertiary/50 font-mono">
                                {new Date(req.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {expandedRequest === req.id && (
                              <div className="px-3 py-2.5 bg-surface/50 text-xs space-y-2 border-t border-border-subtle">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-text-tertiary font-mono text-[11px] truncate flex-1">
                                    {req.method} {req.url}
                                  </span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onLoadRequest(req); }}
                                    className="text-accent/70 hover:text-accent text-[11px] px-2 py-0.5 border border-accent-muted hover:border-accent rounded transition-colors shrink-0"
                                  >
                                    Load
                                  </button>
                                </div>
                                <div className="flex gap-2 text-text-tertiary text-[11px]">
                                  <span>{req.status} {req.statusText}</span>
                                  <span className="text-text-tertiary/30">&middot;</span>
                                  <span className="font-mono">{req.durationMs}ms</span>
                                </div>
                                {req.requestBody != null && (
                                  <div>
                                    <span className="text-text-tertiary/60 block mb-1 text-[10px] uppercase tracking-wider font-semibold">Request Body</span>
                                    <pre className="bg-surface rounded p-2 overflow-auto max-h-32 text-text-secondary font-mono whitespace-pre-wrap text-[11px] border border-border-subtle leading-relaxed">{typeof req.requestBody === "string" ? req.requestBody : JSON.stringify(req.requestBody, null, 2)}</pre>
                                  </div>
                                )}
                                <div>
                                  <span className="text-text-tertiary/60 block mb-1 text-[10px] uppercase tracking-wider font-semibold">Response</span>
                                  <pre className="bg-surface rounded p-2 overflow-auto max-h-48 text-text-secondary font-mono whitespace-pre-wrap text-[11px] border border-border-subtle leading-relaxed">{typeof req.responseBody === "string" ? req.responseBody : JSON.stringify(req.responseBody, null, 2)}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
