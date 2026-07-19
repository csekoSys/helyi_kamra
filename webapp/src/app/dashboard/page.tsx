import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Carrot, MapPin, MessageSquare, AlertCircle, CheckCircle, Search, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, producer_profiles(*), buyer_profiles(*)')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const isProducer = profile.role === 'producer'
  const isApproved = profile.is_approved_by_admin

  // Fetch counts based on role
  let productsCount = 0
  let locationsCount = 0
  let unreadMessagesCount = 0

  if (isProducer) {
    const { count: prodCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('producer_id', user.id)
    productsCount = prodCount || 0

    const { count: locCount } = await supabase
      .from('producer_locations')
      .select('*', { count: 'exact', head: true })
      .eq('producer_id', user.id)
    locationsCount = locCount || 0
  }

  // Count unread messages in threads where the user is a participant
  const { data: threads } = await supabase
    .from('message_threads')
    .select('id')
    .or(`buyer_id.eq.${user.id},producer_id.eq.${user.id}`)

  if (threads && threads.length > 0) {
    const threadIds = threads.map(t => t.id)
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('thread_id', threadIds)
      .neq('sender_id', user.id)
      .eq('is_read', false)
    unreadMessagesCount = unreadCount || 0
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-heading">
          Szia, {isProducer ? profile.producer_profiles?.farm_name : profile.buyer_profiles?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">Üdvözlünk a HelyiKamra vezérlőpultodon.</p>
      </div>

      {/* Admin Approval Warning for Producers */}
      {isProducer && !isApproved && (
        <div className="p-5 border border-amber-300 bg-amber-50 rounded-xl flex gap-4 text-amber-800">
          <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1.5 text-sm">
            <h4 className="font-bold">Profil jóváhagyása függőben</h4>
            <p className="leading-relaxed">
              Az adatlapod még ellenőrzésre vár. Ahhoz, hogy a vásárlók keresni tudjanak a térképen, az adminisztrátoroknak jóvá kell hagyniuk a profilodat.
            </p>
            <p className="font-semibold text-xs mt-1">
              Teendő: Kérjük, tölts fel legalább egy terméket és egy helyszínt (telephelyet), hogy elvégezhessük a jóváhagyást!
            </p>
          </div>
        </div>
      )}

      {isProducer && isApproved && (
        <div className="p-4 border border-green-200 bg-green-50/20 rounded-xl flex gap-3 text-green-800 text-sm font-medium">
          <CheckCircle className="h-5 w-5 shrink-0" />
          A profilod aktív és kereshető a térképen a vásárlók számára!
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-6">
        {isProducer && (
          <>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold">Saját Termékek</CardTitle>
                <Carrot className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{productsCount}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge variant={productsCount >= 20 ? 'destructive' : 'secondary'} className="text-[10px]">
                    {productsCount}/20 darab
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">ingyenes limit</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold">Helyszínek</CardTitle>
                <MapPin className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{locationsCount}</div>
                <p className="text-[10px] text-muted-foreground mt-2">Telephelyek és piacok száma</p>
              </CardContent>
            </Card>
          </>
        )}

        {!isProducer && (
          <Card className="shadow-sm sm:col-span-2 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                <Search className="h-5 w-5" /> Keresés indítása
              </CardTitle>
              <CardDescription>
                Böngéssz a térképen friss zöldségek, gyümölcsök és házi termékek után a közeledben.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/search" className={buttonVariants() + " font-semibold gap-1.5 shadow-sm flex items-center justify-center w-fit text-sm"}>
                Térképes kereső megnyitása <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold">Üzenetek</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{unreadMessagesCount}</div>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant={unreadMessagesCount > 0 ? 'default' : 'secondary'} className="text-[10px]">
                {unreadMessagesCount > 0 ? `${unreadMessagesCount} új` : 'nincs új'}
              </Badge>
              <span className="text-[10px] text-muted-foreground">olvasatlan üzenet</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="mt-4">
        <h3 className="font-bold text-lg mb-4">Gyors elérés</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {isProducer ? (
            <>
              <Link href="/dashboard/products" className="group">
                <Card className="hover:border-primary/50 transition-all p-5 h-full flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold group-hover:text-primary transition-colors">Termékek kezelése</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Tölts fel új árukat, módosítsd az árakat, vagy kapcsold be/ki a termékek elérhetőségét egyetlen gombbal.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary mt-4 inline-flex items-center gap-1">
                    Termékeim megnyitása &rarr;
                  </span>
                </Card>
              </Link>

              <Link href="/dashboard/locations" className="group">
                <Card className="hover:border-primary/50 transition-all p-5 h-full flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold group-hover:text-primary transition-colors">Helyszínek & szállítás beállítása</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Állítsd be a tanyád koordinátáit, határozd meg a kiszállítási hatósugarat és csatlakozz a közeli termelői piacokhoz.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary mt-4 inline-flex items-center gap-1">
                    Helyszíneim megnyitása &rarr;
                  </span>
                </Card>
              </Link>
            </>
          ) : (
            <Link href="/dashboard/profile" className="group col-span-2">
              <Card className="hover:border-primary/50 transition-all p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold group-hover:text-primary transition-colors">Profil adatok és elérhetőségek</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Módosítsd a nevedet, állítsd be a telefonszámodat, hogy a termelők felvehessék veled a kapcsolatot a foglalások kapcsán.
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary mt-4 inline-flex items-center gap-1">
                  Profil módosítása &rarr;
                </span>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
