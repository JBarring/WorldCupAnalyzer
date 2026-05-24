import { PageShell } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function MatchesLoading() {
  return (
    <PageShell className="space-y-8 pt-8">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full" />
        ))}
      </div>
    </PageShell>
  );
}
