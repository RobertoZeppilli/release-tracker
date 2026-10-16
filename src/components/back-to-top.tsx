"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslator } from "@/modules/i18n/ui";

// Two screens, measured from the top: below that a reader is far enough from the start that getting
// back by dragging is the problem this control exists for, and above it the bar is still in reach of
// a short flick. It is a viewport multiple and not a pixel count, because the distance that feels
// long on a phone is not the one that feels long on a desktop.
const FAR = 2;

// DESIGN.md, Back to Top: the way back to the top of a long page, on the Release page, the landing
// and `/technologies`. It is the second thing in the app allowed to float, and the derogation to
// The One Raised Plane Rule is argued inside that rule: it carries no content and holds no claim, it
// is one button of the system's own shape, and it exists only while the reader is below the second
// screen. It is not in the DOM before that, so there is nothing to tab into and nothing for a screen
// reader to find; with JavaScript off it never appears, and the page keeps the bar it always had.
export function BackToTop() {
  const t = useTranslator();
  const [far, setFar] = useState(false);

  useEffect(() => {
    function read() {
      setFar(window.scrollY > FAR * window.innerHeight);
    }
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  if (!far) return null;

  return (
    // `#content` and not the top of the document: it is the target the skip link already uses, so
    // the two ways of reaching the start of the page agree. 44px and not the system's 34px, because
    // this one is hit while scrolling and WCAG 2.2 asks a target of that size here (issue #133).
    // `ground` and not `raised`: it floats beside the text, and taking a surface of its own is what
    // the derogation does not allow. Below 640px it is anchored bottom left, the corner the last
    // line of the release notes does not end in.
    <a
      href="#content"
      onClick={(event) => {
        const content = document.getElementById("content");
        if (!content) return;
        // The whole point of the control for a keyboard: the focus has to arrive where the page
        // arrives. An anchor moves the scroll and leaves the focus behind unless the target can take
        // it, and `main` cannot on its own.
        event.preventDefault();
        content.setAttribute("tabindex", "-1");
        content.focus();
        window.scrollTo({ top: 0 });
      }}
      className="fixed bottom-4 left-4 z-20 inline-flex size-[44px] items-center justify-center rounded-md border border-rule-strong bg-ground text-text no-underline hover:border-text-faint hover:bg-raised sm:left-auto sm:right-4"
    >
      <ArrowUp aria-hidden strokeWidth={1.75} className="size-4" />
      <span className="sr-only">{t("shell.backToTop")}</span>
    </a>
  );
}
