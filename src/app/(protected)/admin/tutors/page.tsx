import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createUserAction } from '../actions'

export default async function TutorsPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const adminClient = createAdminClient()

  // Fetch tutors
  const { data: tutors } = await adminClient
    .from('profiles')
    .select('*')
    .eq('role', 'tutor')
    .order('created_at', { ascending: false })

  // Fetch student assignment counts per tutor
  const { data: assignments } = await adminClient
    .from('tutor_student_assignments')
    .select('tutor_id')
    .eq('status', 'active')

  const countMap = new Map()
  assignments?.forEach((a: any) => {
    countMap.set(a.tutor_id, (countMap.get(a.tutor_id) || 0) + 1)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title text-foreground">Tutors Directory</h1>
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
        <div className="lg:col-span-1 border rounded-lg p-5 bg-card shadow-sm h-fit space-y-4">
          <h2 className="text-lg font-semibold">Create New Tutor</h2>
          <p className="text-xs text-muted-foreground">Creates tutor credentials for review and student monitoring.</p>
          <form action={createUserAction} className="space-y-4">
            <input type="hidden" name="role" value="tutor" />
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" defaultValue="Dr. Jane Smith" placeholder="e.g. Dr. Jane Smith" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" defaultValue="tutor@emonk.edu" placeholder="tutor@emonk.edu" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Initial Password</Label>
              <Input id="password" name="password" type="password" defaultValue="password123" placeholder="At least 6 characters" required />
            </div>
            <Button type="submit" className="w-full">Create Tutor Account</Button>
          </form>
        </div>

        <div className="lg:col-span-2 border rounded-lg overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutors?.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell className="font-medium">{tutor.full_name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tutor.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {countMap.get(tutor.id) || 0} students
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tutor.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                      {tutor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(tutor.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {(!tutors || tutors.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No tutors created yet. Use the form on the left to add a tutor!
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
