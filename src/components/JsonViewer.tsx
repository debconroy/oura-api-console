"use client";

import { useState, useCallback } from "react";

interface JsonViewerProps {
  data: unknown;
  initialExpanded?: boolean;
}

function JsonNode({ value, depth }: { value: unknown; depth: number }) {
  const [expanded, setExpanded] = useState(true);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  const indent = depth * 16;

  if (value === null) {
    return <span className="text-text-tertiary">null</span>;
  }

  if (typeof value === "string") {
    return <span style={{ color: 'var(--color-json-string)' }}>&quot;{value}&quot;</span>;
  }

  if (typeof value === "number") {
    return <span style={{ color: 'var(--color-json-number)' }}>{String(value)}</span>;
  }

  if (typeof value === "boolean") {
    return <span style={{ color: 'var(--color-json-boolean)' }}>{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-text-tertiary">{"[]"}</span>;
    }

    if (!expanded) {
      return (
        <span>
          <button
            onClick={toggle}
            className="mr-1 text-text-tertiary hover:text-text-primary focus:outline-none transition-colors"
            aria-label="Expand"
          >
            &#9654;
          </button>
          <span className="text-text-tertiary">
            [{value.length} {value.length === 1 ? "item" : "items"}]
          </span>
        </span>
      );
    }

    return (
      <span>
        <button
          onClick={toggle}
          className="mr-1 text-text-tertiary hover:text-text-primary focus:outline-none transition-colors"
          aria-label="Collapse"
        >
          &#9660;
        </button>
        {"["}
        <div>
          {value.map((item, index) => (
            <div key={index} style={{ paddingLeft: indent + 16 }}>
              <JsonNode value={item} depth={depth + 1} />
              {index < value.length - 1 && <span className="text-text-tertiary">,</span>}
            </div>
          ))}
        </div>
        <span style={{ paddingLeft: indent }}>{"]"}</span>
      </span>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 0) {
      return <span className="text-text-tertiary">{"{}"}</span>;
    }

    if (!expanded) {
      return (
        <span>
          <button
            onClick={toggle}
            className="mr-1 text-text-tertiary hover:text-text-primary focus:outline-none transition-colors"
            aria-label="Expand"
          >
            &#9654;
          </button>
          <span className="text-text-tertiary">
            {"{"}
            {entries.length} {entries.length === 1 ? "key" : "keys"}
            {"}"}
          </span>
        </span>
      );
    }

    return (
      <span>
        <button
          onClick={toggle}
          className="mr-1 text-text-tertiary hover:text-text-primary focus:outline-none transition-colors"
          aria-label="Collapse"
        >
          &#9660;
        </button>
        {"{"}
        <div>
          {entries.map(([key, val], index) => (
            <div key={key} style={{ paddingLeft: indent + 16 }}>
              <span style={{ color: 'var(--color-json-key)' }}>&quot;{key}&quot;</span>
              <span className="text-text-tertiary">: </span>
              <JsonNode value={val} depth={depth + 1} />
              {index < entries.length - 1 && <span className="text-text-tertiary">,</span>}
            </div>
          ))}
        </div>
        <span style={{ paddingLeft: indent }}>{"}"}</span>
      </span>
    );
  }

  return <span>{String(value)}</span>;
}

export default function JsonViewer({ data }: JsonViewerProps) {
  return (
    <div className="bg-surface rounded-lg p-4 overflow-auto font-mono text-xs text-text-primary border border-border-subtle shadow-sm leading-relaxed">
      <JsonNode value={data} depth={0} />
    </div>
  );
}
