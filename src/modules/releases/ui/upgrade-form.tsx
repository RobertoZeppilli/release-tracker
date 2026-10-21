import Form from "next/form";
import type { ReactNode } from "react";
import type { Translator } from "@/modules/i18n";
import { SeverityLabel } from "./severity-label";
import { PANEL_CELL_CLASS, PANEL_ROW_CLASS, PanelNoteRow } from "./upgrade-panel";

export type FormMessage = { tone: "breaking" | "muted"; label: string; body: ReactNode };

// The field and the button of a version control, exported because the Technology page has a second
// one beside this form (the Version in use) and the two have to be the same control, not two that
// look nearly alike.
export const VERSION_BUTTON_CLASS =
  "inline-flex h-[34px] cursor-pointer items-center rounded-md border border-rule-strong bg-transparent px-3 font-sans text-diagnostic font-medium text-text hover:border-text-faint hover:bg-raised disabled:cursor-not-allowed disabled:border-rule disabled:text-text-faint";

// 11ch inside the 360px column of the split, where the field and its two buttons share one line,
// and 14ch where the panel has the width of the page (DESIGN.md, Technology, the split).
export const VERSION_INPUT_CLASS =
  "h-[38px] w-[11ch] rounded-md border border-rule-strong bg-sunken px-3 font-mono text-body text-text placeholder:text-text-faint hover:border-text-faint aria-invalid:border-breaking stacked:w-[14ch]";

// A plain GET form: `?from=<version>` lands in the URL, so the path can be shared and reloaded. One
// row of the Upgrade Panel: the label is `from`, the row's share of the panel's grammar, while the
// field keeps `Upgrade from` as its accessible name, which stands on its own wherever a screen
// reader lists the fields of this page. The visible word is inside that name, as WCAG 2.5.3 asks.
export function UpgradeForm({
  action,
  latest,
  versions,
  value,
  message,
  t,
}: {
  action: string;
  latest: string;
  versions: string[];
  value: string;
  message: FormMessage | null;
  t: Translator;
}) {
  return (
    <Form action={action} className="flex flex-col gap-2">
      <div className={PANEL_ROW_CLASS}>
        <label htmlFor="from">{t("path.from")}</label>
        <span className={PANEL_CELL_CLASS}>
          <input
            key={value}
            id="from"
            name="from"
            aria-label={t("path.from.name")}
            defaultValue={value}
            list="versions"
            autoComplete="off"
            spellCheck={false}
            placeholder={latest}
            aria-invalid={message?.tone === "breaking" ? true : undefined}
            aria-describedby={message ? "from-message" : undefined}
            className={VERSION_INPUT_CLASS}
          />
          <datalist id="versions">
            {versions.map((version) => (
              <option key={version} value={version} />
            ))}
          </datalist>
          <button type="submit" className={VERSION_BUTTON_CLASS}>
            {t("path.check")}
          </button>
        </span>
      </div>
      {message && (
        <PanelNoteRow>
          <span id="from-message" className={message.tone === "breaking" ? "text-breaking" : "text-text-muted"}>
            <SeverityLabel tone={message.tone} label={message.label} /> {message.body}
          </span>
        </PanelNoteRow>
      )}
    </Form>
  );
}
