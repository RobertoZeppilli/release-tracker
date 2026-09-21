import { z } from "zod";

export const ThemeSchema = z.enum(["dark", "light"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const THEME_STORAGE_KEY = "theme";

// Runs before first paint so a stored light theme never flashes dark. Dark is the default.
export const themeInitScript = `try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="light")document.documentElement.dataset.theme="light"}catch(e){}`;
