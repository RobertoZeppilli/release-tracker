import { type Translator } from "@/modules/i18n";
import { SignificanceGlyph } from "@/modules/releases/ui";
import { VOCABULARY } from "../domain/vocabulary";
import { Band } from "./band";

// DESIGN.md, Vocabulary Legend: the four Significance words defined in words, under the id
// `significance` so the app can point here. Four columns and not four rows: stacked they were the
// flattest stretch of the page, and side by side they say by their shape that the four words are
// siblings. No boxes and no colour: Significance is a shape (The Neutral Significance Rule), and a
// word that took a hue here would teach the opposite of what the release pages do.
// ⚠️ The four words themselves are never translated: they are the names the app prints on every
// Release, so what the legend translates is the sentence under each one, not the term it defines.
export function VocabularyLegend({ t }: { t: Translator }) {
  return (
    <Band id="words-title" number="03" title={t("landing.words.title")} sub={t("landing.words.sub")}>
      <dl id="significance" className="grid grid-cols-4 gap-5 max-[1040px]:grid-cols-2 max-sm:grid-cols-1">
        {VOCABULARY.map(({ significance, definition }) => (
          <div key={significance} className="border-t border-rule-strong pt-3">
            <dt className="mb-2 inline-flex items-center gap-[6px] font-mono text-label">
              <SignificanceGlyph significance={significance} />
              {significance}
            </dt>
            <dd className="font-sans text-body text-text-muted">{t(definition)}</dd>
          </div>
        ))}
      </dl>
    </Band>
  );
}
