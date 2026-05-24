import { PageShell } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageShell className="space-y-8 pt-8">
      <Skeleton className="h-[320px] w-full rounded-[32px]" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Skeleton className="h-[420px] w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    </PageShell>
  );
}
