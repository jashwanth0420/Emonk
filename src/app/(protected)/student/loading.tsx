'use client'

export default function StudentLoadingSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 w-full">
        <div className="min-w-0 space-y-2">
          <div className="h-8 sm:h-10 bg-black/[0.06] rounded-2xl w-[60%] max-w-[420px]" />
          <div className="h-8 sm:h-10 bg-black/[0.06] rounded-2xl w-[40%] max-w-[280px]" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-full bg-black/[0.06]" />
          <div className="h-10 w-44 rounded-full bg-black/[0.06]" />
        </div>
      </div>

      {/* Pill tabs skeleton */}
      <div className="flex items-center gap-2 overflow-hidden py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-9 rounded-full shrink-0 ${
              i === 0 ? 'bg-[#111215]/20 w-28' : 'bg-black/[0.05] w-32'
            }`}
          />
        ))}
      </div>

      {/* Cards Grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/[0.06] shadow-sm space-y-4 h-72">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-black/[0.06] rounded w-32" />
            <div className="h-4 bg-black/[0.04] rounded-full w-24" />
          </div>
          <div className="h-6 bg-black/[0.08] rounded-xl w-52 mt-4" />
          <div className="h-3.5 bg-black/[0.04] rounded w-40" />
          <div className="h-11 bg-black/[0.06] rounded-2xl w-full mt-6" />
        </div>

        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/[0.06] shadow-sm space-y-4 h-72">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-black/[0.06] rounded w-36" />
            <div className="h-3 bg-black/[0.04] rounded w-20" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-[#F9FAFB]">
                <div className="space-y-1">
                  <div className="h-3.5 bg-black/[0.06] rounded w-32" />
                  <div className="h-2.5 bg-black/[0.04] rounded w-20" />
                </div>
                <div className="h-5 bg-black/[0.06] rounded-full w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
