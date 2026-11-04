import { createAdminClient } from '@/lib/supabase/admin'
import { getFastUser } from '@/lib/supabase/server'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const tutorPillTabs = [
  { href: '/tutor/dashboard', label: 'Overview' },
  { href: '/tutor/students', label: 'My Students' },
  { href: '/tutor/attendance', label: 'Review Submissions' },
]

export default async function TutorStudentsPage() {
  const fastUser = await getFastUser()
  const userId = fastUser?.id || ''
  const isAdmin = fastUser?.role === 'super_admin' || fastUser?.role === 'admin'
  const adminClient = createAdminClient()

  let students: any[] = []

  if (isAdmin) {
    const { data: allStudents } = await adminClient
      .from('profiles')
      .select('id, full_name, email, status, department, year')
      .eq('role', 'student')
      .order('full_name')
    students = allStudents || []
  } else if (userId) {
    const { data: assignments } = await adminClient
      .from('tutor_student_assignments')
      .select('student_id, profiles!student_id(id, full_name, email, status, department, year)')
      .eq('tutor_id', userId)
      .eq('status', 'active')
    students = assignments?.map((a: any) => a.profiles).filter(Boolean) || []
  }

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Mentoring"
        firstLinePillIconName="Users"
        firstLineSuffix="Assigned Students"
        secondLinePrefix="and"
        secondLineSuffix="Mentees"
        actionLabel="Review Attendance"
        actionHref="/tutor/attendance"
        settingsHref="/tutor/dashboard"
      />

      <PillTabsBar tabs={tutorPillTabs} className="mb-2" />

      <div className="rounded-[28px] border border-black/[0.06] overflow-hidden bg-white shadow-sm p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="font-bold text-base text-[#111315]">
            {isAdmin ? 'All Registered Students (Admin View)' : 'My Assigned Mentees'}
          </h3>
          <p className="text-xs text-[#737780] mt-0.5">
            Students assigned to you for topic understanding reviews and session validation.
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black/[0.06]">
                <TableHead className="font-bold text-xs text-[#111315]">Student Name</TableHead>
                <TableHead className="font-bold text-xs text-[#111315]">Email Address</TableHead>
                <TableHead className="font-bold text-xs text-[#111315]">Department</TableHead>
                <TableHead className="font-bold text-xs text-[#111315]">Year</TableHead>
                <TableHead className="font-bold text-xs text-[#111315] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => (
                <TableRow key={student.id} className="border-b border-black/[0.04]">
                  <TableCell className="font-semibold text-xs text-[#111315] whitespace-nowrap">{student.full_name}</TableCell>
                  <TableCell className="text-xs text-[#737780] whitespace-nowrap">{student.email}</TableCell>
                  <TableCell className="text-xs text-[#111315] whitespace-nowrap">{student.department || 'Computer Science'}</TableCell>
                  <TableCell className="text-xs text-[#111315] whitespace-nowrap">{student.year || '3rd Year'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={`capitalize text-[10px] ${student.status === 'active' ? 'bg-[#EBFD78] text-[#111315]' : ''}`}>
                      {student.status || 'Active'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-[#737780] text-xs">
                    No students assigned to you yet. Administrators will assign students to your mentee queue.
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
