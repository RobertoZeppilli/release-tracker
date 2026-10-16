import { z } from "zod";

// A message is either one string, or the forms a count chooses between. The form names are the ones
// `Intl.PluralRules` gives, and `other` is the only required one because it is the only form every
// language has: English has `one` and `other`, and a language with `few` or `many` fills those in
// without the English dictionary having to carry empty slots for them.
export const pluralFormsSchema = z
  .object({
    zero: z.string().optional(),
    one: z.string().optional(),
    two: z.string().optional(),
    few: z.string().optional(),
    many: z.string().optional(),
    other: z.string(),
  })
  .strict();

export type PluralForms = z.infer<typeof pluralFormsSchema>;

export const messageSchema = z.union([z.string(), pluralFormsSchema]);

export type Message = z.infer<typeof messageSchema>;

// Keys are flat and dotted, `footer.product` and not nested objects: a flat record is a record Zod
// validates in one line, and the parity test between two dictionaries is a comparison of two key
// lists instead of a walk of two trees.
export const dictionarySchema = z.record(z.string(), messageSchema);

export type Dictionary = Readonly<Record<string, Message>>;

// What a message interpolates. Numbers are here for `count`, which also chooses the plural form,
// and for anything a sentence prints as a figure; nothing else is accepted, because a message that
// takes a node is a sentence that should be composed in the component instead.
export type MessageParams = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)\}/g;

// The placeholders a message names, which is what the parity test compares between languages: a
// translation that drops `{count}` loses the number, and a translation that invents `{total}` prints
// the braces to the reader.
export function placeholdersOf(message: Message): readonly string[] {
  const texts = typeof message === "string" ? [message] : Object.values(message);
  const found = new Set<string>();
  for (const text of texts) {
    for (const [, name] of text.matchAll(PLACEHOLDER))
      if (name) found.add(name);
  }
  return [...found].sort();
}

export function interpolate(text: string, params: MessageParams = {}): string {
  // A placeholder with nothing to put in it is left as it was written: the braces in the output are
  // the loudest way to say the call forgot a parameter, and silence would ship the gap.
  return text.replace(PLACEHOLDER, (whole, name: string) => {
    const value = params[name];
    return value === undefined ? whole : String(value);
  });
}
