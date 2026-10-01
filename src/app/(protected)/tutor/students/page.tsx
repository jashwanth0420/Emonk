import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function TutorStudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch students via the assignment table
  const { data: assignments } = await supabase
    .from('tutor_student_assignments')
    .select('student_id, profiles!student_id(full_name, email, status, department, year)')
    .eq('tutor_id', user?.id)
    .eq('status', 'active')

  const students = assignments?.map(a => a.profiles)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Students</h1>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((student: any, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{student.full_name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.department || '-'}</TableCell>
                <TableCell>{student.year || '-'}</TableCell>
                <TableCell>
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {student.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {(!students || students.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No students assigned to you yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
