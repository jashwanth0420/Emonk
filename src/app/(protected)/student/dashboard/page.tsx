import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, CheckCircle2, Clock, BookOpen, ArrowRight } from 'lucide-react'
import { checkInAction } from '../actions'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('full_name').eq('id', user?.id).single()

  const today = new Date().toISOString().split('T')[0]

  // 1. Check for today's active schedules
  const { data: todaySchedules } = await adminClient
    .from('schedules')
    .select('*, topics(name)')
    .eq('date', today)
    .eq('status', 'active')

  // 2. Fallback to latest available active schedule if none for today
  let activeSchedule = todaySchedules?.[0]
  if (!activeSchedule) {
    const { data: anySchedules } = await adminClient
      .from('schedules')
      .select('*, topics(name)')
      .eq('status', 'active')
      .order('date', { ascending: false })
      .limit(1)
    activeSchedule = anySchedules?.[0]
  }

  // 3. Check student attendance for the active schedule
  let attendanceRecord: any = null
  if (activeSchedule && user) {
    const { data } = await adminClient
      .from('attendance')
      .select('*')
      .eq('schedule_id', activeSchedule.id)
      .eq('student_id', user.id)
      .maybeSingle()
    attendanceRecord = data
  }

  // 4. Fetch attendance history
  const { data: history } = await adminClient
    .from('attendance')
    .select('id, status, attendance_date, schedules(title, topics(name))')
    .eq('student_id', user?.id)
    .order('attendance_date', { ascending: false })
    .limit(4)

  const approvedCount = history?.filter(h => h.status === 'approved').length || 0
  const pendingCount = history?.filter(h => h.status === 'pending_review').length || 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete today's concept assessment to mark verified attendance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's / Active Session Card */}
        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" /> Current Session
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
              </Badge>
            </div>
            <CardDescription>
              {activeSchedule?.date === today 
                ? "Active session for today" 
                : activeSchedule 
                  ? `Scheduled for ${new Date(activeSchedule.date).toLocaleDateString()}`
                  : "No scheduled sessions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeSchedule ? (
              <div className="space-y-4">
                <div className="rounded-lg border bg-background/50 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-base">{activeSchedule.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <BookOpen className="w-3.5 h-3.5" /> Topic: <span className="font-medium text-foreground">{activeSchedule.topics?.name || 'Curriculum Overview'}</span>
                      </p>
                    </div>
                    <Badge className="font-mono text-[11px]">
                      {activeSchedule.start_time.slice(0, 5)} - {activeSchedule.end_time.slice(0, 5)}
                    </Badge>
                  </div>

                  {!attendanceRecord ? (
                    <form action={checkInAction.bind(null, activeSchedule.id)}>
                      <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:opacity-90">
                        Check In & Begin Assessment
                      </Button>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center p-4 bg-muted/40 border rounded-md text-center space-y-2">
                      <Badge 
                        variant={attendanceRecord.status === 'approved' ? 'default' : attendanceRecord.status === 'pending_review' ? 'outline' : 'secondary'} 
                        className="uppercase text-xs"
                      >
                        Status: {attendanceRecord.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {attendanceRecord.status === 'checked_in' && "You've checked in! Please complete your topic selection."}
                        {attendanceRecord.status === 'question_assigned' && "Your targeted assessment question is ready for you."}
                        {attendanceRecord.status === 'pending_review' && "Your answer has been submitted and is pending tutor verification."}
                        {attendanceRecord.status === 'approved' && "Attendance confirmed and approved by your tutor!"}
                      </p>
                      {['checked_in', 'question_assigned'].includes(attendanceRecord.status) && (
                        <Link 
                          href="/student/attendance" 
                          className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 w-full mt-2"
                        >
                          Continue Session Assessment <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground border rounded-lg bg-muted/20 text-xs space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="font-medium">No sessions scheduled right now.</p>
                <p className="text-[11px]">Check with your administrator or browse the Central Feed for upcoming dates.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats & Recent History */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card/90 backdrop-blur-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs">Approved Sessions</CardDescription>
                <CardTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {approvedCount}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-card/90 backdrop-blur-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs">Under Review</CardDescription>
                <CardTitle className="text-2xl font-bold text-amber-500">
                  {pendingCount}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="bg-card/90 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Recent Attendance Log</CardTitle>
              <Link href="/student/calendar" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Calendar <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history?.map((rec: any) => (
                  <div key={rec.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50 text-xs">
                    <div>
                      <p className="font-semibold text-sm">{rec.schedules?.title || 'Session'}</p>
                      <p className="text-muted-foreground">{rec.schedules?.topics?.name || 'General'} • {new Date(rec.attendance_date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={rec.status === 'approved' ? 'default' : rec.status === 'rejected' ? 'destructive' : 'outline'} className="uppercase text-[10px]">
                      {rec.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {(!history || history.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-6">No previous sessions attended yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}