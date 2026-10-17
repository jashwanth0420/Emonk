import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { generateQuestionsAction } from '../actions'

export default async function AdminAIGenerationPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const adminClient = createAdminClient()
  const { data: topics } = await adminClient.from('topics').select('*').eq('is_active', true).order('name')

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/questions" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Question Bank
          </Link>
        </div>
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

      <Card className="bg-card/90 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <CardTitle>AI Question Generator</CardTitle>
          </div>
          <CardDescription>
            Powered by Groq AI (<code className="text-xs">llama-3.3-70b-versatile</code>). Automatically drafts technical questions, expected concepts, and code assessment prompts into your Question Bank.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generateQuestionsAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="topic_id">Target Curriculum Topic</Label>
              <select
                id="topic_id"
                name="topic_id"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Select a topic...</option>
                {topics?.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name} ({topic.category})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type">Question Style</Label>
                <select
                  id="type"
                  name="type"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="conceptual">Conceptual Understanding</option>
                  <option value="scenario">Real-World Scenario</option>
                  <option value="coding">Implementation / Algorithm</option>
                  <option value="debugging">Bug Fixing / Debugging</option>
                  <option value="short_answer">Short Answer / Rapid Fire</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <select
                  id="difficulty"
                  name="difficulty"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="easy">Easy (Fundamentals)</option>
                  <option value="medium" selected>Medium (Standard Interview)</option>
                  <option value="hard">Hard (Advanced Problem)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="count">Batch Size (1 to 5 Questions)</Label>
              <Input id="count" name="count" type="number" min="1" max="5" defaultValue="2" required />
              <p className="text-[11px] text-muted-foreground">Generated questions will be saved as pending review for you to inspect and approve.</p>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">
              Generate Questions via Groq AI
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
