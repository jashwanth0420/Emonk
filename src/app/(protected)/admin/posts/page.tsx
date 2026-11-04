import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPostAction } from './actions'
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

const getCachedPostsData = unstable_cache(
  async () => {
    const adminClient = createAdminClient()
    const { data: posts } = await adminClient
      .from('posts')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
    return { posts: posts || [] }
  },
  ['admin-posts-data-v1'],
  { revalidate: 10, tags: ['posts-data'] }
)

export default async function AdminPostsPage() {
  const { posts } = await getCachedPostsData()

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Managing"
        firstLinePillIconName="MessageSquare"
        firstLineSuffix="Community Updates"
        secondLinePrefix="and"
        secondLineSuffix="Announcements"
        actionLabel="+ Create Post"
        actionHref="#create"
        settingsHref="/admin/analytics"
      />

      <PillTabsBar tabs={adminPillTabs} className="mb-2" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div id="create" className="lg:col-span-1 rounded-[28px] border border-black/[0.06] p-5 sm:p-6 bg-white shadow-sm h-fit space-y-4">
          <h2 className="text-base font-bold text-[#111315]">Publish Announcement</h2>
          <p className="text-xs text-[#737780]">Broadcast updates and notices to students and tutors.</p>
          <form action={createPostAction} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold text-[#111315]">Title</Label>
              <Input id="title" name="title" placeholder="e.g. Upcoming DSA Review Session" autoComplete="off" className="rounded-xl border-black/[0.08]" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post_type" className="text-xs font-semibold text-[#111315]">Category</Label>
              <select id="post_type" name="post_type" required className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-1 text-sm shadow-xs text-[#111315]">
                <option value="announcement">Announcement</option>
                <option value="event">Event</option>
                <option value="deadline">Deadline</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-xs font-semibold text-[#111315]">Content</Label>
              <Textarea id="content" name="content" placeholder="Write announcement details..." required className="min-h-[140px] rounded-xl border-black/[0.08]" />
            </div>
            <Button type="submit" className="w-full rounded-full bg-[#111215] hover:bg-black text-white font-semibold">Publish to Feed</Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base text-[#111315]">Published Updates</h3>
          {posts?.map((post) => (
            <div key={post.id} className="rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-5 sm:p-6 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-[#111315]">{post.title}</h4>
                  <p className="text-xs text-[#737780] mt-0.5">Posted by {post.profiles?.full_name || 'Admin'} &bull; {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#EBFD78] text-[#111315]">{post.post_type}</span>
              </div>
              <p className="text-xs text-[#444] whitespace-pre-wrap pt-2 leading-relaxed">{post.content}</p>
            </div>
          ))}
          {(!posts || posts.length === 0) && (
            <div className="text-center py-12 text-[#737780] border border-dashed rounded-[28px] bg-white text-xs">No announcements published yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
