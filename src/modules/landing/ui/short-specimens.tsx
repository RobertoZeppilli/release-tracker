import { type Translator } from "@/modules/i18n";
import { Filled, LocaleLink as Link } from "@/modules/i18n/ui";
import { TechnologyMark } from "@/modules/catalog/ui";
import { SPECIMEN } from "../domain/specimen";
import { Band } from "./band";
import { LandingNote } from "./landing-note";

const ROW = "grid grid-cols-[24ch_1fr] gap-5 items-baseline border-b border-rule py-5 max-[640px]:grid-cols-1 max-[640px]:gap-2";
const WHO = "flex items-baseline gap-2 font-sans text-title font-semibold";
const VERSION = "font-mono text-diagnostic text-text-muted";
const WHAT = "font-mono text-diagnostic leading-[1.75] text-text-muted max-w-measure";
const LINK = "border-b border-dashed border-current whitespace-nowrap text-link no-underline hover:border-solid";

// DESIGN.md, Short Specimen: two more real Releases, one row each, and they are the honest half of
// the argument. A landing that shows only its best case teaches a visitor to distrust the first
// ordinary Release they open. Both figures are countable in a public file: Vite 6.0.0 ships a
// 28-line changelog where the two breaking entries are marked by a single `!`, and the body of the
// TypeScript 5.7.2 release is a link to a blog post, which is the `unavailable` state of a Summary.
// Each row points at the Technology page and not at that one Release: what it shows is how a
// Technology reads when its notes are badly shaped, and that is the list rather than one row of it.
// The two names and the two versions are data and stay as they are published; the claim under them
// is the app's own `not enough notes to judge`, read from `release.verdict.unjudged` so the page
// that explains the word and the page that prints it cannot say it differently.
const VITE_LINES = 28;

export function ShortSpecimens({ t }: { t: Translator }) {
  return (
    <Band
      id="thin-title"
      number="02"
      title={t("landing.thin.title")}
      sub={t("landing.thin.sub", { lines: SPECIMEN.totalLines })}
    >
      <ul className="border-t border-rule">
        <li className={ROW}>
          <span className={WHO}>
            <TechnologyMark slug="vite" />
            Vite <span className={VERSION}>6.0.0</span>
          </span>
          <span className={WHAT}>
            <Filled
              text={t("landing.thin.vite")}
              nodes={{
                lines: <span className="text-text">{VITE_LINES}</span>,
                bang: <code>!</code>,
                chore: <code>chore</code>,
                perf: <code>perf</code>,
                link: (
                  <Link href="/technologies/vite" className={LINK}>
                    {t("landing.thin.viteLink")}
                  </Link>
                ),
              }}
            />
          </span>
        </li>
        <li className={ROW}>
          <span className={WHO}>
            <TechnologyMark slug="typescript" />
            TypeScript <span className={VERSION}>5.7.2</span>
          </span>
          <span className={WHAT}>
            <Filled
              text={t("landing.thin.typescript")}
              nodes={{
                blog: <span className="text-text">{t("landing.thin.typescriptBlog")}</span>,
                link: (
                  <Link href="/technologies/typescript" className={LINK}>
                    {t("landing.thin.typescriptLink")}
                  </Link>
                ),
              }}
            />
          </span>
        </li>
      </ul>
      <LandingNote claim={t("release.verdict.unjudged")}>{t("landing.thin.note")}</LandingNote>
    </Band>
  );
}
