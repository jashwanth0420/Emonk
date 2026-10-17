import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createTopicAction } from '../actions'

export default async function TopicsPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const adminClient = createAdminClient()

  const { data: topics } = await adminClient
    .from('topics')
    .select('*')
    .order('category', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Curriculum Topics</h1>
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
        <div className="lg:col-span-1 border rounded-lg p-5 bg-card/90 backdrop-blur-md h-fit space-y-4">
          <h2 className="text-lg font-semibold">Add New Topic</h2>
          <p className="text-xs text-muted-foreground">Topics are selected by students during attendance and used for targeted questions.</p>
          <form action={createTopicAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Topic Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Dynamic Programming" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required placeholder="e.g. Data Structures & Algorithms" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" placeholder="Brief scope of topic..." />
            </div>
            <Button type="submit" className="w-full">Create Topic</Button>
          </form>
        </div>

        <div className="lg:col-span-2 border rounded-lg overflow-hidden bg-card/90 backdrop-blur-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics?.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-semibold text-sm">{topic.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{topic.category}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={topic.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {topic.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!topics || topics.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-xs">
                    No topics found. Add your first topic on the left!
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
