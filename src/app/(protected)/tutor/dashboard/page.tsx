import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, CheckSquare, ArrowRight, UserCheck } from 'lucide-react'

export default async function TutorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('full_name, role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'

  // Get assigned students
  let assignedStudentIds: string[] = []
  if (user) {
    const { data: assignments } = await adminClient
      .from('tutor_student_assignments')
      .select('student_id')
      .eq('tutor_id', user.id)
      .eq('status', 'active')
    assignedStudentIds = assignments?.map(a => a.student_id) || []
  }

  // Pending reviews count
  let pendingQuery = adminClient
    .from('attendance')
    .select('id, attendance_date, profiles:student_id(full_name), schedules(title)')
    .eq('status', 'pending_review')
    .order('attendance_date', { ascending: false })

  if (!isAdmin) {
    pendingQuery = pendingQuery.in('student_id', assignedStudentIds.length > 0 ? assignedStudentIds : ['00000000-0000-0000-0000-000000000000'])
  }

  const { data: pendingReviews } = await pendingQuery.limit(5)
  const pendingCount = pendingReviews?.length || 0

  // Approved count
  let approvedQuery = adminClient
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('approved_by', user?.id)

  const { count: approvedCount } = await approvedQuery

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Tutor'}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review student concept answers and approve attendance sessions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              My Assigned Students <Users className="w-4 h-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {isAdmin ? 'All Students (Admin)' : assignedStudentIds.length}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-card/90 backdrop-blur-md border-amber-500/30">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs text-amber-600 font-medium">
              Pending Reviews <CheckSquare className="w-4 h-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card/90 backdrop-blur-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              Reviewed by Me <UserCheck className="w-4 h-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {approvedCount || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pending reviews queue */}
      <Card className="bg-card/90 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Submissions Awaiting Verification</CardTitle>
            <CardDescription className="text-xs">Student answers requiring your feedback and sign-off</CardDescription>
          </div>
          <Link href="/tutor/attendance" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingReviews?.map((rec: any) => (
              <div key={rec.id} className="flex items-center justify-between p-3.5 rounded-lg border bg-background/50 text-xs">
                <div>
                  <p className="font-semibold text-sm">{rec.profiles?.full_name}</p>
                  <p className="text-muted-foreground">{rec.schedules?.title} • {new Date(rec.attendance_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50 uppercase text-[10px]">
                    Pending
                  </Badge>
                  <Link
                    href={`/tutor/attendance/${rec.id}`}
                    className="inline-flex items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2.5 text-xs font-medium"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
            {(!pendingReviews || pendingReviews.length === 0) && (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No submissions waiting for review right now!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
