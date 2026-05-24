import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

interface GlassPanelProps extends PropsWithChildren {
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
