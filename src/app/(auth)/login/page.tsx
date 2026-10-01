import { loginAction } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import ShapeWaves from '@/components/ui/ShapeWaves'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const error = (await searchParams).error
  
  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ShapeWaves
          text="Engineering Monk"
          fontFamily='Geist, "Geist Sans", system-ui, sans-serif'
          fontWeight={500}
          textSize={0.49}
          shapes="mixed"
          cellSize={10}
          dotSize={0.75}
          color="#000000"
          hoverColor="#F97316"
          backgroundColor="#111111"
          speed={1}
          scale={1}
          contrast={1}
          brightness={0.4}
          flow={0}
          direction={0}
          fade={0.25}
          interactive={true}
          splashRadius={40}
          splashStrength={0.4}
          glow={0.35}
          intro={true}
          introDuration={1.6}
          paused={false}
        />
      </div>
      
      <Card className="relative z-10 w-full max-w-sm bg-background/95 backdrop-blur shadow-2xl border-white/10">
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
