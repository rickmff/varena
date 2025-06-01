import { Skeleton } from "@/components/ui/skeleton";

export default function NewsCardSkeleton() {
  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-red-900/30 overflow-hidden h-full">
      {/* Image skeleton */}
      <div className="relative aspect-video">
        <Skeleton className="w-full h-full" />
        {/* Category badge skeleton */}
        <div className="absolute top-4 right-4">
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-6">
        {/* Date skeleton */}
        <Skeleton className="w-24 h-4 mb-2" />

        {/* Title skeleton */}
        <Skeleton className="w-full h-6 mb-3" />
        <Skeleton className="w-3/4 h-6 mb-3" />

        {/* Excerpt skeleton */}
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-2/3 h-4 mb-6" />

        {/* Read more button skeleton */}
        <Skeleton className="w-24 h-4" />
      </div>
    </div>
  );
}

export function NewsCardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <NewsCardSkeleton key={index} />
      ))}
    </div>
  );
}