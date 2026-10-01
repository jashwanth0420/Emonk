const fs = require('fs');

const files = {
  'src/app/(protected)/admin/posts/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPostAction } from './actions'

export default async function AdminPostsPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('posts').select('*, profiles(full_name)').order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Announcements Feed</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border rounded-lg p-4 bg-card h-fit">
          <h2 className="text-lg font-semibold mb-4">Create Post</h2>
          <form action={createPostAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post_type">Type</Label>
              <select id="post_type" name="post_type" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                <option value="announcement">Announcement</option>
                <option value="event">Event</option>
                <option value="deadline">Deadline</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" required className="min-h-[150px]" />
            </div>
            <Button type="submit" className="w-full">Publish to Feed</Button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Published Posts</h2>
          {posts?.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Posted by {post.profiles?.full_name} - {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase bg-muted px-2 py-1 rounded">{post.post_type}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))}
          {(!posts || posts.length === 0) && (
            <p className="text-center py-10 text-muted-foreground border rounded-md">No announcements yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}`,

  'src/app/(protected)/student/dashboard/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { checkInAction } from '../actions'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single()

  const today = new Date().toISOString().split('T')[0]

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*, topics(name)')
    .eq('date', today)
    .eq('status', 'active')

  const todaysSchedule = schedules?.[0]

  let attendanceRecord = null
  if (todaysSchedule) {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('schedule_id', todaysSchedule.id)
      .eq('student_id', user?.id)
      .single()
    attendanceRecord = data
  }

  const { data: history } = await supabase
    .from('attendance')
    .select('id, status, attendance_date, schedules(title, topics(name))')
    .eq('student_id', user?.id)
    .order('attendance_date', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Good Morning, {profile?.full_name?.split(' ')[0] || 'Student'}</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Session</CardTitle>
            <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysSchedule ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold text-lg">{todaysSchedule.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {todaysSchedule.start_time.slice(0,5)} - {todaysSchedule.end_time.slice(0,5)} - Topic: {todaysSchedule.topics?.name || 'General'}
                  </p>
                  
                  {!attendanceRecord ? (
                    <form action={checkInAction.bind(null, todaysSchedule.id)}>
                      <Button type="submit" className="w-full">Mark Attendance</Button>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center p-4 bg-background border rounded-md">
                      <Badge variant={attendanceRecord.status === 'approved' ? 'default' : 'secondary'} className="mb-2 uppercase">
                        {attendanceRecord.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-center text-muted-foreground">
                        {attendanceRecord.status === 'checked_in' && "You've checked in. Please complete your topic selection."}
                        {attendanceRecord.status === 'question_assigned' && "Please answer your assigned question."}
                        {attendanceRecord.status === 'pending_review' && "Your submission is pending review by a tutor."}
                        {attendanceRecord.status === 'approved' && "Your attendance has been approved!"}
                      </p>
                      {['checked_in', 'question_assigned'].includes(attendanceRecord.status) && (
                        <Button asChild className="w-full mt-4" variant="outline">
                          <a href="/student/attendance">Continue Session</a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground border rounded-lg bg-muted/50">
                No active session scheduled for today.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Reviews</CardDescription>
                <CardTitle className="text-3xl">
                  {history?.filter(h => h.status === 'pending_review').length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history?.map((record) => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{new Date(record.attendance_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-sm text-muted-foreground">{record.schedules?.topics?.name}</p>
                    </div>
                    <Badge variant={record.status === 'approved' ? 'default' : record.status === 'rejected' ? 'destructive' : 'outline'} className="uppercase">
                      {record.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {(!history || history.length === 0) && (
                  <p className="text-sm text-muted-foreground">No recent activity found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}`,

  'src/app/(protected)/student/calendar/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function StudentCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: history } = await supabase
    .from('attendance')
    .select('*, schedules(title, start_time, end_time, topics(name))')
    .eq('student_id', user?.id)
    .order('attendance_date', { ascending: false })
    .limit(30)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending_review': return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Attendance Calendar</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent History (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history?.map((record: any) => (
              <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex flex-col space-y-1">
                  <span className="font-semibold text-lg">{new Date(record.attendance_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  <span className="text-sm text-muted-foreground">{record.schedules?.title} - {record.schedules?.topics?.name}</span>
                  <span className="text-xs text-muted-foreground">Time: {record.schedules?.start_time?.slice(0,5)} - {record.schedules?.end_time?.slice(0,5)}</span>
                </div>
                
                <div className="mt-4 sm:mt-0 flex flex-col items-end">
                  <Badge className={\`uppercase px-3 py-1 \${getStatusColor(record.status)}\`} variant="outline">
                    {record.status.replace('_', ' ')}
                  </Badge>
                  {record.tutor_feedback && (
                    <span className="text-xs mt-2 text-muted-foreground italic max-w-xs text-right line-clamp-1" title={record.tutor_feedback}>
                      "{record.tutor_feedback}"
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {(!history || history.length === 0) && (
              <div className="text-center py-10 text-muted-foreground">
                No attendance records found. Start attending sessions!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}`,

  'src/app/(protected)/student/feed/page.tsx': `import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default async function StudentFeedPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(full_name)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Central Feed</h1>
      </div>

      <div className="space-y-6">
        {posts?.map((post) => (
          <Card key={post.id} className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Posted by {post.profiles?.full_name} - {new Date(post.published_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {post.post_type}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-gray-700">{post.content}</p>
            </CardContent>
          </Card>
        ))}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
            No active announcements. Check back later!
          </div>
        )}
      </div>
    </div>
  )
}`
};

for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(file, content, 'utf8');
}
console.log("Complete rewrite successful.");
