
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CollectionSkeleton = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4 bg-slate-700" />
                <Skeleton className="h-4 w-1/2 bg-slate-700" />
              </div>
              <Skeleton className="h-6 w-16 bg-slate-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 bg-slate-700" />
              <Skeleton className="h-8 w-16 bg-slate-700" />
              <Skeleton className="h-8 w-16 bg-slate-700" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CollectionSkeleton;
