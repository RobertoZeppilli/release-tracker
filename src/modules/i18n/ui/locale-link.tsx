"use client";

import NextLink from "next/link";
import { localePath, stripLocale } from "../domain/locales";
import { useLocale } from "./locale-context";

type Props = Omit<React.ComponentProps<typeof NextLink>, "href"> & { href: string };

// Every internal link in the app goes through here, and `next/link` is imported nowhere else: the
// prefix of a language is exactly the kind of thing one link forgets, and a forgotten one drops the
// reader back into English in the middle of a path (ADR 0008).
// An address that is not a path of this site is left alone: `https://`, `mailto:` and `#` have no
// language of ours.
export function LocaleLink({ href, ...props }: Props) {
  const locale = useLocale();
  // `stripLocale` first, so a href that already carries a prefix is not prefixed twice: the links
  // that come out of `loginPath` already know their language, and `/it/it/login` would be a 404.
  const localized = href.startsWith("/") ? localePath(locale, stripLocale(href).path) : href;
  return <NextLink href={localized} {...props} />;
}
