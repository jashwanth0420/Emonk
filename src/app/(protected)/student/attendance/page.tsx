import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { submitTopicsAction, submitAnswerAction } from '../actions'

export default async function AttendanceFlowPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*, schedules(title, date), questions(question_text, expected_concepts)')
    .eq('student_id', user?.id)
    .eq('attendance_date', today)
    .single()

  if (!attendance) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Active Check-in</h2>
          <p className="text-muted-foreground">Please go to your dashboard to check in first.</p>
          <a href="/student/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">Go to Dashboard</a>
        </div>
      </div>
    )
  }

  // STATE 1: Checked in -> Needs Topic Selection
  if (attendance.status === 'checked_in') {
    const { data: topics } = await supabase.from('topics').select('*').eq('is_active', true)
    
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>What did you learn today?</CardTitle>
            <CardDescription>Select the topics you covered in {attendance.schedules?.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitTopicsAction} className="space-y-6">
              <input type="hidden" name="attendance_id" value={attendance.id} />
              <input type="hidden" name="schedule_id" value={attendance.schedule_id} />
              
              <div className="space-y-4">
                {topics?.map((topic) => (
                  <div key={topic.id} className="flex items-center space-x-2 border p-3 rounded-md">
                    <Checkbox id={topic.id} name="topics" value={topic.id} />
                    <div className="grid gap-1.5 leading-none pl-2">
                      <Label htmlFor={topic.id} className="cursor-pointer">{topic.name}</Label>
                      <p className="text-sm text-muted-foreground">{topic.category}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button type="submit" className="w-full">Continue to Assessment</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // STATE 2: Question Assigned -> Needs Answer
  if (attendance.status === 'question_assigned') {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Session Assessment</CardTitle>
            <CardDescription>Please answer the following question to complete your attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitAnswerAction} className="space-y-6">
              <input type="hidden" name="attendance_id" value={attendance.id} />
              <input type="hidden" name="question_id" value={attendance.question_id || ''} />
              
              <div className="bg-muted p-6 rounded-lg mb-6 border">
                <h3 className="font-semibold text-lg mb-2">Question:</h3>
                <p>{attendance.questions?.question_text || (attendance.question_id ? "Loading question..." : "No questions available for this topic. Type 'N/A' to continue.")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Your Answer</Label>
                <Textarea 
                  id="answer" 
                  name="answer" 
                  placeholder="Explain your approach..." 
                  className="min-h-[200px]"
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full">Submit Answer & Complete Check-in</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // STATE 3: Pending Review or Approved
  return (
    <div className="max-w-2xl mx-auto mt-16 text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
        ?
      </div>
      <h2 className="text-3xl font-bold">Check-in Complete!</h2>
      <p className="text-lg text-muted-foreground">
        Your attendance and assessment have been submitted. <br />
        Status: <strong className="uppercase">{attendance.status.replace('_', ' ')}</strong>
      </p>
      <a href="/student/dashboard" className="mt-8 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">Return to Dashboard</a>
    </div>
  )
}
