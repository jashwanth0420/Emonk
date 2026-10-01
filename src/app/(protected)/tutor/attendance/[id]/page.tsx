import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { reviewAttendanceAction } from '../../actions'
import { redirect } from 'next/navigation'

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: record } = await supabase
    .from('attendance')
    .select(`
      *,
      profiles:student_id (full_name, register_number),
      schedules (title, date),
      questions (question_text, expected_concepts),
      question_attempts (answer_text, ai_evaluation, evaluation_status)
    `)
    .eq('id', id)
    .single()

  if (!record) {
    redirect('/tutor/attendance')
  }

  const attempt = Array.isArray(record.question_attempts) ? record.question_attempts[0] : record.question_attempts

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review Attendance</h1>
        <a href="/tutor/attendance" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
          Back to List
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Data</CardTitle>
              <CardDescription>Review the student's submission carefully.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Question</h3>
                <p className="bg-muted p-4 rounded-md text-sm">
                  {record.questions?.question_text || "No specific question assigned."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Student's Answer</h3>
                <p className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap font-medium">
                  {attempt?.answer_text || "No answer submitted."}
                </p>
              </div>

              {attempt?.ai_evaluation && (
                <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-md">
                  <h3 className="font-semibold text-sm text-blue-800 mb-2">AI Evaluation (Advisory)</h3>
                  <div className="space-y-2 text-sm text-blue-900">
                    <p><strong>Relevance:</strong> {(attempt.ai_evaluation as any).relevance || "N/A"}</p>
                    <p><strong>Feedback:</strong> {(attempt.ai_evaluation as any).feedback}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Name:</strong> {record.profiles?.full_name}</p>
              <p><strong>Session:</strong> {record.schedules?.title}</p>
              <p><strong>Date:</strong> {new Date(record.attendance_date).toLocaleDateString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tutor Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={reviewAttendanceAction} className="space-y-4">
                <input type="hidden" name="attendance_id" value={record.id} />
                
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea 
                    id="feedback" 
                    name="feedback" 
                    placeholder="Great job explaining the time complexity..." 
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button type="submit" name="action" value="rejected" variant="destructive">
                    Reject
                  </Button>
                  <Button type="submit" name="action" value="approved" variant="default">
                    Approve
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
