import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { checkInAction } from '../actions'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single()

  const today = new Date().toISOString().split('T')[0]

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*, topics(name)')
    .eq('date', today)
    .eq('status', 'active')

  const todaysSchedule = schedules?.[0]

  let attendanceRecord = null
  if (todaysSchedule) {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('schedule_id', todaysSchedule.id)
      .eq('student_id', user?.id)
      .single()
    attendanceRecord = data
  }

  const { data: history } = await supabase
    .from('attendance')
    .select('id, status, attendance_date, schedules(title, topics(name))')
    .eq('student_id', user?.id)
    .order('attendance_date', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Good Morning, {profile?.full_name?.split(' ')[0] || 'Student'}</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Session</CardTitle>
            <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysSchedule ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold text-lg">{todaysSchedule.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {todaysSchedule.start_time.slice(0,5)} - {todaysSchedule.end_time.slice(0,5)} - Topic: {todaysSchedule.topics?.name || 'General'}
                  </p>
                  
                  {!attendanceRecord ? (
                    <form action={checkInAction.bind(null, todaysSchedule.id)}>
                      <Button type="submit" className="w-full">Mark Attendance</Button>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center p-4 bg-background border rounded-md">
                      <Badge variant={attendanceRecord.status === 'approved' ? 'default' : 'secondary'} className="mb-2 uppercase">
                        {attendanceRecord.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-center text-muted-foreground">
                        {attendanceRecord.status === 'checked_in' && "You've checked in. Please complete your topic selection."}
                        {attendanceRecord.status === 'question_assigned' && "Please answer your assigned question."}
                        {attendanceRecord.status === 'pending_review' && "Your submission is pending review by a tutor."}
                        {attendanceRecord.status === 'approved' && "Your attendance has been approved!"}
                      </p>
                      {['checked_in', 'question_assigned'].includes(attendanceRecord.status) && (
                        <Button asChild className="w-full mt-4" variant="outline">
                          <a href="/student/attendance">Continue Session</a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground border rounded-lg bg-muted/50">
                No active session scheduled for today.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Reviews</CardDescription>
                <CardTitle className="text-3xl">
                  {history?.filter(h => h.status === 'pending_review').length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history?.map((record) => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{new Date(record.attendance_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-sm text-muted-foreground">{record.schedules?.topics?.name}</p>
                    </div>
                    <Badge variant={record.status === 'approved' ? 'default' : record.status === 'rejected' ? 'destructive' : 'outline'} className="uppercase">
                      {record.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {(!history || history.length === 0) && (
                  <p className="text-sm text-muted-foreground">No recent activity found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}