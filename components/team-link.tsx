import Link from "next/link";
import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";
import type { Team } from "@/types";

interface TeamLinkProps extends PropsWithChildren {
  team: Team;
  className?: string;
}

export function TeamLink({ team, className, children }: TeamLinkProps) {
  return (
    <Link href={`/teams/${team.id}`} className={cn("group/team transition hover:opacity-100", className)}>
      {children}
    </Link>
  );
}
