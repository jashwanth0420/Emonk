'use client'

import Link from 'next/link'
import {
  MoreVertical,
  Activity,
  ArrowUpDown,
  BarChart2,
  ChevronDown,
  MessageSquare,
  GraduationCap,
  HelpCircle,
  Users2,
  FileText,
  ArrowUpRight,
  Play
} from 'lucide-react'

interface BentoDashboardProps {
  stats: {
    studentCount: number
    tutorCount: number
    topicCount: number
    scheduleCount: number
    questionCount: number
    pendingReviewCount: number
    recentAttendance?: any[]
    upcomingSchedules?: any[]
  }
}

export function BentoDashboard({ stats }: BentoDashboardProps) {
  // Capsule progress calculations
  const totalOperationsTarget = 1000
  const operationsValue = stats.studentCount * 30 + stats.pendingReviewCount * 12 + 420
  const operationsPct = Math.min(100, Math.round((operationsValue / totalOperationsTarget) * 100))

  const totalSessionsTarget = 240
  const sessionsValue = stats.scheduleCount * 15 + stats.tutorCount * 12 + 85
  const sessionsPct = Math.min(100, Math.round((sessionsValue / totalSessionsTarget) * 100))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT & CENTER CONTENT: Bento Grid (8 columns on lg) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Top Bento Row: Operations + Lime Data Transfer + AI Promo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Operations (White Card) */}
          <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between min-h-[220px] transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315]">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-[#111315]">Operations</span>
              </div>
              <button className="text-[#8E929A] hover:text-[#111315] p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl lg:text-[42px] font-bold tracking-tight text-[#111315] leading-none">
                  {operationsValue}
                </span>
                <span className="text-xs text-[#8E929A] font-medium">/ {totalOperationsTarget}</span>
                <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBFD78] text-[#111315] text-[11px] font-bold">
                  {operationsPct}% <span className="w-2 h-2 rounded-full border border-black inline-block" />
                </span>
              </div>
            </div>

            {/* Segmented Capsule Bar */}
            <div className="flex items-center gap-1.5 pt-2">
              {[...Array(9)].map((_, i) => {
                const filledCount = Math.round((operationsPct / 100) * 9)
                const isFilled = i < filledCount
                return (
                  <div
                    key={i}
                    className={`h-9 flex-1 rounded-full transition-all ${
                      isFilled
                        ? 'bg-[#111315]'
                        : 'border-2 border-dashed border-[#111315]/25 bg-transparent'
                    }`}
                  />
                )
              })}
            </div>
          </div>

          {/* Card 2: Key Metric / Active Sessions (Vibrant Lime Card) */}
          <div className="bg-[#EBFD78] rounded-[28px] p-6 shadow-sm flex flex-col justify-between min-h-[220px] transition-all hover:shadow-md text-[#111315]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111315] shadow-xs">
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-[#111315]">Data Transfer</span>
              </div>
              <button className="text-[#111315]/60 hover:text-[#111315] p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl lg:text-[42px] font-bold tracking-tight text-[#111315] leading-none">
                  {sessionsValue}
                </span>
                <span className="text-xs text-[#111315]/70 font-medium">/ 512.0 MB</span>
                <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#111315] text-[11px] font-bold shadow-xs">
                  {sessionsPct}% <span className="w-2 h-2 rounded-full border border-black inline-block" />
                </span>
              </div>
            </div>

            {/* Segmented Capsule Bar in Lime Card */}
            <div className="flex items-center gap-1.5 pt-2">
              {[...Array(9)].map((_, i) => {
                const filledCount = Math.round((sessionsPct / 100) * 9)
                const isFilled = i < filledCount
                return (
                  <div
                    key={i}
                    className={`h-9 flex-1 rounded-full transition-all ${
                      isFilled
                        ? 'bg-[#111315]'
                        : 'border-2 border-dashed border-[#111315]/30 bg-transparent'
                    }`}
                  />
                )
              })}
            </div>
          </div>

          {/* Card 3: AI Promo Card ("Take Your Automation to the Next Level") */}
          <div className="bg-gradient-to-br from-[#16181B] via-[#101214] to-[#0A0B0C] rounded-[28px] p-6 shadow-sm flex flex-col justify-between min-h-[220px] text-white relative overflow-hidden group">
            {/* Ambient Background Graphic & Light effect */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(110,231,183,0.18),transparent_70%)] pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between">
              <h3 className="font-semibold text-lg leading-snug tracking-tight max-w-[140px]">
                Take You Automation to the Next Level
              </h3>
              <span className="text-[#86EFAC] text-sm">↗</span>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between">
              <Link
                href="/admin/ai"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#111315] px-6 py-2.5 text-xs font-bold hover:bg-gray-100 shadow-md transition-all group-hover:scale-[1.02]"
              >
                <span>Upgrade</span>
                <Play className="w-3 h-3 fill-current" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 4: Large Statistics Chart Card */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/[0.06] shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-[#111315] tracking-tight">Statistics</h2>

              {/* Legends */}
              <div className="hidden sm:flex items-center gap-4 ml-4 text-xs font-medium text-[#737780]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#111315]" /> Operations
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EBFD78]" /> Data transfer
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-4 py-1.5 text-xs font-semibold text-[#111315] border border-black/[0.04]">
                <span>2025</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#737780]" />
              </div>
            </div>
          </div>

          {/* Capsule Pillar Chart Graphic matching reference */}
          <div className="relative pt-6 pb-2">
            {/* Horizontal Guide Lines */}
            <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
              {['1.0', '0.9', '0.8', '0.7', '0.6', '0.5'].map((val) => (
                <div key={val} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-[#9CA3AF] w-5 text-right">{val}</span>
                  <div className="flex-1 border-b border-dashed border-[#E5E7EB]" />
                </div>
              ))}
            </div>

            {/* Pill Bars */}
            <div className="relative z-10 flex items-end justify-between pl-8 pr-4 h-[220px]">
              {/* Pillar 1 */}
              <div className="flex flex-col items-center gap-2 w-8 sm:w-10">
                <div className="w-full h-[180px] rounded-full bg-[#111315] flex flex-col justify-end p-1 relative">
                  <div className="w-full h-8 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="flex flex-col items-center gap-2 w-8 sm:w-10">
                <div className="w-full h-[70px] rounded-full bg-[#111315] flex flex-col justify-end p-1">
                  <div className="w-full h-6 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="flex flex-col items-center gap-2 w-8 sm:w-10">
                <div className="w-full h-[130px] rounded-full bg-[#111315] flex flex-col justify-end p-1">
                  <div className="w-full h-7 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 4 (Target with 32% tag) */}
              <div className="flex flex-col items-center gap-2 w-8 sm:w-10 relative">
                <div className="absolute -top-7 px-2 py-0.5 rounded-full bg-[#EBFD78] text-[#111315] text-[10px] font-bold shadow-xs whitespace-nowrap">
                  32%
                </div>
                {/* Dotted target guide */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#8E929A] mb-1" />
                <div className="w-full h-[60px] rounded-full bg-[#EBFD78]" />
              </div>

              {/* Pillar 5 (Peak with 87% tag) */}
              <div className="flex flex-col items-center gap-2 w-8 sm:w-10 relative">
                <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-[#111315] text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
                  87%
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#8E929A] mb-1" />
                <div className="w-full h-[190px] rounded-full bg-[#111315] flex flex-col justify-end p-1">
                  <div className="w-full h-10 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 6 */}
              <div className="flex flex-col items-center gap-2 w-8 sm:w-10 relative">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8E929A] mb-1" />
                <div className="w-full h-[150px] rounded-full bg-[#111315] flex flex-col justify-end p-1">
                  <div className="w-full h-12 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 7 */}
              <div className="flex flex-col items-center gap-2 w-8 sm:w-10">
                <div className="w-full h-[100px] rounded-full bg-[#111315] flex flex-col justify-end p-1">
                  <div className="w-full h-6 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR WIDGETS (4 columns on lg) */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        {/* Top Twin Cards: Community & Academy */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/admin/posts"
            className="bg-white rounded-[24px] p-5 border border-black/[0.06] shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] group-hover:bg-[#EBFD78] transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-[#111315]">Community</span>
          </Link>

          <Link
            href="/admin/topics"
            className="bg-white rounded-[24px] p-5 border border-black/[0.06] shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] group-hover:bg-[#EBFD78] transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-[#111315]">Academy</span>
          </Link>
        </div>

        {/* Resource Link Card 1: Help Center */}
        <Link
          href="/admin/questions"
          className="bg-white rounded-[24px] p-5 border border-black/[0.06] shadow-sm flex items-start justify-between gap-3 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] shrink-0 group-hover:bg-[#EBFD78] transition-colors">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#111315]">Help Center</h4>
              <p className="text-xs text-[#737780] mt-1 line-clamp-1">
                Explore our detailed documentation and guides...
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#8E929A] group-hover:text-[#111315] transition-colors shrink-0" />
        </Link>

        {/* Resource Link Card 2: Partner Directory */}
        <Link
          href="/admin/tutors"
          className="bg-white rounded-[24px] p-5 border border-black/[0.06] shadow-sm flex items-start justify-between gap-3 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] shrink-0 group-hover:bg-[#EBFD78] transition-colors">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#111315]">Partner Directory</h4>
              <p className="text-xs text-[#737780] mt-1 line-clamp-1">
                Find the perfect partner or tutor to support student goals...
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#8E929A] group-hover:text-[#111315] transition-colors shrink-0" />
        </Link>

        {/* Resource Link Card 3: Blog / Stories */}
        <Link
          href="/admin/posts"
          className="bg-white rounded-[24px] p-5 border border-black/[0.06] shadow-sm flex items-start justify-between gap-3 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] shrink-0 group-hover:bg-[#EBFD78] transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#111315]">Blog & Updates</h4>
              <p className="text-xs text-[#737780] mt-1 line-clamp-1">
                Access popular guides, feature releases & stories...
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#8E929A] group-hover:text-[#111315] transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  )
}
