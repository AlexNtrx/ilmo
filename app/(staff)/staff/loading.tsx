import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Ilmoituksia ladataan"
      className="space-y-8"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-72 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid gap-3">
        {[0, 1, 2].map((item) => (
          <Card key={item}>
            <CardContent className="space-y-4 pt-5">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
