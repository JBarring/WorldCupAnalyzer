import { PageShell } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <PageShell className="space-y-8 pt-8">
      <Skeleton className="h-[340px] w-full rounded-[32px]" />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Skeleton className="h-[360px] w-full" />
        <Skeleton className="h-[360px] w-full" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </PageShell>
  );
}
