import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createTopicAction } from '../actions'
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

const getCachedTopicsData = unstable_cache(
  async () => {
    const adminClient = createAdminClient()
    const { data: topics } = await adminClient
      .from('topics')
      .select('*')
      .order('category', { ascending: true })
    return { topics: topics || [] }
  },
  ['admin-topics-data-v1'],
  { revalidate: 10, tags: ['topics-data'] }
)

export default async function TopicsPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const { topics } = await getCachedTopicsData()

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Managing"
        firstLinePillIconName="BookOpen"
        firstLineSuffix="Curriculum Topics"
        secondLinePrefix="and"
        secondLineSuffix="Tracks"
        actionLabel="+ Add New Topic"
        actionHref="#create"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div id="create" className="lg:col-span-1 rounded-[28px] border border-black/[0.06] p-5 sm:p-6 bg-white shadow-sm h-fit space-y-4">
          <h2 className="text-base font-bold text-[#111315]">Add New Topic</h2>
          <p className="text-xs text-[#737780]">Topics are selected by students during attendance and used for targeted questions.</p>
          <form action={createTopicAction} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-[#111315]">Topic Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Dynamic Programming & Recursion" autoComplete="off" className="rounded-xl border-black/[0.08]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-semibold text-[#111315]">Category</Label>
              <Input id="category" name="category" required placeholder="e.g. Data Structures & Algorithms" autoComplete="off" className="rounded-xl border-black/[0.08]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-[#111315]">Description (Optional)</Label>
              <Input id="description" name="description" placeholder="e.g. Core memoization, tabulation, and search boundaries" autoComplete="off" className="rounded-xl border-black/[0.08]" />
            </div>
            <Button type="submit" className="w-full rounded-full bg-[#111215] hover:bg-black text-white font-semibold">
              Create Topic
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-[28px] border border-black/[0.06] overflow-hidden bg-white shadow-sm p-4 sm:p-6">
          <h3 className="font-bold text-base text-[#111315] mb-4">Curriculum Topics List</h3>
          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black/[0.06]">
                  <TableHead className="font-bold text-xs text-[#111315]">Topic Name</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Category</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics?.map((topic) => (
                  <TableRow key={topic.id} className="border-b border-black/[0.04]">
                    <TableCell className="font-semibold text-xs text-[#111315] whitespace-nowrap">{topic.name}</TableCell>
                    <TableCell className="text-xs text-[#737780] whitespace-nowrap">{topic.category}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge variant={topic.is_active ? 'default' : 'secondary'} className={`text-[10px] font-bold ${topic.is_active ? 'bg-[#EBFD78] text-[#111315]' : ''}`}>
                        {topic.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!topics || topics.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-xs text-[#737780]">
                      No curriculum topics found. Create one on the left.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
