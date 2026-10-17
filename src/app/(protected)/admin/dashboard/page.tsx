import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, UserSquare, Calendar, BookOpen, HelpCircle, CheckSquare, Sparkles, PlusCircle, ArrowRight } from 'lucide-react'

export default async function AdminDashboard() {
  const adminClient = createAdminClient()

  // Real-time metrics
  const [
    { count: studentCount },
    { count: tutorCount },
    { count: topicCount },
    { count: scheduleCount },
    { count: questionCount },
    { count: pendingReviewCount },
    { data: recentAttendance },
    { data: upcomingSchedules }
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
    adminClient.from('topics').select('*', { count: 'exact', head: true }).eq('is_active', true),
    adminClient.from('schedules').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminClient.from('questions').select('*', { count: 'exact', head: true }).eq('is_active', true),
    adminClient.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    adminClient.from('attendance')
      .select('id, attendance_date, status, profiles:student_id(full_name), schedules(title)')
      .order('attendance_date', { ascending: false })
      .limit(5),
    adminClient.from('schedules')
      .select('id, title, date, start_time, end_time, topics(name)')
      .order('date', { ascending: false })
      .limit(3)
  ])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System health, active student attendances, and automated verification pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/ai"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-xs shadow hover:opacity-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Generator
          </Link>
          <Link
            href="/admin/schedules"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium text-xs shadow hover:opacity-90 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" /> New Schedule
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              Students <Users className="w-4 h-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{studentCount || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              Tutors <UserSquare className="w-4 h-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{tutorCount || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              Curriculum Topics <BookOpen className="w-4 h-4 text-purple-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{topicCount || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              Active Schedules <Calendar className="w-4 h-4 text-indigo-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{scheduleCount || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              Question Bank <HelpCircle className="w-4 h-4 text-cyan-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{questionCount || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card/90 backdrop-blur-md border-amber-500/30">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs text-amber-600 font-medium">
              Pending Reviews <CheckSquare className="w-4 h-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">{pendingReviewCount || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Sections Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Attendance Submissions */}
        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Attendance Records</CardTitle>
              <CardDescription className="text-xs">Latest student submissions across all schedules</CardDescription>
            </div>
            <Link href="/admin/analytics" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttendance?.map((rec: any) => (
                <div key={rec.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50 text-xs">
                  <div>
                    <p className="font-semibold text-sm">{rec.profiles?.full_name || 'Student'}</p>
                    <p className="text-muted-foreground">{rec.schedules?.title} • {new Date(rec.attendance_date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={rec.status === 'approved' ? 'default' : rec.status === 'pending_review' ? 'outline' : 'secondary'} className="uppercase text-[10px]">
                    {rec.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {(!recentAttendance || recentAttendance.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No attendance records logged yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Schedules & Quick Setup */}
        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Active & Upcoming Sessions</CardTitle>
              <CardDescription className="text-xs">Scheduled learning blocks students can check into</CardDescription>
            </div>
            <Link href="/admin/schedules" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              All Schedules <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSchedules?.map((s) => (
                <div key={s.id} className="p-3 rounded-lg border bg-background/50 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{s.title}</span>
                    <Badge variant="outline" className="text-[10px]">{s.topics?.name || 'General'}</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Date: {new Date(s.date).toLocaleDateString()} | Time: {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                  </p>
                </div>
              ))}
              {(!upcomingSchedules || upcomingSchedules.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No upcoming schedules. Click "New Schedule" above to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
