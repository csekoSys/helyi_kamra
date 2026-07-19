'use client'

import { useState } from 'react'
import { startOrSendMessage } from '@/app/actions/messages'
import { Button, buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/navigation'

interface ContactFormProps {
  producerId: string
  farmName: string
  isAuthenticated: boolean
  userRole?: string | null
}

export default function ContactForm({
  producerId,
  farmName,
  isAuthenticated,
  userRole,
}: ContactFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await startOrSendMessage(producerId, content)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setContent('')
      }
    } catch (err: any) {
      setError('Hiba történt az üzenet küldése közben.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card id="kapcsolat" className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Kapcsolatfelvétel
          </CardTitle>
          <CardDescription>
            Szeretnél egyeztetni a termelővel? Kérdeznél a termékekről?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center text-center py-6">
          <p className="text-sm text-muted-foreground">
            A kapcsolatfelvételhez és a belső üzenetküldéshez be kell jelentkezned.
          </p>
          <a href="/login?redirect=true" className={buttonVariants() + " w-full font-semibold flex items-center justify-center text-sm"}>
            Bejelentkezés vásárlóként
          </a>
        </CardContent>
      </Card>
    )
  }

  if (userRole === 'producer') {
    return (
      <Card id="kapcsolat" className="bg-muted/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Saját Adatlap
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground text-center py-4">
          Ez az Ön nyilvános termelői profilja. A vásárlók ezen az oldalon keresztül láthatják termékeit, telephelyeit és küldhetnek üzenetet.
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card id="kapcsolat" className="border-green-200 bg-green-50/20 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 text-center py-8">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
          <h3 className="font-bold text-lg text-green-900">Üzenet elküldve!</h3>
          <p className="text-sm text-green-700 max-w-xs">
            Sikeresen felvetted a kapcsolatot a gazdával. Válaszát az Üzeneteim menüpontban találod majd.
          </p>
          <a href="/dashboard/messages" className={buttonVariants({ variant: "outline" }) + " mt-2 flex items-center justify-center text-sm"}>
            Üzenetek megtekintése
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="kapcsolat" className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Üzenet a gazdának
        </CardTitle>
        <CardDescription>
          Küldj közvetlen belső üzenetet vagy foglalási kérést a(z) <strong className="text-foreground">{farmName}</strong> részére.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Textarea
              placeholder="Írd ide az üzeneted vagy kérdésed a termékekkel, átvétellel kapcsolatban..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={1000}
              required
              className="resize-none"
            />
            <span className="text-[10px] text-muted-foreground text-right">
              {content.length}/1000 karakter
            </span>
          </div>

          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full font-semibold">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Küldés folyamatban...
              </>
            ) : (
              'Üzenet küldése'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
