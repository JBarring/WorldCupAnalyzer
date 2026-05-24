import { PageShell } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function BracketLoading() {
  return (
    <PageShell className="space-y-8 pt-8">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-[560px] w-full" />
    </PageShell>
  );
}
