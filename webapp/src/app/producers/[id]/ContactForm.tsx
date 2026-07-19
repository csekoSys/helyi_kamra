'use client'

import { useState } from 'react'
import { startOrSendMessage } from '@/app/actions/messages'
import { Button, buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'

interface ContactFormProps {
  producerId: string
  farmName: string
  isAuthenticated: boolean
  isOwner?: boolean
}

export default function ContactForm({
  producerId,
  farmName,
  isAuthenticated,
  isOwner,
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
      <>
        <Card id="kapcsolat" className="glass-card shadow-2xl border-white/[0.08] relative z-10">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-primary" />
              Kapcsolatfelvétel
            </CardTitle>
            <CardDescription className="text-white/50">
              Szeretnél egyeztetni a termelővel? Kérdeznél a termékekről?
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center text-center py-6">
            <p className="text-sm text-white/60 leading-relaxed">
              A kapcsolatfelvételhez és a belső üzenetküldéshez be kell jelentkezned.
            </p>
            <a href="/login?redirect=true" className={buttonVariants() + " w-full font-bold flex items-center justify-center h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border-0 text-white rounded-xl cursor-pointer"}>
              Bejelentkezés vásárlóként
            </a>
          </CardContent>
        </Card>
        {/* Sticky Mobile CTA */}
        <div className="md:hidden fixed bottom-[72px] left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/[0.06] z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <a href="/login?redirect=true" className={buttonVariants() + " w-full font-extrabold text-base h-14 bg-gradient-to-r from-emerald-500 to-teal-500 border-0 text-white rounded-xl flex items-center justify-center"}>
            Kapcsolatfelvétel
          </a>
        </div>
      </>
    )
  }

  if (isOwner) {
    return (
      <Card id="kapcsolat" className="glass-card border-dashed border-white/[0.08] relative z-10">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white/50">
            Saját Adatlap
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-white/40 text-center py-4">
          Ez az Ön nyilvános termelői profilja. A vásárlók ezen az oldalon keresztül láthatják termékeit, telephelyeit és küldhetnek üzenetet.
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card id="kapcsolat" className="border-emerald-500/20 bg-emerald-500/5 shadow-2xl relative z-10">
        <CardContent className="flex flex-col items-center gap-4 text-center py-8">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <h3 className="font-bold text-lg text-white">Üzenet elküldve!</h3>
          <p className="text-sm text-white/60 max-w-xs leading-relaxed">
            Sikeresen felvetted a kapcsolatot a gazdával. Válaszát az Üzeneteim menüpontban találod majd.
          </p>
          <a href="/dashboard/messages" className={buttonVariants({ variant: "outline" }) + " mt-2 h-11 px-6 rounded-xl border-white/10 hover:bg-white/[0.08] text-white hover:text-white"}>
            Üzenetek megtekintése
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card id="kapcsolat" className="glass-card shadow-2xl relative z-10 border-white/[0.08]">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5 text-primary" />
            Üzenet a gazdának
          </CardTitle>
          <CardDescription className="text-white/50">
            Küldj közvetlen belső üzenetet vagy foglalási kérést a(z) <strong className="text-white">{farmName}</strong> részére.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Írd ide az üzeneted vagy kérdésed a termékekkel, átvétellel kapcsolatban..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                maxLength={1000}
                required
                className="resize-none border-white/[0.08] bg-white/[0.01] text-white placeholder:text-white/30 rounded-xl focus:border-primary/50 focus-visible:ring-primary/20"
              />
              <span className="text-[10px] text-white/40 text-right">
                {content.length}/1000 karakter
              </span>
            </div>

            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full h-12 font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl border-0 shadow-lg shadow-emerald-950/20 cursor-pointer">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Küldés...
                </>
              ) : (
                'Üzenet küldése'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-[72px] left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/[0.06] z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <a href="#kapcsolat" className={buttonVariants() + " w-full font-extrabold text-base h-14 bg-gradient-to-r from-emerald-500 to-teal-500 border-0 text-white rounded-xl flex items-center justify-center"}>
          Üzenet küldése
        </a>
      </div>
    </>
  )
}
