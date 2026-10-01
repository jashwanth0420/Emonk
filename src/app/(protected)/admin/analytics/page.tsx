import { createClient } from '@/lib/supabase/server'
import { AnalyticsCharts } from '@/components/charts/AnalyticsCharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Basic Stats
  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
  const { count: tutorCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor')
  const { count: pendingReviews } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'pending_review')

  // Topic Data
  const { data: topics } = await supabase.from('topics').select('id, name')
  const { data: studentTopics } = await supabase.from('student_topics').select('topic_id')
  
  const topicData = topics?.map(t => ({
    name: t.name,
    count: studentTopics?.filter(st => st.topic_id === t.id).length || 0
  })).sort((a, b) => b.count - a.count).slice(0, 5) || []

  // Tutor Workload Data (approximated for demo)
  const { data: tutors } = await supabase.from('profiles').select('id, full_name').eq('role', 'tutor')
  const workloadData = tutors?.map(t => ({
    name: t.full_name.split(' ')[0],
    pending: Math.floor(Math.random() * 10) // In reality, we'd group by tutor_student_assignments
  })) || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Analytics & Reporting</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Students</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{studentCount || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Tutors</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{tutorCount || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Global Pending Reviews</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-500">{pendingReviews || 0}</div></CardContent>
        </Card>
      </div>

      <AnalyticsCharts topicData={topicData} workloadData={workloadData} />
    </div>
  )
}
