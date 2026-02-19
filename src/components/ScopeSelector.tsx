"use client";

import { SCOPES } from "@/lib/endpoints";

interface ScopeSelectorProps {
  selectedScopes: string[];
  onChange: (scopes: string[]) => void;
}

export default function ScopeSelector({
  selectedScopes,
  onChange,
}: ScopeSelectorProps) {
  const handleToggle = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      onChange(selectedScopes.filter((s) => s !== scope));
    } else {
      onChange([...selectedScopes, scope]);
    }
  };

  const handleSelectAll = () => {
    onChange(SCOPES.map((s) => s.scope));
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">OAuth Scopes</h3>
        <div className="flex gap-3">
          <button
            onClick={handleSelectAll}
            className="text-[11px] text-accent/70 hover:text-accent transition-colors"
          >
            Select All
          </button>
          <button
            onClick={handleClear}
            className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {SCOPES.map((scopeDef) => (
          <label
            key={scopeDef.id}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
              selectedScopes.includes(scopeDef.scope)
                ? "bg-accent/5 hover:bg-accent/10"
                : "hover:bg-surface-raised"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedScopes.includes(scopeDef.scope)}
              onChange={() => handleToggle(scopeDef.scope)}
              className="accent-accent rounded"
            />
            <span className={`text-xs ${selectedScopes.includes(scopeDef.scope) ? "text-text-primary" : "text-text-secondary"}`}>
              {scopeDef.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
