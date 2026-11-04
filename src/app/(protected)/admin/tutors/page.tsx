import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createUserAction } from '../actions'
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

const getCachedTutorsData = unstable_cache(
  async () => {
    const adminClient = createAdminClient()
    const [
      { data: tutors },
      { data: assignments }
    ] = await Promise.all([
      adminClient
        .from('profiles')
        .select('*')
        .eq('role', 'tutor')
        .order('created_at', { ascending: false }),
      adminClient
        .from('tutor_student_assignments')
        .select('tutor_id')
        .eq('status', 'active')
    ])
    return { tutors: tutors || [], assignments: assignments || [] }
  },
  ['admin-tutors-data-v1'],
  { revalidate: 10, tags: ['tutors-data'] }
)

export default async function TutorsPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const { tutors, assignments } = await getCachedTutorsData()

  const countMap = new Map()
  assignments?.forEach((a: any) => {
    countMap.set(a.tutor_id, (countMap.get(a.tutor_id) || 0) + 1)
  })

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Managing"
        firstLinePillIconName="UserCheck"
        firstLineSuffix="Your Tutors"
        secondLinePrefix="and"
        secondLineSuffix="Assignments"
        actionLabel="+ Add New Tutor"
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
          <h2 className="text-base font-bold text-[#111315]">Create New Tutor</h2>
          <p className="text-xs text-[#737780]">Creates tutor credentials for review and student monitoring.</p>
          <form action={createUserAction} className="space-y-4" autoComplete="off">
            <input type="hidden" name="role" value="tutor" />
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold text-[#111315]">Full Name</Label>
              <Input id="fullName" name="fullName" placeholder="e.g. Dr. Jane Smith" autoComplete="off" className="rounded-xl border-black/[0.08]" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-[#111315]">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="tutor@emonk.edu" autoComplete="off" className="rounded-xl border-black/[0.08]" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-[#111315]">Initial Password</Label>
              <Input id="password" name="password" type="password" placeholder="At least 6 characters" autoComplete="new-password" className="rounded-xl border-black/[0.08]" required />
            </div>
            <Button type="submit" className="w-full rounded-full bg-[#111215] hover:bg-black text-white font-semibold">
              Create Tutor Account
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-[28px] border border-black/[0.06] overflow-hidden bg-white shadow-sm p-4 sm:p-6">
          <h3 className="font-bold text-base text-[#111315] mb-4">Active Tutors Directory</h3>
          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black/[0.06]">
                  <TableHead className="font-bold text-xs text-[#111315]">Tutor Name</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Email</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Assigned Students</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Status</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutors?.map((tutor) => (
                  <TableRow key={tutor.id} className="border-b border-black/[0.04]">
                    <TableCell className="font-semibold text-xs text-[#111315] whitespace-nowrap">{tutor.full_name}</TableCell>
                    <TableCell className="text-xs text-[#737780] whitespace-nowrap">{tutor.email}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F3F4F6] text-[#111315]">
                        {countMap.get(tutor.id) || 0} students
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={tutor.status === 'active' ? 'default' : 'secondary'} className={`text-[10px] font-bold ${tutor.status === 'active' ? 'bg-[#EBFD78] text-[#111315]' : ''}`}>
                        {tutor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[#737780] whitespace-nowrap">
                      {new Date(tutor.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {(!tutors || tutors.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-[#737780]">
                      No tutors registered yet. Create one on the left.
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
