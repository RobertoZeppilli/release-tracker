import { HelpPointer } from "@/components/help-pointer";
import { type Translator } from "@/modules/i18n";
import { EntryAction } from "./entry-action";
import { LandingNote } from "./landing-note";

// The close, on the same split the page opened on: the invitation on the left, the counter-position
// on the right. What the product is not has no band of its own any more (DESIGN.md,
// Counter-Position Note): a whole band gave the counter-argument the weight of the demonstration,
// and beside the closing claim it is read by whoever is still weighing the decision.
//
// The two actions appear here for the second and last time: the first screen has them and the page
// ends with them, and nowhere in between.
export function ClosingBlock({
  catalogSize,
  followLimit,
  t,
}: {
  catalogSize: number;
  followLimit: number;
  t: Translator;
}) {
  return (
    <div
      data-arrival=""
      className="grid grid-cols-2 items-start gap-8 border-t border-rule pt-8 max-[1040px]:grid-cols-1 max-[1040px]:gap-7"
    >
      <div>
        <p className="max-w-[22ch] font-mono text-status">{t("landing.close.claim", { count: followLimit })}</p>
        <p className="mt-4 font-sans text-body text-text-muted">
          {t("landing.close.plan", { limit: followLimit, size: catalogSize })}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <EntryAction />
          <HelpPointer href="/technologies">{t("landing.close.browse", { count: catalogSize })}</HelpPointer>
        </div>
      </div>
      <LandingNote claim={t("landing.close.note.claim")} flush>
        {t("landing.close.note.body")}
      </LandingNote>
    </div>
  );
}
