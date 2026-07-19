'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    try {
      const res = await login(null, formData)
      if (res && res.error) {
        setError(res.error)
        setLoading(false)
      }
      // If success, next.js middleware handles redirect, or redirect is thrown in server action
    } catch (err: any) {
      // In Next.js redirect() throws a special error, which is caught by Next.js.
      // If it's a redirect error, let Next.js handle it. Otherwise display error.
      if (err.message && err.message.includes('NEXT_REDIRECT')) {
        return
      }
      setError('Sikertelen bejelentkezés. Ellenőrizd a belépési adataidat!')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-border bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-extrabold tracking-tight text-center font-heading text-foreground">
          Bejelentkezés
        </CardTitle>
        <CardDescription className="text-center">
          Add meg az e-mail címed és jelszavad a belépéshez
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail cím</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="pelda@helyikamra.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Jelszó</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={loading} className="w-full font-semibold text-sm">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Belépés folyamatban...
              </>
            ) : (
              'Bejelentkezés'
            )}
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            Még nincs fiókod?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Regisztrálj itt
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
