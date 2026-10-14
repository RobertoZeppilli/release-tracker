import type { CaretWidth } from "../domain/caret-row";

// DESIGN.md: the caret row is drawn only while its own quote is certain to stay on one line, and
// below that width the cited stretch takes the coral underline inside the quote row instead, which
// stays right however the quote wraps. `caretWidth` says the narrowest viewport a quote survives at;
// this is that answer written as the two classes a well needs.
//
// ⚠️ The breakpoint is the width itself, not one pixel under it: `max-[900px]:` compiles to
// `@media not (min-width: 900px)`, which is *below* 900 and therefore exactly "narrower than the
// width the quote needs". The old map hid at `max-[899px]:`, i.e. it drew the caret row at 899px,
// one pixel short of the column the quote had been measured against.
export const caretClasses: Record<CaretWidth | "never", { caret: string; cited: string }> = {
  641: { caret: "max-[641px]:hidden", cited: "max-[641px]:cited-quote" },
  768: { caret: "max-[768px]:hidden", cited: "max-[768px]:cited-quote" },
  900: { caret: "max-[900px]:hidden", cited: "max-[900px]:cited-quote" },
  1024: { caret: "max-[1024px]:hidden", cited: "max-[1024px]:cited-quote" },
  1240: { caret: "max-[1240px]:hidden", cited: "max-[1240px]:cited-quote" },
  never: { caret: "hidden", cited: "cited-quote" },
};
