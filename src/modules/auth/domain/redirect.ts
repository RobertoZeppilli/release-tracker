import { type Locale, localePath, stripLocale } from "@/modules/i18n";

// Where the login sends the Developer back to. Only a path inside this site is accepted: an
// absolute URL, a protocol-relative one (`//evil.test`) or a backslash form (`/\evil.test`, which
// some browsers read as a host) would turn the login into an open redirect.

export const DEFAULT_REDIRECT = "/dashboard";

export function safeRedirectPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/")) return DEFAULT_REDIRECT;
  if (value.startsWith("//")) return DEFAULT_REDIRECT;
  // A backslash reads as a path separator, and browsers strip tabs and newlines before parsing a
  // URL: both can smuggle a host past the two checks above.
  if (value.includes("\\")) return DEFAULT_REDIRECT;
  if (/[\u0000-\u001f\u007f]/.test(value)) return DEFAULT_REDIRECT;
  return value;
}

// The login keeps the language it was reached from: a Developer who was reading `/it/technologies`
// comes back to `/it/technologies`, and the login page in between is Italian too (ADR 0008). The
// language is read off `next` when there is one, which is how every caller holding a pathname gets
// it right without being told; `locale` is for the callers that have no path, like the landing's
// entry action.
export function loginPath(next: string | null | undefined, locale?: Locale): string {
  const { locale: fromNext, path } = stripLocale(safeRedirectPath(next));
  const language = locale ?? fromNext;
  const target = localePath(language, path);
  return `${localePath(language, "/login")}?next=${encodeURIComponent(target)}`;
}
