import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

interface PageShellProps extends PropsWithChildren {
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return <main className={cn("page-shell relative mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8", className)}>{children}</main>;
}
