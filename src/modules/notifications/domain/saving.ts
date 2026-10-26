import type { Locale } from "@/modules/i18n";

// What a save of the Notification settings leaves behind, which is what the control then shows. The
// value is what the **database** holds now, so a press that failed leaves the switch where the
// database has it rather than where the press hoped: that is the criterion of issue #171.
//
// ⚠️ These types live in `domain` and not beside the Server Actions on purpose: a client component
// may not import a module's `server` folder (the `no-server-import-in-client` rule, ADR 0006), so
// the switch is **handed** its action as a prop by the server component that draws it and reads the
// shape of the answer from here. A type import would trip the same rule, and rightly: the rule is
// about the path, not about what the file happens to contain.
export type Saving = "idle" | "saved" | "failed";

export type SwitchSaved = { status: Saving; enabled: boolean };

export type LocaleSaved = { status: Saving; locale: Locale };

// The shape the two controls take their action in, which is what `useActionState` calls.
export type SaveSwitch = (previous: SwitchSaved, form: FormData) => Promise<SwitchSaved>;

export type SaveLocale = (previous: LocaleSaved, form: FormData) => Promise<LocaleSaved>;

// What the webhook field shows after a save: the hint, which is all a Developer ever reads back of
// their webhook (#172), or null when there is none.
export type WebhookSaved = { status: Saving; hint: string | null };

export type SaveWebhook = (previous: WebhookSaved, form: FormData) => Promise<WebhookSaved>;

// ⚠️ The proof of delivery, which is a send and not a save: a wrong webhook is otherwise discovered
// the day it was needed. `failed` carries what Slack answered, because "it did not work" leaves the
// Developer with nothing to fix.
export type TestSent = { status: "idle" | "sent" | "failed"; error: string | null };

export type SendTest = (previous: TestSent, form: FormData) => Promise<TestSent>;
