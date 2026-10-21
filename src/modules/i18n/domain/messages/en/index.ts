import { account } from "./account";
import { catalog } from "./catalog";
import { dashboard } from "./dashboard";
import { page } from "./page";
import { path } from "./path";
import { release } from "./release";
import { settings } from "./settings";
import { stack } from "./stack";
import { shell } from "./shell";
import { summary } from "./summary";

// The English dictionary, one namespace per file so no file here grows past reading length and the
// namespaces stay the unit a page can be given on its own.
export const EN = {
  ...shell,
  ...account,
  ...catalog,
  ...dashboard,
  ...page,
  ...path,
  ...release,
  ...settings,
  ...stack,
  ...summary,
} as const;

// The shape every other language has to fill. It is derived from the English dictionary rather than
// declared beside it, so a key added to a namespace is a key the other languages are asked for by
// the compiler, not by a reviewer who remembered.
export type MessageKey = keyof typeof EN;
