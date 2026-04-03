import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "soft";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500 focus-visible:ring-violet-500",
  secondary:
    "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-teal-400 focus-visible:ring-cyan-500",
  outline:
    "border-2 border-violet-300 bg-white/80 text-violet-800 hover:bg-violet-50 dark:border-violet-500/40 dark:bg-slate-900/60 dark:text-violet-200 dark:hover:bg-violet-950/80",
  ghost:
    "text-violet-700 hover:bg-violet-100/80 dark:text-violet-300 dark:hover:bg-violet-950/60",
  danger:
    "bg-rose-500 text-white shadow-md hover:bg-rose-600 focus-visible:ring-rose-500",
  soft:
    "bg-violet-100 text-violet-900 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-100 dark:hover:bg-violet-500/30",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) {
    const sizes = {
      sm: "rounded-lg px-3 py-1.5 text-xs font-semibold",
      md: "rounded-xl px-4 py-2.5 text-sm font-semibold",
      lg: "rounded-xl px-6 py-3 text-base font-semibold",
    };
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-950",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
