"use client";

import { useState, useEffect } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggle = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // Render a placeholder with the same dimensions to prevent layout shift
  if (!mounted) {
    return (
      <button className="text-xs text-text-tertiary px-2 py-1 rounded border border-border w-7 h-7" aria-hidden />
    );
  }

  return (
    <button
      onClick={toggle}
      className="text-xs text-text-tertiary hover:text-text-secondary border border-border hover:border-text-tertiary px-2 py-1 rounded transition-colors"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? "\u263E" : "\u2600"}
    </button>
  );
}
