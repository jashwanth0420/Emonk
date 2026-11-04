import { createAdminClient } from '@/lib/supabase/admin'
import { getFastUser } from '@/lib/supabase/server'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'

const tutorPillTabs = [
  { href: '/tutor/dashboard', label: 'Overview' },
  { href: '/tutor/students', label: 'My Students' },
  { href: '/tutor/attendance', label: 'Review Submissions' },
]

export default async function TutorAttendancePage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const fastUser = await getFastUser()
  const userId = fastUser?.id || ''
  const isAdmin = fastUser?.role === 'super_admin' || fastUser?.role === 'admin'
  const adminClient = createAdminClient()

  let pendingReviewsQuery = adminClient
    .from('attendance')
    .select('id, attendance_date, profiles:student_id(full_name), schedules(title)')
    .eq('status', 'pending_review')
    .order('attendance_date', { ascending: false })

  // If regular tutor, filter by assigned students
  if (!isAdmin && userId) {
    const { data: assignments } = await adminClient
      .from('tutor_student_assignments')
      .select('student_id')
      .eq('tutor_id', userId)
      .eq('status', 'active')

    const assignedStudentIds = assignments?.map(a => a.student_id) || []
    pendingReviewsQuery = pendingReviewsQuery.in('student_id', assignedStudentIds.length > 0 ? assignedStudentIds : ['00000000-0000-0000-0000-000000000000'])
  }

  const { data: pendingReviews } = await pendingReviewsQuery

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Mentoring"
        firstLinePillIconName="CheckSquare"
        firstLineSuffix="Attendance Reviews"
        secondLinePrefix="and"
        secondLineSuffix="Assessments"
        actionLabel="Back to Overview"
        actionHref="/tutor/dashboard"
        settingsHref="/tutor/dashboard"
      />

      <PillTabsBar tabs={tutorPillTabs} className="mb-2" />

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

      <div className="rounded-[28px] border border-black/[0.06] overflow-hidden bg-white shadow-sm p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="font-bold text-base text-[#111315]">Pending Submission Queue</h3>
          <p className="text-xs text-[#737780] mt-0.5">
            Student concept answers and topic self-reports waiting for your manual review and approval.
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black/[0.06]">
                <TableHead className="font-bold text-xs text-[#111315]">Student Name</TableHead>
                <TableHead className="font-bold text-xs text-[#111315]">Scheduled Session</TableHead>
                <TableHead className="font-bold text-xs text-[#111315]">Session Date</TableHead>
                <TableHead className="font-bold text-xs text-[#111315] text-right">Review Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingReviews?.map((record: any) => (
                <TableRow key={record.id} className="border-b border-black/[0.04]">
                  <TableCell className="font-semibold text-xs text-[#111315] whitespace-nowrap">{record.profiles?.full_name}</TableCell>
                  <TableCell className="text-xs text-[#737780] whitespace-nowrap">{record.schedules?.title}</TableCell>
                  <TableCell className="text-xs font-mono text-[#111315] whitespace-nowrap">{new Date(record.attendance_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Link 
                      href={`/tutor/attendance/${record.id}`} 
                      className="inline-flex items-center justify-center rounded-full text-xs font-semibold bg-[#111215] text-white hover:bg-black h-8 px-4 transition-all"
                    >
                      Review Submission
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {(!pendingReviews || pendingReviews.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-[#737780] text-xs">
                    No pending reviews in your queue! You are completely caught up.
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
