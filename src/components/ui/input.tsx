import type { ComponentPropsWithRef } from "react";

import { cn } from "../../utils/cn";

export type InputProps = ComponentPropsWithRef<"input">;

const BASE =
  "flex h-10 w-full min-w-0 rounded-lg border border-outline bg-surface px-3 py-2 " +
  "text-sm text-on-surface outline-none transition-colors " +
  "placeholder:text-on-surface-variant/70 " +
  "focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "file:border-0 file:bg-transparent file:text-sm file:font-medium";

export function Input({
  className,
  type = "text",
  ref,
  ...props
}: InputProps) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(BASE, className)}
      {...props}
    />
  );
}
