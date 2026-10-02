"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, ThemeSchema, type Theme } from "./theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function stored(): Theme | null {
  try {
    const parsed = ThemeSchema.safeParse(localStorage.getItem(THEME_STORAGE_KEY));
    return parsed.success ? parsed.data : null;
  } catch {
    // Storage can be unavailable (private mode); the default theme stands.
    return null;
  }
}

function getTheme(): Theme {
  const parsed = ThemeSchema.safeParse(document.documentElement.dataset.theme);
  return parsed.success ? parsed.data : "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark" as const);
  const next: Theme = theme === "dark" ? "light" : "dark";

  // The init script in the head never runs on the shells Next serves for a 404 or for a thrown
  // error: they ship without the layout and are rendered on the client, so the document arrives
  // with no data-theme at all. The toggle owns the attribute, so it is the one that repairs it,
  // and only when nothing wrote it before the first paint.
  useEffect(() => {
    if (document.documentElement.dataset.theme) return;
    document.documentElement.dataset.theme = stored() ?? "dark";
  }, []);

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      className="inline-flex size-[34px] items-center justify-center rounded-md border border-rule-strong text-text hover:border-text-faint hover:bg-raised"
    >
      {theme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
