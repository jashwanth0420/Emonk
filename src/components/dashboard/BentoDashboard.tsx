'use client'

import Link from 'next/link'
import {
  MoreVertical,
  Activity,
  Calendar,
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
  // Attendance calculations
  const totalStudentsTarget = Math.max(stats.studentCount || 1, 10)
  const attendanceRate = stats.studentCount > 0 
    ? Math.min(100, Math.round(((stats.recentAttendance?.filter(a => a.status === 'approved').length || 0) + 1) / totalStudentsTarget * 100))
    : 78

  // Curriculum & Schedules calculations
  const totalCurriculumTarget = Math.max(stats.topicCount || 1, 12)
  const curriculumRate = stats.topicCount > 0
    ? Math.min(100, Math.round((stats.scheduleCount / totalCurriculumTarget) * 100))
    : 65

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full max-w-full">
      {/* LEFT & CENTER CONTENT: Bento Grid (8 cols on lg) */}
      <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6 w-full min-w-0">
        {/* Top Bento Row: Responsive stack on mobile/tablet, 3 columns on large desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Attendance Check-ins (White Card) */}
          <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between min-h-[220px] transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315]">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-[#111315]">Attendance</span>
              </div>
              <button className="text-[#8E929A] hover:text-[#111315] p-1" title="Options">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111315] leading-none">
                  {stats.studentCount * 12 + (stats.recentAttendance?.length || 5)}
                </span>
                <span className="text-xs text-[#8E929A] font-medium">/ 1000 Total</span>
                <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBFD78] text-[#111315] text-[11px] font-bold">
                  {attendanceRate}% <span className="w-2 h-2 rounded-full border border-black inline-block" />
                </span>
              </div>
            </div>

            {/* Segmented Capsule Bar */}
            <div className="flex items-center gap-1.5 pt-2">
              {[...Array(9)].map((_, i) => {
                const filledCount = Math.round((attendanceRate / 100) * 9)
                const isFilled = i < filledCount
                return (
                  <div
                    key={i}
                    className={`h-8 sm:h-9 flex-1 rounded-full transition-all ${
                      isFilled
                        ? 'bg-[#111315]'
                        : 'border-2 border-dashed border-[#111315]/20 bg-transparent'
                    }`}
                  />
                )
              })}
            </div>
          </div>

          {/* Card 2: Active Curriculum & Sessions (Vibrant Lime Card) */}
          <div className="bg-[#EBFD78] rounded-[28px] p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[220px] transition-all hover:shadow-md text-[#111315]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111315] shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-[#111315]">Sessions & Topics</span>
              </div>
              <button className="text-[#111315]/60 hover:text-[#111315] p-1" title="Options">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111315] leading-none">
                  {stats.scheduleCount}
                </span>
                <span className="text-xs text-[#111315]/70 font-medium">/ {stats.topicCount || 10} Topics</span>
                <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#111315] text-[11px] font-bold shadow-xs">
                  {curriculumRate}% <span className="w-2 h-2 rounded-full border border-black inline-block" />
                </span>
              </div>
            </div>

            {/* Segmented Capsule Bar in Lime Card */}
            <div className="flex items-center gap-1.5 pt-2">
              {[...Array(9)].map((_, i) => {
                const filledCount = Math.round((curriculumRate / 100) * 9)
                const isFilled = i < filledCount
                return (
                  <div
                    key={i}
                    className={`h-8 sm:h-9 flex-1 rounded-full transition-all ${
                      isFilled
                        ? 'bg-[#111315]'
                        : 'border-2 border-dashed border-[#111315]/30 bg-transparent'
                    }`}
                  />
                )
              })}
            </div>
          </div>

          {/* Card 3: AI Assessment Engine Promo Card */}
          <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#16181B] via-[#101214] to-[#0A0B0C] rounded-[28px] p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[220px] text-white relative overflow-hidden group">
            {/* Ambient Background Graphic & Light effect */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(235,253,120,0.15),transparent_70%)] pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between">
              <h3 className="font-bold text-base sm:text-lg leading-snug tracking-tight max-w-[200px] sm:max-w-[150px]">
                Automate Verification with AI Assessment
              </h3>
              <span className="text-[#EBFD78] text-sm">↗</span>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between">
              <Link
                href="/admin/ai"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#111315] px-5 py-2.5 text-xs font-bold hover:bg-gray-100 shadow-md transition-all group-hover:scale-[1.02]"
              >
                <span>Launch AI</span>
                <Play className="w-3 h-3 fill-current" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 4: Large Statistics Chart Card */}
        <div className="bg-white rounded-[28px] p-5 sm:p-8 border border-black/[0.06] shadow-sm w-full min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#111315] tracking-tight">Attendance Trends</h2>

              {/* Legends */}
              <div className="hidden sm:flex items-center gap-4 ml-4 text-xs font-medium text-[#737780]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#111315]" /> Verified Check-ins
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EBFD78]" /> Active Sessions
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-3.5 py-1.5 text-xs font-semibold text-[#111315] border border-black/[0.04]">
                <span>Current Term</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#737780]" />
              </div>
            </div>
          </div>

          {/* Capsule Pillar Chart Graphic */}
          <div className="relative pt-6 pb-2 w-full overflow-hidden">
            {/* Horizontal Guide Lines */}
            <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
              {['100%', '80%', '60%', '40%', '20%'].map((val) => (
                <div key={val} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] font-mono text-[#9CA3AF] w-7 sm:w-8 text-right">{val}</span>
                  <div className="flex-1 border-b border-dashed border-[#E5E7EB]" />
                </div>
              ))}
            </div>

            {/* Pill Bars */}
            <div className="relative z-10 flex items-end justify-between pl-8 sm:pl-10 pr-2 sm:pr-4 h-[200px] sm:h-[220px]">
              {/* Pillar 1 */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 w-6 sm:w-9 md:w-10">
                <div className="w-full h-[150px] sm:h-[180px] rounded-full bg-[#111315] flex flex-col justify-end p-0.5 sm:p-1 relative">
                  <div className="w-full h-6 sm:h-8 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 w-6 sm:w-9 md:w-10">
                <div className="w-full h-[60px] sm:h-[70px] rounded-full bg-[#111315] flex flex-col justify-end p-0.5 sm:p-1">
                  <div className="w-full h-4 sm:h-6 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 w-6 sm:w-9 md:w-10">
                <div className="w-full h-[100px] sm:h-[130px] rounded-full bg-[#111315] flex flex-col justify-end p-0.5 sm:p-1">
                  <div className="w-full h-5 sm:h-7 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 4 (Target with 32% tag) */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 w-6 sm:w-9 md:w-10 relative">
                <div className="absolute -top-6 sm:-top-7 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#EBFD78] text-[#111315] text-[9px] sm:text-[10px] font-bold shadow-xs whitespace-nowrap">
                  32%
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#8E929A] mb-0.5 sm:mb-1" />
                <div className="w-full h-[50px] sm:h-[60px] rounded-full bg-[#EBFD78]" />
              </div>

              {/* Pillar 5 (Peak with 87% tag) */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 w-6 sm:w-9 md:w-10 relative">
                <div className="absolute -top-6 sm:-top-7 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#111315] text-white text-[9px] sm:text-[10px] font-bold shadow-xs whitespace-nowrap">
                  87%
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#8E929A] mb-0.5 sm:mb-1" />
                <div className="w-full h-[160px] sm:h-[190px] rounded-full bg-[#111315] flex flex-col justify-end p-0.5 sm:p-1">
                  <div className="w-full h-8 sm:h-10 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 6 */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 w-6 sm:w-9 md:w-10 relative">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8E929A] mb-0.5 sm:mb-1" />
                <div className="w-full h-[120px] sm:h-[150px] rounded-full bg-[#111315] flex flex-col justify-end p-0.5 sm:p-1">
                  <div className="w-full h-8 sm:h-12 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>

              {/* Pillar 7 */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 w-6 sm:w-9 md:w-10">
                <div className="w-full h-[80px] sm:h-[100px] rounded-full bg-[#111315] flex flex-col justify-end p-0.5 sm:p-1">
                  <div className="w-full h-5 sm:h-6 rounded-full bg-[#EBFD78] mt-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR WIDGETS (4 cols on lg) */}
      <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 w-full min-w-0">
        {/* Top Twin Cards: Community & Academy */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/admin/posts"
            className="bg-white rounded-[24px] p-4 sm:p-5 border border-black/[0.06] shadow-sm flex flex-col items-center justify-center text-center gap-2 sm:gap-3 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] group-hover:bg-[#EBFD78] transition-colors">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-[#111315]">Community</span>
          </Link>

          <Link
            href="/admin/topics"
            className="bg-white rounded-[24px] p-4 sm:p-5 border border-black/[0.06] shadow-sm flex flex-col items-center justify-center text-center gap-2 sm:gap-3 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] group-hover:bg-[#EBFD78] transition-colors">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-[#111315]">Academy</span>
          </Link>
        </div>

        {/* Resource Link Card 1: Question Bank */}
        <Link
          href="/admin/questions"
          className="bg-white rounded-[24px] p-4 sm:p-5 border border-black/[0.06] shadow-sm flex items-start justify-between gap-3 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] shrink-0 group-hover:bg-[#EBFD78] transition-colors">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-[#111315] truncate">Question Bank</h4>
              <p className="text-[11px] sm:text-xs text-[#737780] mt-0.5 line-clamp-1">
                Explore targeted assessment questions & rubrics...
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#8E929A] group-hover:text-[#111315] transition-colors shrink-0" />
        </Link>

        {/* Resource Link Card 2: Tutor Directory */}
        <Link
          href="/admin/tutors"
          className="bg-white rounded-[24px] p-4 sm:p-5 border border-black/[0.06] shadow-sm flex items-start justify-between gap-3 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] shrink-0 group-hover:bg-[#EBFD78] transition-colors">
              <Users2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-[#111315] truncate">Tutor Directory</h4>
              <p className="text-[11px] sm:text-xs text-[#737780] mt-0.5 line-clamp-1">
                Manage assigned tutors & evaluation queues...
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#8E929A] group-hover:text-[#111315] transition-colors shrink-0" />
        </Link>

        {/* Resource Link Card 3: Analytics & Reports */}
        <Link
          href="/admin/analytics"
          className="bg-white rounded-[24px] p-4 sm:p-5 border border-black/[0.06] shadow-sm flex items-start justify-between gap-3 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315] shrink-0 group-hover:bg-[#EBFD78] transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-[#111315] truncate">Analytics & Reports</h4>
              <p className="text-[11px] sm:text-xs text-[#737780] mt-0.5 line-clamp-1">
                Access verified records & attendance intelligence...
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#8E929A] group-hover:text-[#111315] transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  )
}
