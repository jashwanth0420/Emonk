import { createAdminClient } from '@/lib/supabase/admin'
import { getFastUser } from '@/lib/supabase/server'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfileAction } from './actions'

const studentPillTabs = [
  { href: '/student/dashboard', label: 'Overview' },
  { href: '/student/attendance', label: 'Attendance Check-in' },
  { href: '/student/calendar', label: 'Calendar' },
  { href: '/student/progress', label: 'Progress & Topics' },
  { href: '/student/feed', label: 'Central Feed' },
  { href: '/student/profile', label: 'My Profile' },
]

export default async function StudentProfilePage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const fastUser = await getFastUser()
  const userId = fastUser?.id || ''
  const adminClient = createAdminClient()
  
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Managing"
        firstLinePillIconName="Users"
        firstLineSuffix="Your Profile"
        secondLinePrefix="and"
        secondLineSuffix="Credentials"
        actionLabel="+ Check-in"
        actionHref="/student/attendance"
        settingsHref="/student/profile"
      />

      <PillTabsBar tabs={studentPillTabs} className="mb-2" />

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

      <div className="max-w-2xl rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-bold text-base text-[#111315]">Profile Details & Links</h3>
          <p className="text-xs text-[#737780] mt-0.5">Keep your bio and coding portfolio updated for mentors and admins.</p>
        </div>

        <form action={updateProfileAction} className="space-y-5" autoComplete="off">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F9FAFB] p-4 rounded-2xl border border-black/[0.04]">
            <div>
              <span className="text-[#737780] text-[11px] block">Full Name</span>
              <p className="font-bold text-xs text-[#111315] mt-0.5">{profile?.full_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[#737780] text-[11px] block">Email</span>
              <p className="font-bold text-xs text-[#111315] mt-0.5 truncate">{profile?.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[#737780] text-[11px] block">Department</span>
              <p className="font-bold text-xs text-[#111315] mt-0.5">{profile?.department || 'Computer Science'}</p>
            </div>
            <div>
              <span className="text-[#737780] text-[11px] block">Status</span>
              <p className="font-bold text-xs text-emerald-600 mt-0.5 capitalize">{profile?.status || 'Active'}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-semibold text-[#111315]">Bio / Learning Focus</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio || ''}
              placeholder="e.g. Focusing on full-stack development, algorithms, and distributed systems..."
              className="rounded-2xl border-black/[0.08]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="linkedin_url" className="text-xs font-semibold text-[#111315]">LinkedIn Profile</Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                defaultValue={profile?.linkedin_url || ''}
                placeholder="https://linkedin.com/in/username"
                className="rounded-xl border-black/[0.08]"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="github_url" className="text-xs font-semibold text-[#111315]">GitHub Profile</Label>
              <Input
                id="github_url"
                name="github_url"
                defaultValue={profile?.github_url || ''}
                placeholder="https://github.com/username"
                className="rounded-xl border-black/[0.08]"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leetcode_url" className="text-xs font-semibold text-[#111315]">LeetCode Profile</Label>
              <Input
                id="leetcode_url"
                name="leetcode_url"
                defaultValue={profile?.leetcode_url || ''}
                placeholder="https://leetcode.com/username"
                className="rounded-xl border-black/[0.08]"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hackerrank_url" className="text-xs font-semibold text-[#111315]">HackerRank Profile</Label>
              <Input
                id="hackerrank_url"
                name="hackerrank_url"
                defaultValue={profile?.hackerrank_url || ''}
                placeholder="https://hackerrank.com/username"
                className="rounded-xl border-black/[0.08]"
                autoComplete="off"
              />
            </div>
          </div>

          <Button type="submit" className="rounded-full bg-[#111215] hover:bg-black text-white font-semibold px-6">
            Save Profile Changes
          </Button>
        </form>
      </div>
    </div>
  )
}
