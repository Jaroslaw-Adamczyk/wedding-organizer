import type { ComponentPropsWithRef, ReactNode } from "react";
import { Spinner } from "@radix-ui/themes";
import { cn } from "../../utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "pure"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";
export type ButtonTone =
  | "primary"
  | "secondary"
  | "tertiary"
  | "destructive"
  | "neutral";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
  "whitespace-nowrap select-none cursor-pointer transition-colors " +
  "outline-none focus-visible:ring-2 focus-visible:ring-offset-0 " +
  "disabled:pointer-events-none disabled:opacity-50";

const TONES: Record<
  ButtonTone,
  {
    solid: string;
    soft: string;
    outline: string;
    ghost: string;
    pure: string;
    link: string;
  }
> = {
  primary: {
    solid:
      "bg-primary text-on-primary shadow-sm " +
      "hover:bg-primary/90 active:bg-primary/80 " +
      "focus-visible:ring-primary/40",
    soft:
      "bg-primary-container text-on-primary-container " +
      "hover:bg-primary-container/85 active:bg-primary-container/75 " +
      "focus-visible:ring-primary/40",
    outline:
      "border border-outline bg-transparent text-primary " +
      "hover:bg-primary/10 active:bg-primary/15 " +
      "focus-visible:ring-primary/40",
    ghost:
      "bg-transparent text-primary " +
      "hover:bg-primary/10 active:bg-primary/15 " +
      "focus-visible:ring-primary/40",
    pure: "bg-transparent text-primary focus-visible:ring-primary/40",
    link:
      "bg-transparent p-0 h-auto text-primary underline-offset-4 " +
      "hover:underline focus-visible:ring-primary/40 rounded-sm",
  },
  secondary: {
    solid:
      "bg-secondary text-on-secondary shadow-sm " +
      "hover:bg-secondary/90 active:bg-secondary/80 " +
      "focus-visible:ring-secondary/40",
    soft:
      "bg-secondary-container text-on-secondary-container " +
      "hover:bg-secondary-container/85 active:bg-secondary-container/75 " +
      "focus-visible:ring-secondary/40",
    outline:
      "border border-outline bg-transparent text-secondary " +
      "hover:bg-secondary/10 active:bg-secondary/15 " +
      "focus-visible:ring-secondary/40",
    ghost:
      "bg-transparent text-secondary " +
      "hover:bg-secondary/10 active:bg-secondary/15 " +
      "focus-visible:ring-secondary/40",
    pure: "bg-transparent text-secondary focus-visible:ring-secondary/40",
    link:
      "bg-transparent p-0 h-auto text-secondary underline-offset-4 " +
      "hover:underline focus-visible:ring-secondary/40 rounded-sm",
  },
  tertiary: {
    solid:
      "bg-tertiary text-on-tertiary shadow-sm " +
      "hover:bg-tertiary/90 active:bg-tertiary/80 " +
      "focus-visible:ring-tertiary/40",
    soft:
      "bg-tertiary-container text-on-tertiary-container " +
      "hover:bg-tertiary-container/85 active:bg-tertiary-container/75 " +
      "focus-visible:ring-tertiary/40",
    outline:
      "border border-outline bg-transparent text-tertiary " +
      "hover:bg-tertiary/10 active:bg-tertiary/15 " +
      "focus-visible:ring-tertiary/40",
    ghost:
      "bg-transparent text-tertiary " +
      "hover:bg-tertiary/10 active:bg-tertiary/15 " +
      "focus-visible:ring-tertiary/40",
    pure: "bg-transparent text-tertiary focus-visible:ring-tertiary/40",
    link:
      "bg-transparent p-0 h-auto text-tertiary underline-offset-4 " +
      "hover:underline focus-visible:ring-tertiary/40 rounded-sm",
  },
  destructive: {
    solid:
      "bg-error text-on-error shadow-sm " +
      "hover:bg-error/90 active:bg-error/80 " +
      "focus-visible:ring-error/40",
    soft:
      "bg-error-container text-on-error-container " +
      "hover:bg-error-container/85 active:bg-error-container/75 " +
      "focus-visible:ring-error/40",
    outline:
      "border border-outline bg-transparent text-error " +
      "hover:bg-error/10 active:bg-error/15 " +
      "focus-visible:ring-error/40",
    ghost:
      "bg-transparent text-error " +
      "hover:bg-error/10 active:bg-error/15 " +
      "focus-visible:ring-error/40",
    pure: "bg-transparent text-error focus-visible:ring-error/40",
    link:
      "bg-transparent p-0 h-auto text-error underline-offset-4 " +
      "hover:underline focus-visible:ring-error/40 rounded-sm",
  },
  neutral: {
    solid:
      "bg-surface-variant text-on-surface-variant shadow-sm " +
      "hover:bg-surface-variant/90 active:bg-surface-variant/80 " +
      "focus-visible:ring-outline/40",
    soft:
      "bg-surface-container text-on-surface " +
      "hover:bg-surface-container/85 active:bg-surface-container/75 " +
      "focus-visible:ring-outline/40",
    outline:
      "border border-outline bg-transparent text-on-surface " +
      "hover:bg-on-surface/10 active:bg-on-surface/15 " +
      "focus-visible:ring-outline/40",
    ghost:
      "bg-transparent text-on-surface " +
      "hover:bg-on-surface/10 active:bg-on-surface/15 " +
      "focus-visible:ring-outline/40",
    pure: "bg-transparent text-on-surface focus-visible:ring-outline/40",
    link:
      "bg-transparent p-0 h-auto text-on-surface underline-offset-4 " +
      "hover:underline focus-visible:ring-outline/40 rounded-sm",
  },
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
  tone?: ButtonTone;
  size?: ButtonSize;
  className?: string;
}): string {
  const variant = options.variant ?? "primary";
  const tone = options.tone ?? defaultToneForVariant(variant);
  const size = options.size ?? "md";
  return cn(
    BASE,
    getVariantClasses(variant, tone),
    variant === "link" ? null : SIZES[size],
    options.className,
  );
}

function defaultToneForVariant(variant: ButtonVariant): ButtonTone {
  switch (variant) {
    case "secondary":
      return "secondary";
    case "ghost":
    case "pure":
      return "neutral";

    case "primary":
    case "outline":
    case "link":
    default:
      return "primary";
  }
}

function getVariantClasses(variant: ButtonVariant, tone: ButtonTone): string {
  switch (variant) {
    case "primary":
      return TONES[tone].solid;
    case "secondary":
      return TONES[tone].soft;
    case "outline":
      return TONES[tone].outline;
    case "ghost":
      return TONES[tone].ghost;
    case "pure":
      return TONES[tone].pure;
    case "link":
      return TONES[tone].link;
    default:
      return TONES.primary.solid;
  }
}

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
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

export function Button({
  variant = "primary",
  tone,
  size = "md",
  leadingIcon,
  trailingIcon,
  loading = false,
  className,
  type = "button",
  disabled,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, tone, size, className })}
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
}
