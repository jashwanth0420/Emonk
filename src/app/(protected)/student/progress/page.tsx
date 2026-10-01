import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { calculateAttendancePercentage } from '@/lib/attendance/calculation'
import { Progress } from '@/components/ui/progress'

export default async function StudentProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch Attendance
  const { data: attendance } = await supabase
    .from('attendance')
    .select('status, schedules(status)')
    .eq('student_id', user?.id)

  const formattedAttendance = attendance?.map(a => ({
    status: a.status,
    schedule_status: (a.schedules as any)?.status || 'active'
  })) || []

  const attendancePercent = calculateAttendancePercentage(formattedAttendance)

  // Fetch Topics learned
  const { data: studentTopics } = await supabase
    .from('student_topics')
    .select('topics(name)')
    .eq('student_id', user?.id)

  const topicCounts = studentTopics?.reduce((acc: any, curr: any) => {
    const name = curr.topics?.name
    if (name) acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const topTopics = Object.entries(topicCounts || {})
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 4)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">My Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
            <CardDescription>Based on approved sessions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-bold text-blue-600 mb-4">{attendancePercent}%</div>
            <Progress value={attendancePercent} className="w-full h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Mastery Overview</CardTitle>
            <CardDescription>Most frequently learned subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topTopics.length > 0 ? topTopics.map(([name, count]: any) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">{count} sessions</span>
                </div>
                <Progress value={Math.min(count * 10, 100)} className="h-2 bg-muted" />
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No topics learned yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
