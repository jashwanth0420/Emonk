import { createAdminClient } from '@/lib/supabase/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { Sparkles, PlusCircle } from 'lucide-react'
import { reviewGeneratedQuestionAction, createQuestionAction } from '../actions'

export default async function AdminQuestionsPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const adminClient = createAdminClient()
  
  const [
    { data: questions },
    { data: topics }
  ] = await Promise.all([
    adminClient.from('questions').select('*, topics(name)').order('created_at', { ascending: false }),
    adminClient.from('topics').select('id, name').eq('is_active', true).order('name')
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Targeted concept questions automatically presented to students upon session check-in.
          </p>
        </div>
        <Link 
          href="/admin/ai" 
          className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow hover:opacity-90 h-9 px-3.5 py-2"
        >
          <Sparkles className="w-3.5 h-3.5" /> Generate in Bulk with AI
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-md bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual Question Creator */}
        <div className="lg:col-span-1 border rounded-lg p-5 bg-card/90 backdrop-blur-md h-fit space-y-4">
          <div className="flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-semibold">Add Question Manually</h2>
          </div>
          <form action={createQuestionAction} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="topic_id">Topic</Label>
              <select
                id="topic_id"
                name="topic_id"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Select Curriculum Topic...</option>
                {topics?.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="question_type">Type</Label>
                <select
                  id="question_type"
                  name="question_type"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="conceptual">Conceptual</option>
                  <option value="coding">Coding</option>
                  <option value="debugging">Debugging</option>
                  <option value="scenario">Scenario</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  name="difficulty"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="question_text">Question Prompt</Label>
              <Textarea
                id="question_text"
                name="question_text"
                required
                placeholder="Explain the time complexity of QuickSort best vs worst case..."
                className="min-h-[90px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expected_concepts">Expected Key Concepts</Label>
              <Input
                id="expected_concepts"
                name="expected_concepts"
                placeholder="O(N log N), O(N^2), pivot selection"
              />
              <p className="text-[11px] text-muted-foreground">Comma-separated key phrases the AI/Tutor will check.</p>
            </div>

            <Button type="submit" className="w-full">Save to Question Bank</Button>
          </form>
        </div>

        {/* Question Bank Table */}
        <div className="lg:col-span-2 border rounded-lg overflow-hidden bg-card/90 backdrop-blur-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Question Preview</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions?.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-semibold text-xs whitespace-nowrap">{q.topics?.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs" title={q.question_text}>
                    {q.question_text}
                  </TableCell>
                  <TableCell className="capitalize text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      q.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {q.difficulty}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={q.review_status === 'active' ? 'default' : q.review_status === 'ai_generated' ? 'secondary' : 'destructive'} className="capitalize text-[10px]">
                      {q.review_status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {q.review_status === 'ai_generated' ? (
                      <form action={reviewGeneratedQuestionAction} className="flex justify-end gap-1.5">
                        <input type="hidden" name="question_id" value={q.id} />
                        <Button size="sm" variant="default" name="action" value="approve" className="h-7 text-[11px] px-2.5">
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" name="action" value="reject" className="h-7 text-[11px] px-2.5">
                          Reject
                        </Button>
                      </form>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {q.is_active ? 'Active' : 'Archived'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!questions || questions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                    No questions in the bank yet. Add your first question on the left, or use the AI Generator!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
