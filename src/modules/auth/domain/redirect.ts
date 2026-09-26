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

export function loginPath(next: string | null | undefined): string {
  const target = safeRedirectPath(next);
  return `/login?next=${encodeURIComponent(target)}`;
}
