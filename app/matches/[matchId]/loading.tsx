import { PageShell } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function MatchDetailLoading() {
  return (
    <PageShell className="space-y-8 pt-8">
      <Skeleton className="h-[320px] w-full rounded-[32px]" />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Skeleton className="h-[360px] w-full" />
        <Skeleton className="h-[360px] w-full" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Skeleton className="h-[340px] w-full" />
        <Skeleton className="h-[340px] w-full" />
      </div>
      <Skeleton className="h-[420px] w-full" />
    </PageShell>
  );
}
