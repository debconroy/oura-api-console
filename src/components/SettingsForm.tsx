"use client";

import { useState, useEffect } from "react";

interface SettingsData {
  clientId: string;
  hasSecret: boolean;
  redirectUri: string;
}

export default function SettingsForm() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [hasExistingSecret, setHasExistingSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data: SettingsData = await res.json();
          setClientId(data.clientId || "");
          setRedirectUri(data.redirectUri || "");
          setHasExistingSecret(data.hasSecret || false);
        }
      } catch {
        // Silently ignore load errors
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!clientId.trim()) {
      setMessage({ type: "error", text: "Client ID is required" });
      return;
    }
    if (!hasExistingSecret && !clientSecret.trim()) {
      setMessage({ type: "error", text: "Client Secret is required" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const body: Record<string, string> = {
        clientId: clientId.trim(),
        redirectUri: redirectUri.trim(),
      };
      if (clientSecret.trim()) {
        body.clientSecret = clientSecret.trim();
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Credentials saved" });
        setClientSecret("");
        setHasExistingSecret(true);
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage({
          type: "error",
          text:
            (errorData as { error?: string }).error ||
            "Failed to save settings",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div>
        <label className="block text-xs text-text-secondary mb-1.5 font-medium">Client ID</label>
        <input
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
          placeholder="Your Oura OAuth client ID"
        />
      </div>

      <div>
        <label className="block text-xs text-text-secondary mb-1.5 font-medium">
          Client Secret
        </label>
        <input
          type="password"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
          placeholder={
            hasExistingSecret
              ? "(set - leave blank to keep)"
              : "Your Oura OAuth client secret"
          }
        />
      </div>

      <div>
        <label className="block text-xs text-text-secondary mb-1.5 font-medium">
          Redirect URI
        </label>
        <input
          type="text"
          value={redirectUri}
          onChange={(e) => setRedirectUri(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
          placeholder="http://localhost:3000/api/auth/callback"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent hover:bg-accent-hover active:bg-accent-active disabled:bg-accent/40 disabled:cursor-not-allowed text-[#1F2958] px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {message && (
          <span
            className={`text-xs ${
              message.type === "success" ? "text-success" : "text-error"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
