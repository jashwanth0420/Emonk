import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { reviewGeneratedQuestionAction } from '../actions'

export default async function AdminQuestionsPage() {
  const supabase = await createClient()
  
  const { data: questions } = await supabase
    .from('questions')
    .select('*, topics(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <a href="/admin/ai" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
          Generate with AI
        </a>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions?.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="whitespace-nowrap">{q.topics?.name}</TableCell>
                <TableCell className="max-w-xs truncate">{q.question_text}</TableCell>
                <TableCell className="capitalize">{q.question_type.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Badge variant={q.review_status === 'active' ? 'default' : q.review_status === 'ai_generated' ? 'secondary' : 'destructive'} className="capitalize">
                    {q.review_status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {q.review_status === 'ai_generated' && (
                    <form action={reviewGeneratedQuestionAction} className="flex gap-2">
                      <input type="hidden" name="question_id" value={q.id} />
                      <Button size="sm" variant="default" name="action" value="approve">Approve</Button>
                      <Button size="sm" variant="destructive" name="action" value="reject">Reject</Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!questions || questions.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No questions in bank.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
