import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfileAction } from './actions'

export default async function StudentProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Professional Links & Bio</CardTitle>
          <CardDescription>Keep your profile updated for tutors and admins to see your progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-md mb-6">
              <div>
                <Label className="text-muted-foreground text-xs">Full Name</Label>
                <p className="font-medium">{profile?.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Department</Label>
                <p className="font-medium">{profile?.department || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Status</Label>
                <p className="font-medium capitalize text-green-600">{profile?.status}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={profile?.bio || ''} placeholder="A short bio about your learning goals..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input id="linkedin_url" name="linkedin_url" defaultValue={profile?.linkedin_url || ''} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input id="github_url" name="github_url" defaultValue={profile?.github_url || ''} placeholder="https://github.com/username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leetcode_url">LeetCode URL</Label>
                <Input id="leetcode_url" name="leetcode_url" defaultValue={profile?.leetcode_url || ''} placeholder="https://leetcode.com/username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hackerrank_url">HackerRank URL</Label>
                <Input id="hackerrank_url" name="hackerrank_url" defaultValue={profile?.hackerrank_url || ''} placeholder="https://hackerrank.com/username" />
              </div>
            </div>

            <Button type="submit">Save Profile Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
