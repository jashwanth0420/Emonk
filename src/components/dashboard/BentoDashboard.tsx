'use client'

import Link from 'next/link'
import {
  MoreVertical,
  Activity,
  UserCheck,
  Calendar,
  BarChart2,
  ChevronDown,
  MessageSquare,
  GraduationCap,
  HelpCircle,
  Users2,
  FileText,
  ArrowUpRight,
  Play,
  Clock,
  Sparkles
} from 'lucide-react'

export interface TodayDashboardData {
  dateDisplay: string
  dayName: string
  todayDateStr: string
  todayAttendanceCount: number
  todayVerifiedCount: number
  todayPendingCount: number
  totalStudents: number
  attendanceRate: number
  tutorsPresentCount: number
  totalTutors: number
  tutorsPresentList: { id: string; full_name: string; email?: string }[]
}

export interface DayTrendData {
  dayName: string
  dayFull: string
  dateFormatted: string
  dateStr: string
  attendanceCount: number
  verifiedCount: number
  sessionCount: number
  rate: number
  isStarted: boolean
  isToday: boolean
}

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
  todayData?: TodayDashboardData
  weeklyTrends?: DayTrendData[]
}

export function BentoDashboard({ stats, todayData, weeklyTrends }: BentoDashboardProps) {
  // Safe defaults if todayData or weeklyTrends is not provided
  const now = new Date()
  const todayInfo: TodayDashboardData = todayData || {
    dateDisplay: now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
    dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
    todayDateStr: now.toISOString().split('T')[0],
    todayAttendanceCount: stats.recentAttendance?.length || 0,
    todayVerifiedCount: stats.recentAttendance?.filter(a => a.status === 'approved').length || 0,
    todayPendingCount: stats.recentAttendance?.filter(a => a.status === 'pending_review').length || 0,
    totalStudents: Math.max(stats.studentCount, 1),
    attendanceRate: stats.studentCount > 0 ? Math.min(100, Math.round(((stats.recentAttendance?.length || 0) / Math.max(stats.studentCount, 1)) * 100)) : 75,
    tutorsPresentCount: stats.tutorCount > 0 ? 1 : 0,
    totalTutors: stats.tutorCount,
    tutorsPresentList: []
  }

  // Fallback 6-day week (Mon to Sat) if not provided
  const trends: DayTrendData[] = weeklyTrends || [
    { dayName: 'Mon', dayFull: 'Monday', dateFormatted: 'Mon', dateStr: '1', attendanceCount: 20, verifiedCount: 18, sessionCount: 2, rate: 80, isStarted: true, isToday: false },
    { dayName: 'Tue', dayFull: 'Tuesday', dateFormatted: 'Tue', dateStr: '2', attendanceCount: 15, verifiedCount: 12, sessionCount: 1, rate: 60, isStarted: true, isToday: false },
    { dayName: 'Wed', dayFull: 'Wednesday', dateFormatted: 'Wed', dateStr: '3', attendanceCount: 22, verifiedCount: 20, sessionCount: 2, rate: 88, isStarted: true, isToday: false },
    { dayName: 'Thu', dayFull: 'Thursday', dateFormatted: 'Thu', dateStr: '4', attendanceCount: 18, verifiedCount: 15, sessionCount: 2, rate: 72, isStarted: true, isToday: true },
    { dayName: 'Fri', dayFull: 'Friday', dateFormatted: 'Fri', dateStr: '5', attendanceCount: 0, verifiedCount: 0, sessionCount: 1, rate: 0, isStarted: false, isToday: false },
    { dayName: 'Sat', dayFull: 'Saturday', dateFormatted: 'Sat', dateStr: '6', attendanceCount: 0, verifiedCount: 0, sessionCount: 1, rate: 0, isStarted: false, isToday: false },
  ]

  // Find peak rate for styling highlights
  const peakRate = Math.max(...trends.filter(t => t.isStarted).map(t => t.rate), 10)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full max-w-full">
      {/* LEFT & CENTER CONTENT: Bento Grid (8 cols on lg) */}
      <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6 w-full min-w-0">
        
        {/* Top Bento Row: 3 Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* BOX 1: Student Attendance on the Day (White Card) */}
          <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between min-h-[230px] transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#111315] block leading-tight">Today&apos;s Attendance</span>
                    <span className="text-[10px] text-[#737780] font-medium block">{todayInfo.dayName}</span>
                  </div>
                </div>
                <div className="text-[#8E929A] p-1" title="Options">
                  <MoreVertical className="w-4 h-4" />
                </div>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-[#111315] leading-none">
                    {todayInfo.todayAttendanceCount}
                  </span>
                  <span className="text-xs text-[#8E929A] font-medium">
                    / {todayInfo.totalStudents} Students
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBFD78] text-[#111315] text-[11px] font-bold">
                    {todayInfo.attendanceRate}% <span className="w-2 h-2 rounded-full border border-black inline-block" />
                  </span>
                </div>
                <p className="text-[11px] text-[#737780] mt-1 font-medium">
                  {todayInfo.todayVerifiedCount} verified &bull; {todayInfo.todayPendingCount} pending review
                </p>
              </div>
            </div>

            {/* Segmented Capsule Bar */}
            <div className="flex items-center gap-1.5 pt-2">
              {[...Array(9)].map((_, i) => {
                const filledCount = Math.max(
                  todayInfo.todayAttendanceCount > 0 ? 1 : 0,
                  Math.round((todayInfo.attendanceRate / 100) * 9)
                )
                const isFilled = i < filledCount
                return (
                  <div
                    key={i}
                    className={`h-7 sm:h-8 flex-1 rounded-full transition-all ${
                      isFilled
                        ? 'bg-[#111315]'
                        : 'border-2 border-dashed border-[#111315]/20 bg-transparent'
                    }`}
                  />
                )
              })}
            </div>
          </div>

          {/* BOX 2: Tutors Present Today & Names (Vibrant Lime Card) */}
          <div className="bg-[#EBFD78] rounded-[28px] p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[230px] transition-all hover:shadow-md text-[#111315]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111315] shadow-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#111315] block leading-tight">Tutors Present</span>
                    <span className="text-[10px] text-[#111315]/70 font-medium block">On Duty &bull; {todayInfo.dayName}</span>
                  </div>
                </div>
                <div className="text-[#111315]/60 p-1" title="Options">
                  <MoreVertical className="w-4 h-4" />
                </div>
              </div>

              <div className="my-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-[#111315] leading-none">
                    {todayInfo.tutorsPresentCount}
                  </span>
                  <span className="text-xs text-[#111315]/70 font-medium">
                    / {todayInfo.totalTutors || 1} Tutors
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#111315] text-[11px] font-bold shadow-xs">
                    {todayInfo.totalTutors > 0 ? Math.min(100, Math.round((todayInfo.tutorsPresentCount / todayInfo.totalTutors) * 100)) : 100}% Active <span className="w-2 h-2 rounded-full border border-black inline-block" />
                  </span>
                </div>

                {/* Who were the tutors present */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 min-h-[32px]">
                  {todayInfo.tutorsPresentList && todayInfo.tutorsPresentList.length > 0 ? (
                    todayInfo.tutorsPresentList.slice(0, 3).map((tutor) => (
                      <span
                        key={tutor.id}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/10 text-[#111315] text-[11px] font-semibold"
                        title={tutor.email || tutor.full_name}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="truncate max-w-[120px]">{tutor.full_name}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#111315]/70 font-medium italic">
                      No tutor evaluations submitted today yet
                    </span>
                  )}
                  {todayInfo.tutorsPresentList && todayInfo.tutorsPresentList.length > 3 && (
                    <span className="text-[10px] font-bold text-[#111315]/75">
                      +{todayInfo.tutorsPresentList.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Segmented Capsule Bar in Lime Card */}
            <div className="flex items-center gap-1.5 pt-2">
              {[...Array(9)].map((_, i) => {
                const filledRatio = todayInfo.totalTutors > 0 ? (todayInfo.tutorsPresentCount / todayInfo.totalTutors) : 1
                const filledCount = Math.max(
                  todayInfo.tutorsPresentCount > 0 ? 1 : 0,
                  Math.round(filledRatio * 9)
                )
                const isFilled = i < filledCount
                return (
                  <div
                    key={i}
                    className={`h-7 sm:h-8 flex-1 rounded-full transition-all ${
                      isFilled
                        ? 'bg-[#111315]'
                        : 'border-2 border-dashed border-[#111315]/30 bg-transparent'
                    }`}
                  />
                )
              })}
            </div>
          </div>

          {/* BOX 3: AI Assessment Engine Promo Card */}
          <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#16181B] via-[#101214] to-[#0A0B0C] rounded-[28px] p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[230px] text-white relative overflow-hidden group">
            {/* Ambient Background Graphic & Light effect */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(235,253,120,0.15),transparent_70%)] pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between">
              <h3 className="font-bold text-base sm:text-lg leading-snug tracking-tight max-w-[200px] sm:max-w-[150px]">
                Automate Verification with AI Assessment
              </h3>
              <span className="text-[#EBFD78] text-sm font-bold">↗</span>
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

        {/* Card 4: Large Statistics Chart Card — Monday to Saturday Weekly Trends */}
        <div className="bg-white rounded-[28px] p-5 sm:p-8 border border-black/[0.06] shadow-sm w-full min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#111315] tracking-tight">
                  Attendance Trends
                </h2>
                <span className="text-[11px] text-[#737780] font-medium block">
                  Monday to Saturday &bull; Current Week
                </span>
              </div>

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
                <Clock className="w-3.5 h-3.5 text-[#737780]" />
                <span>Mon &ndash; Sat (Opens Daily)</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#737780]" />
              </div>
            </div>
          </div>

          {/* Capsule Pillar Chart Graphic: 6 Columns for Mon to Sat */}
          <div className="relative pt-8 pb-3 w-full overflow-hidden">
            {/* Horizontal Guide Lines */}
            <div className="absolute inset-x-0 top-0 bottom-16 flex flex-col justify-between pointer-events-none opacity-40">
              {['100%', '80%', '60%', '40%', '20%'].map((val) => (
                <div key={val} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] font-mono text-[#9CA3AF] w-7 sm:w-8 text-right">{val}</span>
                  <div className="flex-1 border-b border-dashed border-[#E5E7EB]" />
                </div>
              ))}
            </div>

            {/* Pill Bars — 6 Columns (Mon to Sat) */}
            <div className="relative z-10 flex items-end justify-between pl-8 sm:pl-10 pr-2 sm:pr-4 h-[220px] sm:h-[240px]">
              {trends.map((day) => {
                // If day is started, calculate bar heights based on real rate
                const maxBarHeight = 170
                const calculatedHeight = day.isStarted
                  ? Math.max(30, Math.round((Math.max(day.rate, day.attendanceCount > 0 ? 30 : 15) / 100) * maxBarHeight))
                  : 45

                const limeHeight = day.isStarted
                  ? Math.max(16, Math.round(calculatedHeight * 0.25))
                  : 0

                const isPeak = day.isStarted && (day.rate === peakRate && day.rate > 0)
                const showFloatingBadge = day.isToday || isPeak

                return (
                  <div key={day.dayName} className="flex flex-col items-center gap-2 w-10 sm:w-12 md:w-14 relative group">
                    {/* Floating Pill Tag (Shows for Today or Peak Active Day) */}
                    {showFloatingBadge && day.isStarted && (
                      <div
                        className={`absolute -top-7 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-xs whitespace-nowrap z-20 ${
                          day.isToday
                            ? 'bg-[#EBFD78] text-[#111315] border border-black/10'
                            : 'bg-[#111315] text-white'
                        }`}
                      >
                        {day.rate > 0 ? `${day.rate}%` : (day.attendanceCount > 0 ? `${day.attendanceCount} Present` : 'Today')}
                      </div>
                    )}

                    {/* Small Dot Indicator */}
                    {day.isStarted && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8E929A] mb-0.5" />
                    )}

                    {/* Pillar Body */}
                    {day.isStarted ? (
                      <div
                        style={{ height: `${calculatedHeight}px` }}
                        className={`w-full rounded-full transition-all flex flex-col justify-end p-1 shadow-sm ${
                          day.isToday
                            ? 'bg-[#111315] ring-2 ring-[#EBFD78] ring-offset-1'
                            : 'bg-[#111315]'
                        }`}
                        title={`${day.dayFull}: ${day.attendanceCount} check-ins, ${day.verifiedCount} verified`}
                      >
                        {/* Lime base representing active sessions */}
                        <div
                          style={{ height: `${limeHeight}px` }}
                          className="w-full rounded-full bg-[#EBFD78] mt-auto transition-all"
                        />
                      </div>
                    ) : (
                      /* Upcoming Future Day in Week (Not started yet) */
                      <div
                        style={{ height: '45px' }}
                        className="w-full rounded-full border-2 border-dashed border-[#111315]/25 bg-transparent flex items-center justify-center transition-all opacity-60"
                        title={`${day.dayFull}: Opens when day starts`}
                      >
                        <span className="text-[9px] font-bold text-[#737780] rotate-90 sm:rotate-0">
                          &bull;&bull;&bull;
                        </span>
                      </div>
                    )}

                    {/* Day Label & Date beneath pillar */}
                    <div className="flex flex-col items-center text-center mt-1">
                      <span className={`text-xs font-bold ${day.isToday ? 'text-[#111315]' : 'text-[#737780]'}`}>
                        {day.dayName}
                      </span>
                      <span className="text-[10px] text-[#9CA3AF] font-mono leading-none mt-0.5">
                        {day.dateFormatted}
                      </span>
                      {day.isToday ? (
                        <span className="mt-1 px-1.5 py-0.2 rounded-full bg-[#111315] text-[#EBFD78] text-[8px] font-bold uppercase tracking-wider">
                          Today
                        </span>
                      ) : !day.isStarted ? (
                        <span className="mt-1 text-[8px] text-[#9CA3AF] font-medium">
                          Upcoming
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
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
