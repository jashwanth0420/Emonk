import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'

export default async function TutorAttendancePage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'

  let pendingReviewsQuery = adminClient
    .from('attendance')
    .select('id, attendance_date, profiles:student_id(full_name), schedules(title)')
    .eq('status', 'pending_review')
    .order('attendance_date', { ascending: false })

  // If regular tutor, filter by assigned students
  if (!isAdmin && user) {
    const { data: assignments } = await adminClient
      .from('tutor_student_assignments')
      .select('student_id')
      .eq('tutor_id', user.id)
      .eq('status', 'active')

    const assignedStudentIds = assignments?.map(a => a.student_id) || []
    pendingReviewsQuery = pendingReviewsQuery.in('student_id', assignedStudentIds.length > 0 ? assignedStudentIds : ['00000000-0000-0000-0000-000000000000'])
  }

  const { data: pendingReviews } = await pendingReviewsQuery

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-foreground">Pending Attendance Reviews</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Student concept assessments waiting for your manual review and approval.
          </p>
        </div>
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

      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Scheduled Session</TableHead>
              <TableHead>Session Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingReviews?.map((record: any) => (
              <TableRow key={record.id}>
                <TableCell className="font-semibold text-sm">{record.profiles?.full_name}</TableCell>
                <TableCell className="text-xs">{record.schedules?.title}</TableCell>
                <TableCell className="text-xs font-mono">{new Date(record.attendance_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link 
                    href={`/tutor/attendance/${record.id}`} 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3.5"
                  >
                    Review Submission
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {(!pendingReviews || pendingReviews.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-xs">
                  No pending reviews in your queue! You are all caught up.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
