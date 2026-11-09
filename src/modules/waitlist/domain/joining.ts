// What one try at joining the Waitlist leaves behind, which is what the form then says.
//
// ⚠️ These types live in `domain` and not beside the Server Action on purpose: a client component
// may not import a module's `server` folder (ADR 0006, the `no-server-import-in-client` rule), so
// the form is **handed** its action as a prop by the block that draws it and reads the shape of the
// answer from here. The same arrangement the switches of `/settings` use.
//
// `already` is not a failure and is not drawn like one: the address is on the list, which is what
// the reader wanted. They did nothing wrong by asking twice.
export type Joining = "idle" | "joined" | "already" | "invalid" | "failed";

export type Joined = { status: Joining };

export type JoinWaitlist = (previous: Joined, form: FormData) => Promise<Joined>;

// The field a person never fills and a robot fills every time. It is named like something worth
// filling, because a robot reads the name: `email_confirm` is what a signup form plausibly has.
export const TRAP_FIELD = "email_confirm";

// The field the form carries its language in. The locale cannot be read inside a Server Action
// (`currentLocale` reads a root parameter, which an action has not got), and the language is what
// the one message of the launch day will be written in, so the form states it.
// ⚠️ A form can lie about it. What a lie buys is a launch message in the wrong language, which is
// why this is a hidden field and not a decision taken on anything that matters.
export const LOCALE_FIELD = "locale";

export const EMAIL_FIELD = "email";
