import Form from "next/form";
import type { ReactNode } from "react";
import { SeverityLabel } from "./severity-label";

export type FormMessage = { tone: "breaking" | "muted"; label: string; body: ReactNode };

// The field and the button of a version control, exported because the Technology page has a second
// one beside this form (the Version in use) and the two have to be the same control, not two that
// look nearly alike.
export const VERSION_BUTTON_CLASS =
  "inline-flex h-[34px] cursor-pointer items-center rounded-md border border-rule-strong bg-transparent px-3 font-sans text-diagnostic font-medium text-text hover:border-text-faint hover:bg-raised disabled:cursor-not-allowed disabled:border-rule disabled:text-text-faint";

export const VERSION_INPUT_CLASS =
  "h-[38px] w-[14ch] rounded-md border border-rule-strong bg-sunken px-3 font-mono text-body text-text placeholder:text-text-faint hover:border-text-faint aria-invalid:border-breaking";

// A plain GET form: `?from=<version>` lands in the URL, so the path can be shared and reloaded.
export function UpgradeForm({
  action,
  latest,
  versions,
  value,
  message,
}: {
  action: string;
  latest: string;
  versions: string[];
  value: string;
  message: FormMessage | null;
}) {
  return (
    <Form action={action} className="mt-6 flex flex-wrap items-center gap-3 font-mono text-diagnostic text-text-muted">
      <label htmlFor="from">Upgrade from</label>
      <input
        key={value}
        id="from"
        name="from"
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
      <span>to</span>
      <span className="text-text">{latest}</span>
      <button type="submit" className={VERSION_BUTTON_CLASS}>
        Check
      </button>
      {message && (
        <p id="from-message" className={`m-0 basis-full ${message.tone === "breaking" ? "text-breaking" : "text-text-muted"}`}>
          <SeverityLabel tone={message.tone} label={message.label} /> {message.body}
        </p>
      )}
    </Form>
  );
}
