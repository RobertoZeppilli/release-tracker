import { account } from "./account";
import { attributions } from "./attributions";
import { catalog } from "./catalog";
import { contact } from "./contact";
import { dashboard } from "./dashboard";
import { doc } from "./doc";
import { faq } from "./faq";
import { landing } from "./landing";
import { notification } from "./notification";
import { page } from "./page";
import { path } from "./path";
import { privacy } from "./privacy";
import { release } from "./release";
import { settings } from "./settings";
import { stack } from "./stack";
import { terms } from "./terms";
import { shell } from "./shell";
import { summary } from "./summary";

// The English dictionary, one namespace per file so no file here grows past reading length and the
// namespaces stay the unit a page can be given on its own.
export const EN = {
  ...shell,
  ...account,
  ...attributions,
  ...catalog,
  ...contact,
  ...dashboard,
  ...doc,
  ...faq,
  ...landing,
  ...notification,
  ...page,
  ...path,
  ...privacy,
  ...release,
  ...settings,
  ...stack,
  ...summary,
  ...terms,
} as const;

// The shape every other language has to fill. It is derived from the English dictionary rather than
// declared beside it, so a key added to a namespace is a key the other languages are asked for by
// the compiler, not by a reviewer who remembered.
export type MessageKey = keyof typeof EN;
