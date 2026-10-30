import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, BookOpen, HelpCircle } from 'lucide-react'
import { submitTopicsAction, submitAnswerAction } from '../actions'

export default async function AttendanceFlowPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()

  // Fetch the latest active or in-progress attendance record
  const { data: attendances } = await adminClient
    .from('attendance')
    .select('*, schedules(title, date), questions(question_text, expected_concepts)')
    .eq('student_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const attendance = attendances?.[0]

  if (!attendance) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md text-center p-6 bg-card shadow-sm space-y-4">
          <h2 className="text-xl font-bold">No Active Check-in Found</h2>
          <p className="text-xs text-muted-foreground">
            Please navigate to your dashboard and check into today&apos;s active session first.
          </p>
          <Link 
            href="/student/dashboard" 
            className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 w-full"
          >
            Go to Student Dashboard
          </Link>
        </Card>
      </div>
    )
  }

  // STATE 1: Checked in -> Needs Topic Selection
  if (attendance.status === 'checked_in') {
    const { data: topics } = await adminClient.from('topics').select('*').eq('is_active', true).order('name')
    
    return (
      <div className="max-w-2xl mx-auto mt-6">
        <Card className="bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <CardTitle>What did you study today?</CardTitle>
            </div>
            <CardDescription>
              Select the topics covered during <strong>{attendance.schedules?.title || 'your session'}</strong> to receive your targeted concept assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitTopicsAction} className="space-y-6">
              <input type="hidden" name="attendance_id" value={attendance.id} />
              <input type="hidden" name="schedule_id" value={attendance.schedule_id} />
              
              <div className="space-y-2.5">
                {topics?.map((topic) => (
                  <label key={topic.id} className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="topics" 
                      value={topic.id}
                      className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-orange-500" 
                    />
                    <div className="grid gap-0.5 text-xs">
                      <span className="font-semibold text-sm">{topic.name}</span>
                      <span className="text-muted-foreground">{topic.category}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white font-medium transition-colors">
                Continue to Assessment Question
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // STATE 2: Question Assigned -> Needs Answer
  if (attendance.status === 'question_assigned') {
    return (
      <div className="max-w-3xl mx-auto mt-6">
        <Card className="bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" />
              <CardTitle>Session Assessment Question</CardTitle>
            </div>
            <CardDescription>
              Demonstrate your conceptual grasp to verify your presence and earn attendance credit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitAnswerAction} className="space-y-6">
              <input type="hidden" name="attendance_id" value={attendance.id} />
              <input type="hidden" name="question_id" value={attendance.question_id || ''} />
              
              <div className="bg-muted/60 p-5 rounded-lg border space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned Question:</span>
                <p className="text-sm font-medium leading-relaxed">
                  {attendance.questions?.question_text || "Explain the core concepts, edge cases, and algorithmic complexity of the problems you worked on today."}
                </p>
                {attendance.questions?.expected_concepts && attendance.questions.expected_concepts.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Key concepts to mention:</span>
                    {attendance.questions.expected_concepts.map((c: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[10px] py-0">{c}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer" className="text-xs">Your Answer / Approach Explanation</Label>
                <Textarea 
                  id="answer" 
                  name="answer" 
                  placeholder="Explain your thought process, data structures used, time & space complexity..." 
                  className="min-h-[180px] text-sm"
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white font-medium transition-colors">
                Submit Answer for Verification
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // STATE 3: Pending Review or Approved
  return (
    <div className="max-w-xl mx-auto mt-12 text-center space-y-5">
      <Card className="p-8 bg-card shadow-sm space-y-4">
        <div className="mx-auto w-14 h-14 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Assessment Submitted!</h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Your attendance log and conceptual answer have been securely recorded.
        </p>
        <div className="p-3 bg-muted/50 rounded-lg inline-block text-xs font-mono">
          Current Status: <strong className="uppercase text-accent font-bold">{attendance.status.replace('_', ' ')}</strong>
        </div>
        <div>
          <Link 
            href="/student/dashboard" 
            className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-6 mt-4"
          >
            Return to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  )
}
