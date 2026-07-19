'use client'

import { useState } from 'react'
import { register } from '@/app/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Mail, Lock, User, Phone, Store, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterForm() {
  const [isBuyer, setIsBuyer] = useState(true)
  const [isProducer, setIsProducer] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [farmName, setFarmName] = useState('')
  
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptGdpr, setAcceptGdpr] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isBuyer && !isProducer) {
      setError('Kérjük, válassz legalább egy szerepkört!')
      return
    }
    if (!acceptTerms || !acceptGdpr) {
      setError('A regisztrációhoz el kell fogadnod az ÁSZF-et és az Adatvédelmi tájékoztatót!')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    if (isBuyer) formData.append('isBuyer', 'on')
    if (isProducer) formData.append('isProducer', 'on')
    formData.append('name', name)
    formData.append('phone', phone)
    
    if (isProducer) {
      formData.append('farmName', farmName)
    }
    
    if (acceptTerms) formData.append('acceptTerms', 'on')
    if (acceptGdpr) formData.append('acceptGdpr', 'on')

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

      <form onSubmit={handleSubmit} className="mt-2">
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <Label className="font-semibold text-sm">Milyen fiókot szeretnél létrehozni?</Label>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="role-buyer" 
                  checked={isBuyer} 
                  onCheckedChange={(checked) => setIsBuyer(checked as boolean)} 
                />
                <Label htmlFor="role-buyer" className="cursor-pointer font-medium text-sm leading-none">Vásárlóként szeretnék regisztrálni</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="role-producer" 
                  checked={isProducer} 
                  onCheckedChange={(checked) => setIsProducer(checked as boolean)} 
                />
                <Label htmlFor="role-producer" className="cursor-pointer font-medium text-sm leading-none">Kistermelőként (is) szeretném eladni a termékeimet</Label>
              </div>
            </div>
          </div>

          {/* Full Name (Always visible if either is checked, but label adapts) */}
          {(isBuyer || isProducer) && (
            <div className="space-y-2">
              <Label htmlFor="name">
                {isBuyer && !isProducer ? 'Teljes név' : 
                 isProducer && !isBuyer ? 'Kapcsolattartó neve' : 
                 'Teljes név / Kapcsolattartó'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Kovács János"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Farm Name (Producer only) */}
          {isProducer && (
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
                  required={isProducer}  className="pl-9"
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
                onChange={(e) => setPhone(e.target.value)}  className="pl-9"
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
                required  className="pl-9"
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
                required  className="pl-9"
              />
            </div>
          </div>
          
          <div className="border-t border-border pt-4 mt-4 space-y-3">
            <div className="flex flex-row items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={acceptTerms} 
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} 
                className="mt-1"
                required
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                  Elfogadom az Általános Szerződési Feltételeket
                </Label>
                <p className="text-xs text-muted-foreground">
                  Elolvastam és elfogadom a HelyiKamra működési szabályzatát.
                </p>
              </div>
            </div>
            
            <div className="flex flex-row items-start space-x-3">
              <Checkbox 
                id="gdpr" 
                checked={acceptGdpr} 
                onCheckedChange={(checked) => setAcceptGdpr(checked as boolean)} 
                className="mt-1"
                required
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="gdpr" className="text-sm font-medium leading-none cursor-pointer">
                  Elfogadom az Adatvédelmi tájékoztatót (GDPR)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Hozzájárulok a személyes adataim kezeléséhez.
                </p>
              </div>
            </div>
          </div>
          
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={loading || (!isBuyer && !isProducer) || !acceptTerms || !acceptGdpr} className="w-full font-semibold text-sm">
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
