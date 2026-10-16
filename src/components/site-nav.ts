import type { MessageKey } from "@/modules/i18n";

// The signed-in pages, in the order DESIGN.md gives them. It lives in its own module because both
// shapes of the navigation need it and they sit on opposite sides of the client boundary: the row
// inside the bar is rendered on the server, the rows inside the account sheet by the client
// component that owns the sheet's open state.
// ⚠️ `key` and `message` are two things now, and the split is the point: `key` is the identity a
// page passes as `section` and is never printed, `message` is what the reader sees. They happened
// to be one string while the interface was only English, and a page that said `section="dashboard"`
// would have been comparing a label against a translation (ADR 0008).
export const NAV = [
  { key: "dashboard", message: "shell.nav.dashboard", href: "/dashboard" },
  { key: "technologies", message: "shell.nav.technologies", href: "/technologies" },
] as const satisfies readonly { key: string; message: MessageKey; href: string }[];

export type NavItem = (typeof NAV)[number]["key"];
