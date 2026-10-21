import type { MessageDictionary } from "../index";
import { account } from "./account";
import { catalog } from "./catalog";
import { dashboard } from "./dashboard";
import { page } from "./page";
import { path } from "./path";
import { release } from "./release";
import { settings } from "./settings";
import { shell } from "./shell";
import { stack } from "./stack";
import { summary } from "./summary";

// Italian, one namespace per file, the same ten files English has. Typed as the whole dictionary and
// not as a partial one, so a key added to English is a key the compiler asks Italian for: the parity
// test is the net, and this is the thing that catches it before the test runs.
export const IT: MessageDictionary = {
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
};
