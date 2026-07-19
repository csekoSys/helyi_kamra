'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Phone, Store, FileText, CheckCircle } from 'lucide-react'

interface ProfileFormProps {
  isBuyer: boolean
  isProducer: boolean
  isAdmin: boolean
  initialData: {
    name?: string
    farm_name?: string
    bio?: string
    phone?: string
    is_phone_public?: boolean
  }
}

export default function ProfileForm({ isBuyer, isProducer, initialData }: ProfileFormProps) {
  const [name, setName] = useState(initialData.name || '')
  const [farmName, setFarmName] = useState(initialData.farm_name || '')
  const [bio, setBio] = useState(initialData.bio || '')
  const [phone, setPhone] = useState(initialData.phone || '')
  const [isPhonePublic, setIsPhonePublic] = useState(initialData.is_phone_public ?? false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await updateProfile(null, {
        name: isBuyer ? name : undefined,
        farm_name: isProducer ? farmName : undefined,
        bio: isProducer ? bio : undefined,
        phone,
        is_phone_public: isProducer ? isPhonePublic : undefined,
      })

      if (res.error) {
        setError(res.error)
      } else if (res.success) {
        setSuccess(res.success)
      }
    } catch (err) {
      setError('Hiba történt a profil frissítése során.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-sm border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" /> Profil Beállítások
        </CardTitle>
        <CardDescription>
          Módosítsd az adataidat és szabályozd az adatok publikus megjelenését.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {success && (
            <div className="p-3 text-xs font-semibold bg-green-50/20 text-green-700 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              {success}
            </div>
          )}

          {error && (
            <div className="p-3 text-xs font-semibold bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {/* Buyer Profile Fields */}
            {isBuyer && (
              <div className="space-y-2">
                <Label htmlFor="prof-name">Teljes név</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="prof-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {/* Producer Profile Fields */}
            {isProducer && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="prof-farm">Gazdaság / Tanya megnevezése</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prof-farm"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prof-bio">Bemutatkozás</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="prof-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Írd le pár mondatban, mit érdemes tudni a gazdaságodról, hogyan termeltek..."
                      rows={4}
                      className="pl-9"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Shared Fields (Phone) */}
            <div className="space-y-2">
              <Label htmlFor="prof-phone">Telefonszám</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prof-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+36 30 123 4567"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Public Phone toggle for Producer */}
            {isProducer && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="phone-public">Publikus telefonszám</Label>
                  <span className="text-[10px] text-muted-foreground">
                    Ha engedélyezed, a telefonszámod bárki számára látható lesz a profilodon.
                  </span>
                </div>
                <Switch
                  id="phone-public"
                  checked={isPhonePublic}
                  onCheckedChange={setIsPhonePublic}
                />
              </div>
            )}
          </div>
        </CardContent>
        <div className="p-6 border-t border-border bg-muted/20 flex justify-end">
          <Button type="submit" disabled={loading} className="font-semibold px-6">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Módosítások mentése
          </Button>
        </div>
      </form>
    </Card>
  )
}
