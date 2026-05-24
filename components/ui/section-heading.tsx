import type { ReactNode } from "react";

import { Pill } from "@/components/ui/pill";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl space-y-4">
        <Pill>{eyebrow}</Pill>
        <div className="space-y-2">
          <h2 className="font-[family:var(--font-display)] text-4xl uppercase tracking-[0.04em] text-white md:text-5xl">
            {title}
          </h2>
          <p className="max-w-xl text-sm leading-7 text-white/68 md:text-base">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
