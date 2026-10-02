import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

// Temporary token specimen for issue #2; the landing page (#26) replaces it.

const colors = [
  { name: "ground", swatch: "bg-ground" },
  { name: "raised", swatch: "bg-raised" },
  { name: "sunken", swatch: "bg-sunken" },
  { name: "rule", swatch: "bg-rule" },
  { name: "rule-strong", swatch: "bg-rule-strong" },
  { name: "text", swatch: "bg-text" },
  { name: "text-muted", swatch: "bg-text-muted" },
  { name: "text-faint", swatch: "bg-text-faint" },
  { name: "breaking", swatch: "bg-breaking" },
  { name: "breaking-wash", swatch: "bg-breaking-wash" },
  { name: "action", swatch: "bg-action" },
  { name: "help", swatch: "bg-help" },
  { name: "help-wash", swatch: "bg-help-wash" },
  { name: "ok", swatch: "bg-ok" },
];

const type = [
  { name: "verdict", className: "font-mono text-verdict", sample: "ok: safe to upgrade" },
  { name: "status", className: "font-mono text-status text-text-muted", sample: "pending: summary queued" },
  { name: "headline", className: "font-sans text-headline font-semibold", sample: "Vite" },
  { name: "summary-title", className: "font-sans text-summary-title font-medium", sample: "Environment API and new defaults" },
  { name: "title", className: "font-sans text-title font-medium", sample: "resolve.conditions default changed" },
  { name: "body", className: "font-sans text-body", sample: "Explanations a person reads are set in Hanken Grotesk." },
  { name: "diagnostic", className: "font-mono text-diagnostic tabular-nums", sample: "--> release-notes:12-13" },
  { name: "source", className: "font-mono text-source tabular-nums text-text-muted", sample: "## Breaking changes" },
  { name: "label", className: "font-mono text-label", sample: "technologies / vite / 6.0.0" },
  { name: "section-title", className: "font-mono text-section-title font-semibold text-text-muted", sample: "breaking changes (4)" },
  { name: "meta", className: "font-mono text-meta text-text-faint", sample: "generated 2026-09-21" },
];

const spacing = [
  { step: "1", width: "w-1" },
  { step: "2", width: "w-2" },
  { step: "3", width: "w-3" },
  { step: "4", width: "w-4" },
  { step: "5", width: "w-5" },
  { step: "6", width: "w-6" },
  { step: "7", width: "w-7" },
  { step: "8", width: "w-8" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 font-mono text-section-title font-semibold text-text-muted">
      {children}
      <span aria-hidden className="h-px flex-1 bg-rule" />
    </h2>
  );
}

export default function TokensPage() {
  return (
    <>
      <SiteHeader nav />
      <main id="content" className="mx-auto flex max-w-content flex-col gap-7 px-4 py-6 sm:px-5">
        <h1 className="font-mono text-status text-text-muted">note: design tokens</h1>

        <section className="flex flex-col gap-4" aria-labelledby="colors">
          <SectionTitle>
            <span id="colors">colors ({colors.length})</span>
          </SectionTitle>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(22ch,1fr))] gap-4">
            {colors.map((color) => (
              <li key={color.name} className="flex items-center gap-3 font-mono text-label">
                <span aria-hidden className={cn("size-6 rounded-inline border border-rule", color.swatch)} />
                {color.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="typography">
          <SectionTitle>
            <span id="typography">typography ({type.length})</span>
          </SectionTitle>
          <dl className="grid grid-cols-[14ch_1fr] items-baseline gap-x-4 gap-y-3">
            {type.map((item) => (
              <div key={item.name} className="contents">
                <dt className="font-mono text-label text-text-faint">{item.name}</dt>
                <dd className={item.className}>{item.sample}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="spacing">
          <SectionTitle>
            <span id="spacing">spacing ({spacing.length})</span>
          </SectionTitle>
          <ul className="flex flex-col gap-2">
            {spacing.map((item) => (
              <li key={item.step} className="grid grid-cols-[14ch_1fr] items-center gap-4 font-mono text-label">
                <span className="text-text-faint">{item.step}</span>
                <span aria-hidden className={cn("h-2 bg-text-muted", item.width)} />
              </li>
            ))}
          </ul>
        </section>

        <p className="font-sans text-body text-text-muted">
          Inline <code>code</code> sits on the sunken well.{" "}
          <a href="#colors" className="font-mono text-label text-help underline decoration-dashed">
            --&gt; back to colors
          </a>
        </p>
      </main>
    </>
  );
}
