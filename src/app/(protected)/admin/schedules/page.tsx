import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createScheduleAction } from '../actions'

export default async function SchedulesPage() {
  const supabase = await createClient()
  
  // Fetch schedules
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*, topics(name)')
    .order('date', { ascending: false })

  // Fetch topics for the dropdown
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')
    .eq('is_active', true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schedules</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border rounded-lg p-4 bg-card h-fit">
          <h2 className="text-lg font-semibold mb-4">Create New Schedule</h2>
          <form action={createScheduleAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title</Label>
              <Input id="title" name="title" required placeholder="e.g. DSA Session 1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topic_id">Topic</Label>
              <select id="topic_id" name="topic_id" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select a topic...</option>
                {topics?.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input id="start_time" name="start_time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input id="end_time" name="end_time" type="time" required />
              </div>
            </div>

            <Button type="submit" className="w-full">Create Schedule</Button>
          </form>
        </div>

        <div className="md:col-span-2 border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules?.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.title}</TableCell>
                  <TableCell>{schedule.topics?.name}</TableCell>
                  <TableCell>{new Date(schedule.date).toLocaleDateString()}</TableCell>
                  <TableCell>{schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}</TableCell>
                  <TableCell className="capitalize">{schedule.status}</TableCell>
                </TableRow>
              ))}
              {schedules?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No schedules found.
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
