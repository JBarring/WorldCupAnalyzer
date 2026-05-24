import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

interface PillProps extends PropsWithChildren {
  className?: string;
}

export function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72",
        className,
      )}
    >
      {children}
    </span>
  );
}
