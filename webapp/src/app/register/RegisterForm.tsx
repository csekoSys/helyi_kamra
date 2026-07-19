'use client'

import { useState } from 'react'
import { register } from '@/app/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Lock, User, Phone, Store, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterForm() {
  const [role, setRole] = useState<'buyer' | 'producer'>('buyer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [farmName, setFarmName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('role', role)
    formData.append('name', name)
    formData.append('phone', phone)
    if (role === 'producer') {
      formData.append('farmName', farmName)
    }

    try {
      const res = await register(null, formData)
      if (res.error) {
        setError(res.error)
      } else if (res.success) {
        setSuccess(res.success)
      }
    } catch (err: any) {
      setError('Hiba történt a regisztráció során. Kérjük, próbáld újra!')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md shadow-lg border-green-200 bg-green-50/10">
        <CardContent className="flex flex-col items-center gap-4 text-center py-10">
          <CheckCircle className="h-16 w-16 text-green-600 animate-bounce" />
          <h2 className="text-2xl font-extrabold tracking-tight text-green-950">Sikeres regisztráció!</h2>
          <p className="text-sm text-green-800 leading-relaxed">
            {success}
          </p>
          <Link href="/login" className={buttonVariants() + " mt-4 font-semibold w-full flex items-center justify-center text-sm"}>
            Ugrás a bejelentkezéshez
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-extrabold tracking-tight text-center font-heading">
          Regisztráció
        </CardTitle>
        <CardDescription className="text-center">
          Hozd létre saját HelyiKamra profilodat
        </CardDescription>
      </CardHeader>
      
      <div className="px-6">
        <Tabs defaultValue="buyer" className="w-full" onValueChange={(val) => setRole(val as 'buyer' | 'producer')}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="buyer" className="font-semibold text-xs">Vásárló leszek</TabsTrigger>
            <TabsTrigger value="producer" className="font-semibold text-xs">Termelő vagyok</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <form onSubmit={handleSubmit} className="mt-2">
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{role === 'producer' ? 'Kapcsolattartó neve' : 'Teljes név'}</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder={role === 'producer' ? 'Kovács János' : 'Szabó Anna'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Farm Name (Producer only) */}
          {role === 'producer' && (
            <div className="space-y-2">
              <Label htmlFor="farmName">Gazdaság / Tanya megnevezése</Label>
              <div className="relative">
                <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="farmName"
                  type="text"
                  placeholder="pl. Aranykalász Családi Gazdaság"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonszám (opcionális)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+36 30 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
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
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Jelszó</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="minimum 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={loading} className="w-full font-semibold text-sm">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Regisztráció...
              </>
            ) : (
              'Regisztráció'
            )}
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            Már van fiókod?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Jelentkezz be
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
