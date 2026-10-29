"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// The first dialog this app opens (#199). It is the shadcn/ui route, which is the accessible
// primitive restyled on the tokens of `DESIGN.md` (`docs/DECISIONI.md`): Radix brings the focus
// trap, `Esc`, the inert background and the `aria-modal` wiring, and nothing of the default look
// comes with it. ⚠️ No card, no badge, no shadow and no default radius: one 1px `rule-strong`
// border, the `raised` surface, and the same `rounded-md` every other surface in the app uses.
//
// ⚠️ A dialog is never the guard of a destructive act here: the account deletion is a typed word
// checked on the server, by decision (`DESIGN.md`, Delete Account). This one guards nothing -- it
// explains a step that leaves the app before the reader takes it.

export const Dialog = DialogPrimitive.Root;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      {/* The page behind it is dimmed and not blurred: a blur reads as a surface of its own. */}
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ground/80" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100vw-32px)] max-w-measure -translate-x-1/2 -translate-y-1/2",
          "max-h-[calc(100vh-32px)] overflow-y-auto rounded-md border border-rule-strong bg-raised p-5",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("font-sans text-title font-semibold text-text", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-3 max-w-prose font-sans text-meta text-text-muted", className)}
      {...props}
    />
  );
}
