import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createScheduleAction } from '../actions'
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

const getCachedSchedulesData = unstable_cache(
  async () => {
    const adminClient = createAdminClient()
    const [
      { data: schedules },
      { data: topics }
    ] = await Promise.all([
      adminClient.from('schedules').select('*, topics(name)').order('date', { ascending: false }),
      adminClient.from('topics').select('id, name').eq('is_active', true).order('name')
    ])
    return { schedules: schedules || [], topics: topics || [] }
  },
  ['admin-schedules-data-v1'],
  { revalidate: 10, tags: ['schedules-data'] }
)

export default async function SchedulesPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const { schedules, topics } = await getCachedSchedulesData()

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Managing"
        firstLinePillIconName="Calendar"
        firstLineSuffix="Session Schedules"
        secondLinePrefix="and"
        secondLineSuffix="Timelines"
        actionLabel="+ Create Schedule"
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
          <h2 className="text-base font-bold text-[#111315]">Create New Schedule</h2>
          <p className="text-xs text-[#737780]">Students can check into active sessions on the designated date.</p>
          <form action={createScheduleAction} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold text-[#111315]">Session Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Data Structures & Algorithms - Daily Lab" autoComplete="off" className="rounded-xl border-black/[0.08]" />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="topic_id" className="text-xs font-semibold text-[#111315]">Core Topic</Label>
              <select
                id="topic_id"
                name="topic_id"
                required
                defaultValue=""
                className="flex h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-1 text-sm shadow-xs text-[#111315]"
              >
                <option value="" disabled>Select a curriculum topic...</option>
                {topics?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold text-[#111315]">Scheduled Date</Label>
              <Input id="date" name="date" type="date" defaultValue={today} required className="rounded-xl border-black/[0.08]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start_time" className="text-xs font-semibold text-[#111315]">Start Time</Label>
                <Input id="start_time" name="start_time" type="time" defaultValue="09:00" required className="rounded-xl border-black/[0.08]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_time" className="text-xs font-semibold text-[#111315]">End Time</Label>
                <Input id="end_time" name="end_time" type="time" defaultValue="18:00" required className="rounded-xl border-black/[0.08]" />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full bg-[#111215] hover:bg-black text-white font-semibold">
              Publish Session Schedule
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-[28px] border border-black/[0.06] overflow-hidden bg-white shadow-sm p-4 sm:p-6">
          <h3 className="font-bold text-base text-[#111315] mb-4">Scheduled Sessions Directory</h3>
          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black/[0.06]">
                  <TableHead className="font-bold text-xs text-[#111315]">Session Title</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Curriculum Topic</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Date</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Time Window</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules?.map((schedule) => (
                  <TableRow key={schedule.id} className="border-b border-black/[0.04]">
                    <TableCell className="font-semibold text-xs text-[#111315] whitespace-nowrap">{schedule.title}</TableCell>
                    <TableCell className="text-xs text-[#737780] whitespace-nowrap">{schedule.topics?.name || 'General'}</TableCell>
                    <TableCell className="text-xs font-mono whitespace-nowrap">{new Date(schedule.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs text-[#737780] font-mono whitespace-nowrap">
                      {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'} className={`text-[10px] font-bold ${schedule.status === 'active' ? 'bg-[#EBFD78] text-[#111315]' : ''}`}>
                        {schedule.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!schedules || schedules.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-[#737780]">
                      No schedules created yet. Add one on the left.
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
