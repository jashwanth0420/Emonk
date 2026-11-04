import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'

const studentPillTabs = [
  { href: '/student/dashboard', label: 'Overview' },
  { href: '/student/attendance', label: 'Attendance Check-in' },
  { href: '/student/calendar', label: 'Calendar' },
  { href: '/student/progress', label: 'Progress & Topics' },
  { href: '/student/feed', label: 'Central Feed' },
  { href: '/student/profile', label: 'My Profile' },
]

export default async function StudentFeedPage() {
  const adminClient = createAdminClient()
  
  const { data: posts } = await adminClient
    .from('posts')
    .select('*, profiles(full_name)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Reading"
        firstLinePillIconName="MessageSquare"
        firstLineSuffix="Community Feed"
        secondLinePrefix="and"
        secondLineSuffix="Announcements"
        actionLabel="+ Check-in"
        actionHref="/student/attendance"
        settingsHref="/student/profile"
      />

      <PillTabsBar tabs={studentPillTabs} className="mb-2" />

      <div className="space-y-4 max-w-3xl">
        <div className="mb-2">
          <h3 className="font-bold text-base text-[#111315]">Announcements & Updates</h3>
          <p className="text-xs text-[#737780] mt-0.5">Stay informed with curriculum notices, lab schedules, and mentor updates.</p>
        </div>

        {posts?.map((post) => (
          <div key={post.id} className="rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-5 sm:p-6 space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h4 className="text-base font-bold text-[#111315]">{post.title}</h4>
                <p className="text-xs text-[#737780] mt-0.5">
                  Posted by {post.profiles?.full_name || 'Instructor'} &bull; {new Date(post.published_at || post.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#EBFD78] text-[#111315] shrink-0">
                {post.post_type}
              </span>
            </div>
            <p className="text-xs text-[#444] whitespace-pre-wrap leading-relaxed pt-1">
              {post.content}
            </p>
          </div>
        ))}

        {(!posts || posts.length === 0) && (
          <div className="text-center py-12 text-[#737780] border border-dashed rounded-[28px] bg-white text-xs">
            No active announcements. Check back later!
          </div>
        )}
      </div>
    </div>
  )
}
