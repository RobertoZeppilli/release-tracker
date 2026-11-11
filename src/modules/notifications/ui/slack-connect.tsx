"use client";

import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Locale } from "@/modules/i18n";
import { useTranslator } from "@/modules/i18n/ui";
import { VERSION_BUTTON_CLASS } from "@/modules/releases/ui";

// "Add to Slack" (#188), and since #199 the dialog that opens first: the press used to leave for
// Slack's consent screen without saying that Slack would ask for a workspace and a channel.
//
// ⚠️ No `client_id` and no URL of Slack's are built here: the link reaches **this server's** own
// route, and the consent URL is assembled there. The rule of `CLAUDE.md` is that no external call
// leaves the client, and an `href` to slack.com with our credentials in it would be the client
// holding them.
//
// ⚠️ **It is a link and not a button**: with JavaScript off the dialog cannot open and the anchor
// still reaches `/slack/install`, which is the behaviour of #188 unchanged. The script is what turns
// the same anchor into the opening of the dialog, by stopping the navigation itself.
// ⚠️ Not Radix's own `Trigger`: `composeEventHandlers` skips the internal handler when the child has
// prevented the default, so an anchor there either navigates away or never opens the dialog. The open
// state is held here instead, which is one `useState` and no surprise.
export function SlackConnect({ locale }: { locale: Locale }) {
  const t = useTranslator();
  // The locale travels in the query so the return lands on `/settings` in this language: the route
  // lives outside `[locale]`, as the login routes do, and carries it in the `state`.
  const install = `/slack/install?locale=${locale}`;
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <p className="mt-4">
        <a
          href={install}
          onClick={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
          className={VERSION_BUTTON_CLASS}
        >
          {t("settings.notifications.slack.connect")}
        </a>
      </p>
      <DialogContent>
        <DialogTitle>{t("settings.notifications.slack.dialog.title")}</DialogTitle>
        {/* One sentence: what Slack will ask, and nothing else. The thirty day trial this dialog
            used to sit inside left with the Plan (issue #209), and the page behind it had already
            stopped explaining a price in paragraphs on 2026-10-28: the flow is the explanation. */}
        <DialogDescription>{t("settings.notifications.slack.dialog.asks")}</DialogDescription>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a href={install} className={VERSION_BUTTON_CLASS}>
            {t("settings.notifications.slack.dialog.continue")}
          </a>
          <DialogClose className="cursor-pointer border-0 bg-transparent p-0 font-mono text-label text-text-muted underline decoration-dashed hover:text-text">
            {t("settings.notifications.slack.dialog.cancel")}
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
