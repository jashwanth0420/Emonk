import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function StudentCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: history } = await supabase
    .from('attendance')
    .select('*, schedules(title, start_time, end_time, topics(name))')
    .eq('student_id', user?.id)
    .order('attendance_date', { ascending: false })
    .limit(30)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending_review': return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Attendance Calendar</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent History (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history?.map((record: any) => (
              <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex flex-col space-y-1">
                  <span className="font-semibold text-lg">{new Date(record.attendance_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  <span className="text-sm text-muted-foreground">{record.schedules?.title} - {record.schedules?.topics?.name}</span>
                  <span className="text-xs text-muted-foreground">Time: {record.schedules?.start_time?.slice(0,5)} - {record.schedules?.end_time?.slice(0,5)}</span>
                </div>
                
                <div className="mt-4 sm:mt-0 flex flex-col items-end">
                  <Badge className={`uppercase px-3 py-1 ${getStatusColor(record.status)}`} variant="outline">
                    {record.status.replace('_', ' ')}
                  </Badge>
                  {record.tutor_feedback && (
                    <span className="text-xs mt-2 text-muted-foreground italic max-w-xs text-right line-clamp-1" title={record.tutor_feedback}>
                      "{record.tutor_feedback}"
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {(!history || history.length === 0) && (
              <div className="text-center py-10 text-muted-foreground">
                No attendance records found. Start attending sessions!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}