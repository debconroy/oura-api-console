"use client";

import { ENDPOINTS } from "@/lib/endpoints";
import type { EndpointDef, HttpMethod } from "@/lib/types";

interface EndpointCatalogProps {
  activeEndpointId: string | null;
  onSelect: (endpoint: EndpointDef) => void;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-method-get",
  POST: "bg-method-post",
};

export default function EndpointCatalog({
  activeEndpointId,
  onSelect,
}: EndpointCatalogProps) {
  const userEndpoints = ENDPOINTS.filter((ep) => ep.resource === "user");
  const dailyEndpoints = ENDPOINTS.filter((ep) => ep.resource === "daily");
  const detailedEndpoints = ENDPOINTS.filter((ep) => ep.resource === "detailed");
  const tagsEndpoints = ENDPOINTS.filter((ep) => ep.resource === "tags");

  const renderGroup = (label: string, endpoints: EndpointDef[]) => (
    <div className="mb-5">
      <h4 className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-1.5 px-2">
        {label}
      </h4>
      <div className="flex flex-col gap-px">
        {endpoints.map((ep) => (
          <button
            key={ep.id}
            onClick={() => onSelect(ep)}
            title={ep.description}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-[13px] w-full transition-colors ${
              activeEndpointId === ep.id
                ? "bg-accent/10 text-text-primary"
                : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
            }`}
          >
            <span
              className={`${METHOD_COLORS[ep.method]} min-w-[2.75rem] text-center px-1 py-px rounded text-[10px] font-bold font-mono text-white/90`}
            >
              {ep.method}
            </span>
            <span className="truncate">{ep.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <nav>
      {renderGroup("User", userEndpoints)}
      {renderGroup("Daily", dailyEndpoints)}
      {renderGroup("Detailed", detailedEndpoints)}
      {renderGroup("Tags", tagsEndpoints)}
    </nav>
  );
}
