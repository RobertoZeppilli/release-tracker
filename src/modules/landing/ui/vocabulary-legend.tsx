import { SignificanceGlyph } from "@/modules/releases/ui";
import { VOCABULARY } from "../domain/vocabulary";
import { LandingNote, LandingSectionTitle } from "./landing-note";

// DESIGN.md, Vocabulary Legend: the four Significance words defined in words, under the id
// `significance` so the app can point here. No boxes and no colour: Significance is a shape (The
// Neutral Significance Rule), and a word that took a hue here would teach the opposite of what the
// release pages do.
export function VocabularyLegend() {
  return (
    <section aria-labelledby="words-title">
      <LandingSectionTitle id="words-title">the four words on every release</LandingSectionTitle>
      <dl id="significance" className="max-w-measure border-t border-rule">
        {VOCABULARY.map(({ significance, definition }) => (
          <div
            key={significance}
            className="grid grid-cols-[14ch_1fr] items-baseline gap-4 border-b border-rule py-3 max-[640px]:grid-cols-1 max-[640px]:gap-2"
          >
            <dt className="inline-flex items-center gap-[6px] font-mono text-label">
              <SignificanceGlyph significance={significance} />
              {significance}
            </dt>
            <dd className="font-sans text-body text-text-muted">{definition}</dd>
          </div>
        ))}
      </dl>
      <LandingNote claim="a shape, never a colour">
        Significance is the glyph beside the version, and colour on this product means severity and
        nothing else. A release is not urgent because it is red; it is urgent because its notes say
        so, on a line you can read.
      </LandingNote>
    </section>
  );
}
