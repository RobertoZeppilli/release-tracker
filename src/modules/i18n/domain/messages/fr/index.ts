import type { MessageDictionary } from "../index";
import { account } from "./account";
import { attributions } from "./attributions";
import { catalog } from "./catalog";
import { contact } from "./contact";
import { dashboard } from "./dashboard";
import { doc } from "./doc";
import { faq } from "./faq";
import { landing } from "./landing";
import { page } from "./page";
import { path } from "./path";
import { privacy } from "./privacy";
import { release } from "./release";
import { settings } from "./settings";
import { shell } from "./shell";
import { stack } from "./stack";
import { summary } from "./summary";
import { terms } from "./terms";

// French, one namespace per file, the same files English has. Typed as the whole dictionary and not
// as a partial one, so a key added to English is a key the compiler asks this language for: the
// parity test is the net, and this is the thing that catches it before the test runs.
// ⚠️ Not reviewed by a native speaker, and to be reviewed before the launch (ADR 0008).
export const FR: MessageDictionary = {
  ...shell,
  ...account,
  ...attributions,
  ...catalog,
  ...contact,
  ...dashboard,
  ...doc,
  ...faq,
  ...landing,
  ...page,
  ...path,
  ...privacy,
  ...release,
  ...settings,
  ...stack,
  ...summary,
  ...terms,
};
