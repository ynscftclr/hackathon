import { memo } from "react";

/** Tek bir personel kartı skeleton'u */
export const PersonCardSkeleton = memo(function PersonCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-4 px-6 py-5">
        {/* Avatar */}
        <div className="skeleton h-11 w-11 shrink-0 !rounded-full" />
        {/* Name lines */}
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-32" />
          <div className="skeleton h-2.5 w-20" />
        </div>
        {/* Stats */}
        <div className="hidden gap-6 sm:flex">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="skeleton h-4 w-8" />
              <div className="skeleton h-2 w-14" />
            </div>
          ))}
        </div>
        {/* Progress */}
        <div className="hidden lg:block">
          <div className="skeleton h-2 w-28" />
        </div>
      </div>
    </div>
  );
});

/** Stat card skeleton */
export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
      <div className="skeleton mb-2 h-8 w-16" />
      <div className="skeleton h-3 w-28" />
    </div>
  );
});

/** Tam dashboard skeleton — 3 stat + 5 kişi kartı */
export default function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Filter pills */}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-8 w-20 !rounded-full" />
        ))}
      </div>
      {/* Person cards */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <PersonCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
