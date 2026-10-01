import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function TutorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single()

  // Get total assigned students
  const { count: studentCount } = await supabase
    .from('tutor_student_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', user?.id)
    .eq('status', 'active')

  // Since RLS protects attendance queries to only assigned students, we can query safely
  const { count: pendingCount } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_review')

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.full_name?.split(' ')[0] || 'Tutor'}</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
