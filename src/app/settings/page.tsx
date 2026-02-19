import SettingsForm from "@/components/SettingsForm";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
            <p className="text-xs text-text-tertiary mt-0.5">OAuth credentials for Oura Ring API</p>
          </div>
          <Link
            href="/"
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Back to Console
          </Link>
        </div>
        <div className="bg-surface rounded-xl p-6 border border-border shadow-sm">
          <h2 className="text-sm font-semibold text-text-primary mb-1">OAuth Credentials</h2>
          <p className="text-xs text-text-tertiary mb-6">
            Saved to disk and persist across server restarts.
          </p>
          <SettingsForm />
        </div>
      </div>
    </div>
  );
}
