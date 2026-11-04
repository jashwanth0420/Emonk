import { createAdminClient } from '@/lib/supabase/admin'
import { AnalyticsCharts } from '@/components/charts/AnalyticsCharts'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { unstable_cache } from 'next/cache'

const adminPillTabs = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/tutors', label: 'Tutors' },
  { href: '/admin/schedules', label: 'Schedules' },
  { href: '/admin/topics', label: 'Topics' },
  { href: '/admin/questions', label: 'Question Bank' },
  { href: '/admin/ai', label: 'AI Generator' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/posts', label: 'Community Feed' },
]

const getCachedAnalyticsData = unstable_cache(
  async () => {
    const adminClient = createAdminClient()

    // Parallelized single Promise.all
    const [
      { data: profiles },
      { count: pendingReviews },
      { data: topics },
      { data: studentTopics },
      { data: assignments }
    ] = await Promise.all([
      adminClient.from('profiles').select('id, full_name, role'),
      adminClient.from('attendance').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      adminClient.from('topics').select('id, name'),
      adminClient.from('student_topics').select('topic_id'),
      adminClient.from('tutor_student_assignments').select('tutor_id, is_active')
    ])

    const studentCount = profiles?.filter(p => p.role === 'student').length || 0
    const tutors = profiles?.filter(p => p.role === 'tutor') || []
    const tutorCount = tutors.length

    const topicData = topics?.map(t => ({
      name: t.name,
      count: studentTopics?.filter(st => st.topic_id === t.id).length || 0
    })).sort((a, b) => b.count - a.count).slice(0, 5) || []

    const workloadData = tutors.map(t => ({
      name: t.full_name.split(' ')[0],
      pending: assignments?.filter(a => a.tutor_id === t.id && a.is_active).length || 0
    }))

    return {
      studentCount,
      tutorCount,
      pendingReviews: pendingReviews || 0,
      topicData,
      workloadData,
    }
  },
  ['admin-analytics-stats-v1'],
  { revalidate: 30, tags: ['analytics-data', 'dashboard-data'] }
)

export default async function AdminAnalyticsPage() {
  const { studentCount, tutorCount, pendingReviews, topicData, workloadData } = await getCachedAnalyticsData()

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Platform"
        firstLinePillIconName="Activity"
        firstLineSuffix="Analytics"
        secondLinePrefix="and"
        secondLineSuffix="Reports"
        actionLabel="+ New Schedule"
        actionHref="/admin/schedules"
        settingsHref="/admin/analytics"
      />

      <PillTabsBar tabs={adminPillTabs} className="mb-2" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#737780]">Total Students</span>
          <div className="text-3xl font-bold text-[#111315] mt-2">{studentCount}</div>
        </div>
        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#737780]">Active Tutors</span>
          <div className="text-3xl font-bold text-[#111315] mt-2">{tutorCount}</div>
        </div>
        <div className="bg-[#EBFD78] rounded-[28px] p-6 shadow-sm flex flex-col justify-between text-[#111315]">
          <span className="text-xs font-semibold text-[#111315]/80">Pending Reviews</span>
          <div className="text-3xl font-bold text-[#111315] mt-2">{pendingReviews}</div>
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm">
        <AnalyticsCharts topicData={topicData} workloadData={workloadData} />
      </div>
    </div>
  )
}
