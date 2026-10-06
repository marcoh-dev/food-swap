"use client";

import * as React from "react";
import { useMorph } from "@/lib/cojeev-motion/use-morph";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as Primitive from "@radix-ui/react-dialog";
import { useDirection } from "@radix-ui/react-direction";
import { useFlowAppearance } from "@/lib/cojeev-motion/use-flow";
export type SheetProps = React.ComponentProps<typeof Primitive.Root>;
export function Sheet(props: SheetProps) {
  return <Primitive.Root {...props} />;
}
export type SheetTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
export function SheetTrigger(props: SheetTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="sheet-trigger"
      data-part="trigger"
      data-sheet-open=""
      {...props}
    />
  );
}
export type SheetPortalProps = React.ComponentProps<typeof Primitive.Portal>;
export function SheetPortal(props: SheetPortalProps) {
  return <Primitive.Portal {...props} />;
}
export type SheetOverlayProps = React.ComponentProps<typeof Primitive.Overlay>;
export function SheetOverlay({ className, ref, ...props }: SheetOverlayProps) {
  const flowRef = useFlowAppearance<HTMLDivElement>(true, ref, "fade");
  return (
    <Primitive.Overlay
      ref={flowRef}
      data-slot="sheet-overlay"
      data-part="overlay"
      className={cn(
        "v-scrim fixed inset-0 bg-[var(--v-scrim)] z-[calc(var(--z-sheet)-1)]",
        className,
      )}
      {...props}
    />
  );
}
export const sheetContentVariants = cva(
  "v-sheet [position:fixed] [top:var(--shell-inset)] [bottom:var(--shell-inset)] [width:min(480px,calc(100%_-_56px))] [background:var(--v-canvas)] [border-radius:var(--r-panel)] [padding:var(--s-6)] [z-index:var(--z-sheet)] [overflow:auto] [display:grid] grid-cols-[minmax(0,1fr)] [gap:var(--s-5)] [align-content:start] [box-shadow:var(--shadow-float),inset_0_0_0_1px_var(--v-border)]",
);
export type SheetContentProps = React.ComponentProps<
  typeof Primitive.Content
> & {
  showCloseButton?: boolean;
  /** Logical viewport edge; follows dir or DirectionProvider. */ side?:
    "start" | "end";
};
export function SheetContent({
  className,
  ref,
  children,
  showCloseButton = false,
  side = "end",
  dir,
  ...props
}: SheetContentProps) {
  const morphRef = useMorph<HTMLDivElement>("surfaces", ref);
  const direction = useDirection(
    dir === "rtl" || dir === "ltr" ? dir : undefined,
  );
  const flowRef = useFlowAppearance<HTMLDivElement>(
    true,
    morphRef,
    "slide-inline",
  );
  return (
    <Primitive.Portal>
      <SheetOverlay />
      <Primitive.Content
        ref={flowRef}
        data-slot="sheet-content"
        data-part="content"
        data-side={side}
        dir={direction}
        className={cn(sheetContentVariants(), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetClose aria-label="Close" className="absolute right-4 top-4">
            ×
          </SheetClose>
        )}
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export type SheetHeaderProps = React.ComponentProps<"div">;
export function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      data-part="header"
      className={cn(
        "v-dialog__head flex items-start justify-between gap-[var(--s-4)]",
        className,
      )}
      {...props}
    />
  );
}
export type SheetFooterProps = React.ComponentProps<"div">;
export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      data-part="footer"
      className={cn(
        "v-dialog__actions flex gap-[var(--s-3)] justify-end mt-[var(--s-2)]",
        className,
      )}
      {...props}
    />
  );
}
export type SheetTitleProps = React.ComponentProps<typeof Primitive.Title>;
export function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <Primitive.Title
      data-slot="sheet-title"
      data-part="title"
      className={cn(
        "v-section font-[family-name:var(--font-display)] text-[length:var(--fs-section)] leading-[1.15] tracking-[-0.01em] pt-1.5 font-medium",
        className,
      )}
      {...props}
    />
  );
}
export type SheetDescriptionProps = React.ComponentProps<
  typeof Primitive.Description
>;
export function SheetDescription({
  className,
  ...props
}: SheetDescriptionProps) {
  return (
    <Primitive.Description
      data-slot="sheet-description"
      data-part="description"
      className={cn(
        "v-body-2 text-[length:var(--fs-body)] leading-[1.5] text-[color:var(--v-text-2)]",
        className,
      )}
      {...props}
    />
  );
}
export type SheetCloseProps = React.ComponentProps<typeof Primitive.Close>;
export function SheetClose(props: SheetCloseProps) {
  return (
    <Primitive.Close
      data-slot="sheet-close"
      data-part="close"
      data-close=""
      {...props}
    />
  );
}
