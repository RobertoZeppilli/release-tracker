// What the Technology page says about itself to a search engine. The Catalog description is a few
// words, too short to read as a result on its own, so it is followed by what the page actually
// holds: the Releases, and a Summary for the ones that have one. Nothing here claims more.
import type { Translator } from "@/modules/i18n";

export type TechnologyMeta = { title: string; description: string };

// The Catalog description is data, curated in English, so it is not translated; what follows it is
// (ADR 0008).
export function technologyMeta(
  technology: { name: string; description: string },
  t: Translator,
): TechnologyMeta {
  const holds = t("page.technology.holds", { name: technology.name });
  const described = technology.description.trim();
  return {
    title: t("page.technology.title", { name: technology.name }),
    description: described
      ? t("page.technology.described", { description: sentence(described), holds })
      : holds,
  };
}

function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}
