'use client'

export default function AdminLoadingSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 w-full">
        <div className="min-w-0 space-y-2">
          <div className="h-8 sm:h-10 bg-black/[0.06] rounded-2xl w-[70%] max-w-[450px]" />
          <div className="h-8 sm:h-10 bg-black/[0.06] rounded-2xl w-[50%] max-w-[300px]" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-full bg-black/[0.06]" />
          <div className="h-10 w-36 rounded-full bg-black/[0.06]" />
        </div>
      </div>

      {/* Pill tabs skeleton */}
      <div className="flex items-center gap-2 overflow-hidden py-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`h-9 rounded-full shrink-0 ${
              i === 0 ? 'bg-[#111215]/20 w-24' : 'bg-black/[0.05] w-20'
            }`}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left card */}
        <div className="lg:col-span-1 rounded-[28px] border border-black/[0.06] p-5 sm:p-6 bg-white shadow-sm space-y-4">
          <div className="h-5 bg-black/[0.07] rounded-lg w-40" />
          <div className="h-3 bg-black/[0.04] rounded w-56" />
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <div className="h-3 bg-black/[0.06] rounded w-20" />
              <div className="h-10 bg-black/[0.04] rounded-xl w-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-black/[0.06] rounded w-24" />
              <div className="h-10 bg-black/[0.04] rounded-xl w-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-black/[0.06] rounded w-28" />
              <div className="h-10 bg-black/[0.04] rounded-xl w-full" />
            </div>
            <div className="h-10 bg-black/[0.08] rounded-full w-full mt-2" />
          </div>
        </div>

        {/* Right table */}
        <div className="lg:col-span-2 rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-4 sm:p-6 space-y-4">
          <div className="h-5 bg-black/[0.07] rounded-lg w-48" />
          <div className="space-y-3">
            {/* Table header */}
            <div className="flex gap-4 pb-2 border-b border-black/[0.06]">
              <div className="h-3 bg-black/[0.06] rounded w-24" />
              <div className="h-3 bg-black/[0.06] rounded w-32" />
              <div className="h-3 bg-black/[0.06] rounded w-20" />
              <div className="h-3 bg-black/[0.06] rounded w-16 ml-auto" />
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-2.5 border-b border-black/[0.03]">
                <div className="h-3.5 bg-black/[0.05] rounded w-28" />
                <div className="h-3.5 bg-black/[0.04] rounded w-36" />
                <div className="h-3.5 bg-black/[0.04] rounded w-20" />
                <div className="h-5 bg-black/[0.06] rounded-full w-16 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
