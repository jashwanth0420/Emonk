import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createUserAction, assignStudentToTutorAction, unassignStudentAction } from '../actions'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students Directory</h1>
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
        {/* Create Student Form */}
        <div className="lg:col-span-1 border rounded-lg p-5 bg-card/90 backdrop-blur-md h-fit space-y-4">
          <h2 className="text-lg font-semibold">Create New Student</h2>
          <p className="text-xs text-muted-foreground">Creates auth login credentials and a student profile.</p>
          <form action={createUserAction} className="space-y-4">
            <input type="hidden" name="role" value="student" />
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" placeholder="e.g. Alex Johnson" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="student@emonk.edu" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Initial Password</Label>
              <Input id="password" name="password" type="password" placeholder="At least 6 characters" required />
            </div>
            <Button type="submit" className="w-full">Create Student Account</Button>
          </form>
        </div>

        {/* Students Table */}
        <div className="lg:col-span-2 border rounded-lg overflow-hidden bg-card/90 backdrop-blur-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Tutor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Assign Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.map((student) => {
                const currentAssignment = assignmentMap.get(student.id)

                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{student.email}</TableCell>
                    <TableCell>
                      {currentAssignment ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-blue-400 text-blue-700 bg-blue-50/50">
                            {currentAssignment.tutorName}
                          </Badge>
                          <form action={unassignStudentAction} className="inline">
                            <input type="hidden" name="assignment_id" value={currentAssignment.id} />
                            <button type="submit" className="text-xs text-red-500 hover:underline">
                              ×
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={assignStudentToTutorAction} className="flex items-center justify-end gap-1.5">
                        <input type="hidden" name="student_id" value={student.id} />
                        <select
                          name="tutor_id"
                          required
                          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-sm"
                        >
                          <option value="">Choose tutor...</option>
                          {tutors?.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.full_name}
                            </option>
                          ))}
                        </select>
                        <Button size="sm" type="submit" variant="outline" className="h-8 text-xs">
                          Assign
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                )
              })}
              {(!students || students.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No student accounts found yet. Create the first student using the form on the left!
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
