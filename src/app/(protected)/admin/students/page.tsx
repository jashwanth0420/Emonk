import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users } from 'lucide-react'
import { createUserAction, assignStudentToTutorAction, unassignStudentAction } from '../actions'

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

export default async function StudentsPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const adminClient = createAdminClient()

  // 1. Fetch all students
  const { data: students } = await adminClient
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  // 2. Fetch all tutors
  const { data: tutors } = await adminClient
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'tutor')
    .eq('status', 'active')

  // 3. Fetch tutor assignments
  const { data: assignments } = await adminClient
    .from('tutor_student_assignments')
    .select('id, student_id, tutor_id, profiles!tutor_id(full_name)')
    .eq('status', 'active')

  const assignmentMap = new Map()
  assignments?.forEach((a: any) => {
    assignmentMap.set(a.student_id, {
      id: a.id,
      tutorName: a.profiles?.full_name || 'Assigned Tutor'
    })
  })

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Managing"
        firstLinePillIcon={Users}
        firstLineSuffix="Your Students"
        secondLinePrefix="and"
        secondLineSuffix="Enrolments"
        actionLabel="+ Add New Student"
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
        {/* Create Student Form */}
        <div id="create" className="lg:col-span-1 rounded-[28px] border border-black/[0.06] p-5 sm:p-6 bg-white shadow-sm h-fit space-y-4">
          <h2 className="text-base font-bold text-[#111315]">Create New Student</h2>
          <p className="text-xs text-[#737780]">Creates auth login credentials and a student profile.</p>
          <form action={createUserAction} className="space-y-4">
            <input type="hidden" name="role" value="student" />
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold text-[#111315]">Full Name</Label>
              <Input id="fullName" name="fullName" placeholder="e.g. Alex Johnson" className="rounded-xl border-black/[0.08]" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-[#111315]">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="student@emonk.edu" className="rounded-xl border-black/[0.08]" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-[#111315]">Initial Password</Label>
              <Input id="password" name="password" type="password" placeholder="At least 6 characters" className="rounded-xl border-black/[0.08]" required />
            </div>
            <Button type="submit" className="w-full rounded-full bg-[#111215] hover:bg-black text-white font-semibold">
              Create Student Account
            </Button>
          </form>
        </div>

        {/* Students Table */}
        <div className="lg:col-span-2 rounded-[28px] border border-black/[0.06] overflow-hidden bg-white shadow-sm p-4 sm:p-6">
          <h3 className="font-bold text-base text-[#111315] mb-4">Active Students Directory</h3>
          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black/[0.06]">
                  <TableHead className="font-bold text-xs text-[#111315]">Student</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Email</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Assigned Tutor</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315]">Status</TableHead>
                  <TableHead className="font-bold text-xs text-[#111315] text-right">Assign Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student) => {
                  const currentAssignment = assignmentMap.get(student.id)
                  return (
                    <TableRow key={student.id} className="border-b border-black/[0.04]">
                      <TableCell className="font-semibold text-xs text-[#111315] whitespace-nowrap">{student.full_name}</TableCell>
                      <TableCell className="text-xs text-[#737780] whitespace-nowrap">{student.email}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {currentAssignment ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-[#111315]">{currentAssignment.tutorName}</span>
                            <form action={unassignStudentAction.bind(null, currentAssignment.id)}>
                              <button
                                type="submit"
                                className="text-[10px] text-red-500 hover:text-red-700 font-bold ml-1"
                                title="Unassign Tutor"
                              >
                                ✕
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-xs text-[#737780] italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${student.status === 'active' ? 'bg-[#EBFD78] text-[#111315]' : 'bg-gray-100 text-gray-700'}`}>
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <form action={assignStudentToTutorAction} className="inline-flex items-center gap-2">
                          <input type="hidden" name="studentId" value={student.id} />
                          <select
                            name="tutorId"
                            className="text-xs border border-black/[0.08] rounded-xl px-2.5 py-1 bg-white text-[#111315]"
                            required
                            defaultValue=""
                          >
                            <option value="" disabled>Select tutor...</option>
                            {tutors?.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.full_name}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" variant="outline" className="rounded-full text-xs font-semibold h-7 px-3">
                            Assign
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {(!students || students.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-[#737780]">
                      No students found. Create one using the form on the left.
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
