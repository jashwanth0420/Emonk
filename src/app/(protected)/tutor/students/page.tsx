import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function TutorStudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'

  let students: any[] = []

  if (isAdmin) {
    const { data: allStudents } = await adminClient
      .from('profiles')
      .select('id, full_name, email, status, department, year')
      .eq('role', 'student')
      .order('full_name')
    students = allStudents || []
  } else if (user) {
    const { data: assignments } = await adminClient
      .from('tutor_student_assignments')
      .select('student_id, profiles!student_id(id, full_name, email, status, department, year)')
      .eq('tutor_id', user.id)
      .eq('status', 'active')
    students = assignments?.map((a: any) => a.profiles).filter(Boolean) || []
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">My Assigned Students</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isAdmin ? 'Showing all registered students (Administrator view).' : 'Students assigned to you by administrators for concept mentoring and attendance reviews.'}
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card/90 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student: any) => (
              <TableRow key={student.id}>
                <TableCell className="font-semibold text-sm">{student.full_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{student.email}</TableCell>
                <TableCell className="text-xs">{student.department || 'Computer Science'}</TableCell>
                <TableCell className="text-xs">{student.year || '3rd Year'}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                    {student.status || 'Active'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                  No students assigned to you yet. Ask an administrator to assign students to your account!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
