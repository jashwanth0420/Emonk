import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { generateQuestionsAction } from '../actions'

export default async function AdminAIGenerationPage() {
  const supabase = await createClient()
  const { data: topics } = await supabase.from('topics').select('*').eq('is_active', true)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Question Generation</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Question Bank</CardTitle>
          <CardDescription>Use Groq AI to rapidly generate technical questions for active topics.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generateQuestionsAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic_id">Topic</Label>
              <select id="topic_id" name="topic_id" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                <option value="">Select a topic...</option>
                {topics?.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Question Type</Label>
                <select id="type" name="type" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="conceptual">Conceptual</option>
                  <option value="scenario">Scenario</option>
                  <option value="coding">Coding</option>
                  <option value="debugging">Debugging</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select id="difficulty" name="difficulty" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of Questions (1-10)</Label>
              <Input id="count" name="count" type="number" min="1" max="10" defaultValue="3" required />
            </div>

            <Button type="submit" className="w-full">Generate & Queue for Review</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
