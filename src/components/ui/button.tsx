import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "@radix-ui/themes";
import { cn } from "../../utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "pure"
  | "link"
  | "destructive";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
  "whitespace-nowrap select-none cursor-pointer transition-colors " +
  "outline-none focus-visible:ring-2 focus-visible:ring-offset-0 " +
  "disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-sm " +
    "hover:bg-primary/90 active:bg-primary/80 " +
    "focus-visible:ring-primary/40",

  secondary:
    "bg-secondary-container text-on-secondary-container " +
    "hover:bg-secondary-container/85 active:bg-secondary-container/75 " +
    "focus-visible:ring-primary/40",

  outline:
    "border border-outline bg-transparent text-primary " +
    "hover:bg-primary/10 active:bg-primary/15 " +
    "focus-visible:ring-primary/40",

  ghost:
    "bg-transparent text-on-surface " +
    "hover:bg-on-surface/10 active:bg-on-surface/15 " +
    "focus-visible:ring-primary/40",

  pure: "bg-transparent text-on-surface " + "focus-visible:ring-primary/40",

  link:
    "bg-transparent p-0 h-auto text-primary underline-offset-4 " +
    "hover:underline focus-visible:ring-primary/40 rounded-sm",

  destructive:
    "bg-error text-on-error shadow-sm " +
    "hover:bg-error/90 active:bg-error/80 " +
    "focus-visible:ring-error/40",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

function buttonClasses(options: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  const variant = options.variant ?? "primary";
  const size = options.size ?? "md";
  return cn(
    BASE,
    VARIANTS[variant],
    variant === "link" ? null : SIZES[size],
    options.className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
}

const SPINNER_SIZE: Record<ButtonSize, "1" | "2" | "3"> = {
  xs: "1",
  sm: "1",
  md: "2",
  lg: "3",
  icon: "2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      leadingIcon,
      trailingIcon,
      loading = false,
      className,
      type = "button",
      disabled,
      children,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses({ variant, size, className })}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? (
          <Spinner size={SPINNER_SIZE[size]} />
        ) : leadingIcon ? (
          <span aria-hidden className="inline-flex shrink-0">
            {leadingIcon}
          </span>
        ) : null}
        {children}
        {!loading && trailingIcon ? (
          <span aria-hidden className="inline-flex shrink-0">
            {trailingIcon}
          </span>
        ) : null}
      </button>
    );
  },
);
