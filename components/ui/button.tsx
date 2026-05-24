"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

interface ButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "bg-[linear-gradient(135deg,#4adeb6,#28b8ff)] text-slate-950 shadow-[0_12px_40px_rgba(40,184,255,0.35)] hover:scale-[1.02]"
          : "border border-white/12 bg-white/8 text-white hover:border-white/24 hover:bg-white/12",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
