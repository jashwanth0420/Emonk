import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function TutorAttendancePage() {
  const supabase = await createClient()

  // Fetch pending attendance records for assigned students
  // The RLS policy restricts this to only the tutor's assigned students!
  const { data: pendingReviews } = await supabase
    .from('attendance')
    .select('id, attendance_date, profiles:student_id(full_name), schedules(title)')
    .eq('status', 'pending_review')
    .order('attendance_date', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pending Attendance Reviews</h1>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingReviews?.map((record: any) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.profiles?.full_name}</TableCell>
                <TableCell>{record.schedules?.title}</TableCell>
                <TableCell>{new Date(record.attendance_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm">
                    <Link href={`/tutor/attendance/${record.id}`}>Review Submission</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!pendingReviews || pendingReviews.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No pending reviews! You're all caught up.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
