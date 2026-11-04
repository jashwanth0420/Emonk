import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles } from 'lucide-react'
import { generateQuestionsAction } from '../actions'
import { unstable_cache } from 'next/cache'

const adminPillTabs = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/tutors', label: 'Tutors' },
  { href: '/admin/schedules', label: 'Schedules' },
  { href: '/admin/topics', label: 'Topics' },
  { href: '/admin/questions', label: 'Question Bank' },
  { href: '/admin/ai', label: 'AI Generator' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/posts', label: 'Community Feed' },
]

const getCachedTopics = unstable_cache(
  async () => {
    const adminClient = createAdminClient()
    const { data: topics } = await adminClient.from('topics').select('*').eq('is_active', true).order('name')
    return { topics: topics || [] }
  },
  ['admin-ai-topics-v1'],
  { revalidate: 10, tags: ['topics-data'] }
)

export default async function AdminAIGenerationPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const { topics } = await getCachedTopics()

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Managing"
        firstLinePillIconName="Brain"
        firstLineSuffix="AI Assessment"
        secondLinePrefix="and"
        secondLineSuffix="Generation"
        actionLabel="View Question Bank"
        actionHref="/admin/questions"
        settingsHref="/admin/analytics"
      />

      <PillTabsBar tabs={adminPillTabs} className="mb-2" />

      {success && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-800 text-sm font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="max-w-2xl mx-auto rounded-[28px] border border-black/[0.06] p-6 sm:p-8 bg-white shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EBFD78] flex items-center justify-center text-[#111315]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111315]">AI Question Generator</h2>
            <p className="text-xs text-[#737780]">Powered by Groq AI. Automatically draft technical interview questions into your Question Bank.</p>
          </div>
        </div>

        <form action={generateQuestionsAction} className="space-y-4 pt-2" autoComplete="off">
          <div className="space-y-1.5">
            <Label htmlFor="topic_id" className="text-xs font-semibold text-[#111315]">Target Curriculum Topic</Label>
            <select
              id="topic_id"
              name="topic_id"
              required
              defaultValue=""
              className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-1 text-sm shadow-xs text-[#111315]"
            >
              <option value="" disabled>Select a topic...</option>
              {topics?.map((topic) => (
                <option key={topic.id} value={topic.id}>{topic.name} ({topic.category})</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-semibold text-[#111315]">Question Style</Label>
              <select
                id="type"
                name="type"
                required
                className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-1 text-sm shadow-xs text-[#111315]"
              >
                <option value="conceptual">Conceptual Understanding</option>
                <option value="scenario">Real-World Scenario</option>
                <option value="coding">Implementation / Algorithm</option>
                <option value="debugging">Bug Fixing / Debugging</option>
                <option value="short_answer">Short Answer / Rapid Fire</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="difficulty" className="text-xs font-semibold text-[#111315]">Difficulty Level</Label>
              <select
                id="difficulty"
                name="difficulty"
                required
                defaultValue="medium"
                className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-1 text-sm shadow-xs text-[#111315]"
              >
                <option value="easy">Easy (Fundamentals)</option>
                <option value="medium">Medium (Standard Interview)</option>
                <option value="hard">Hard (Advanced Problem)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom_prompt" className="text-xs font-semibold text-[#111315]">
              Prompt / Specific Guidance <span className="text-[#737780] font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="custom_prompt"
              name="custom_prompt"
              placeholder="e.g. Focus on memory leaks, closures, or time complexity trade-offs..."
              rows={3}
              className="rounded-xl border-black/[0.08]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="count" className="text-xs font-semibold text-[#111315]">Batch Size (1 to 5 Questions)</Label>
            <Input id="count" name="count" type="number" min="1" max="5" defaultValue="2" required className="rounded-xl border-black/[0.08]" />
          </div>

          <Button type="submit" className="w-full rounded-full bg-[#111215] hover:bg-black text-white font-semibold py-2.5">
            Generate Questions via AI
          </Button>
        </form>
      </div>
    </div>
  )
}
