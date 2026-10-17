import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createScheduleAction } from '../actions'

export default async function SchedulesPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const adminClient = createAdminClient()
  
  const [
    { data: schedules },
    { data: topics }
  ] = await Promise.all([
    adminClient.from('schedules').select('*, topics(name)').order('date', { ascending: false }),
    adminClient.from('topics').select('id, name').eq('is_active', true).order('name')
  ])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Session Schedules</h1>
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
        <div className="lg:col-span-1 border rounded-lg p-5 bg-card/90 backdrop-blur-md h-fit space-y-4">
          <h2 className="text-lg font-semibold">Create New Schedule</h2>
          <p className="text-xs text-muted-foreground">Students can check into active sessions on the designated date.</p>
          <form action={createScheduleAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Session Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Daily DSA & Problem Solving" />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="topic_id">Core Topic</Label>
              <select
                id="topic_id"
                name="topic_id"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Select a curriculum topic...</option>
                {topics?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Scheduled Date</Label>
              <Input id="date" name="date" type="date" defaultValue={today} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start_time">Start Time</Label>
                <Input id="start_time" name="start_time" type="time" defaultValue="09:00" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_time">End Time</Label>
                <Input id="end_time" name="end_time" type="time" defaultValue="18:00" required />
              </div>
            </div>

            <Button type="submit" className="w-full">Publish Session Schedule</Button>
          </form>
        </div>

        <div className="lg:col-span-2 border rounded-lg overflow-hidden bg-card/90 backdrop-blur-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Title</TableHead>
                <TableHead>Curriculum Topic</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time Window</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules?.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-semibold text-sm">{schedule.title}</TableCell>
                  <TableCell className="text-xs">{schedule.topics?.name || 'General'}</TableCell>
                  <TableCell className="text-xs font-mono">{new Date(schedule.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                      {schedule.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!schedules || schedules.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                    No schedules published yet. Use the form on the left to set up a session!
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
