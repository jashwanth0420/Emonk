import { loginAction } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const error = (await searchParams).error
  
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4">
      <Card className="relative z-10 w-full max-w-sm bg-card shadow-sm shadow-2xl border border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Emonk Attendance</CardTitle>
          <CardDescription className="text-center">Enter your credentials below to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="grid gap-4">
            {error && (
              <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="email@emonk.edu" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full mt-2">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
