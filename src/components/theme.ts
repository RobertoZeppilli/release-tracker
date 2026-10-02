import { z } from "zod";

export const ThemeSchema = z.enum(["dark", "light"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const THEME_STORAGE_KEY = "theme";

// Runs before first paint so a stored light theme never flashes dark. Dark is the default.
// It writes the attribute in both directions, and `<html>` ships without one, because `data-theme`
// must not be a React prop: a boundary that renders the root again on the client (the 404 and the
// error page do) would set the prop back and throw the stored theme away.
export const themeInitScript = `try{document.documentElement.dataset.theme=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;
