'use client'

export default function TutorLoadingSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 w-full">
        <div className="min-w-0 space-y-2">
          <div className="h-8 sm:h-10 bg-black/[0.06] rounded-2xl w-[60%] max-w-[400px]" />
          <div className="h-8 sm:h-10 bg-black/[0.06] rounded-2xl w-[40%] max-w-[260px]" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-full bg-black/[0.06]" />
          <div className="h-10 w-36 rounded-full bg-black/[0.06]" />
        </div>
      </div>

      {/* Pill tabs skeleton */}
      <div className="flex items-center gap-2 overflow-hidden py-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`h-9 rounded-full shrink-0 ${
              i === 0 ? 'bg-[#111215]/20 w-28' : 'bg-black/[0.05] w-28'
            }`}
          />
        ))}
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm space-y-3 h-32">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-black/[0.06] rounded w-28" />
              <div className="w-4 h-4 rounded-full bg-black/[0.06]" />
            </div>
            <div className="h-8 bg-black/[0.08] rounded-xl w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-5 sm:p-6 space-y-4">
        <div className="h-5 bg-black/[0.07] rounded-lg w-48" />
        <div className="space-y-3">
          <div className="flex gap-4 pb-2 border-b border-black/[0.06]">
            <div className="h-3 bg-black/[0.06] rounded w-32" />
            <div className="h-3 bg-black/[0.06] rounded w-40" />
            <div className="h-3 bg-black/[0.06] rounded w-24" />
            <div className="h-3 bg-black/[0.06] rounded w-20 ml-auto" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-black/[0.03]">
              <div className="h-3.5 bg-black/[0.05] rounded w-32" />
              <div className="h-3.5 bg-black/[0.04] rounded w-44" />
              <div className="h-3.5 bg-black/[0.04] rounded w-24" />
              <div className="h-6 bg-black/[0.06] rounded-full w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
