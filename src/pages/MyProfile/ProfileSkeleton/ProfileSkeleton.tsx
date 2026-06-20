import { Card } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">

      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-20" />
      </Card>

      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>

      <Skeleton className="h-10 w-full" />
    </div>
  );
}