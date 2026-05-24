import type { Team } from "@/types";

import { cn } from "@/lib/utils/cn";

const sizeClasses = {
  xs: "h-8 w-8 text-[9px]",
  sm: "h-10 w-10 text-[10px]",
  md: "h-14 w-14 text-xs",
  lg: "h-20 w-20 text-sm",
};

interface TeamCrestProps {
  team: Team;
  size?: keyof typeof sizeClasses;
  showFlag?: boolean;
}

export function TeamCrest({ team, size = "md", showFlag = false }: TeamCrestProps) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-[22px] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        sizeClasses[size],
      )}
      style={{
        background: `linear-gradient(145deg, ${team.colors.primary}, ${team.colors.accent})`,
      }}
    >
      <div
        className="absolute inset-[2px] rounded-[20px] opacity-70"
        style={{
          background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.28), transparent 35%), linear-gradient(145deg, transparent, ${team.colors.secondary}22)`,
        }}
      />
      <span className="relative z-10 font-[family:var(--font-display)] tracking-[0.12em] text-white">{team.code}</span>
      {showFlag ? <span className="absolute bottom-1 right-1 text-[11px]">{team.flagEmoji}</span> : null}
    </div>
  );
}
