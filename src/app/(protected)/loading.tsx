'use client'

export default function ProtectedLoading() {
  return (
    <div className="w-full max-w-full p-4 sm:p-6 md:p-8 space-y-6 animate-pulse">
      {/* Top Header Placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-8 sm:h-10 bg-black/[0.06] rounded-2xl w-64 max-w-[80vw]" />
          <div className="h-4 bg-black/[0.04] rounded-lg w-40" />
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-full bg-black/[0.06]" />
          <div className="h-10 w-32 rounded-full bg-black/[0.06]" />
        </div>
      </div>

      {/* Grid Content Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-[28px] border border-black/[0.06] p-6 bg-white shadow-sm space-y-4 h-64">
          <div className="h-5 bg-black/[0.07] rounded-lg w-32" />
          <div className="h-12 bg-black/[0.04] rounded-2xl w-24" />
          <div className="h-4 bg-black/[0.04] rounded-lg w-full mt-auto" />
        </div>
        <div className="rounded-[28px] border border-black/[0.06] p-6 bg-white shadow-sm space-y-4 h-64">
          <div className="h-5 bg-black/[0.07] rounded-lg w-32" />
          <div className="h-12 bg-black/[0.04] rounded-2xl w-24" />
          <div className="h-4 bg-black/[0.04] rounded-lg w-full mt-auto" />
        </div>
        <div className="rounded-[28px] border border-black/[0.06] p-6 bg-white shadow-sm space-y-4 h-64">
          <div className="h-5 bg-black/[0.07] rounded-lg w-32" />
          <div className="h-12 bg-black/[0.04] rounded-2xl w-24" />
          <div className="h-4 bg-black/[0.04] rounded-lg w-full mt-auto" />
        </div>
      </div>
    </div>
  )
}
