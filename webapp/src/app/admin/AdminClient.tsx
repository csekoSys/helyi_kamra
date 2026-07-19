'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { approveProducer, addMarket, deleteMarket, createBlogPost, deleteBlogPost } from '@/app/actions/admin'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldAlert, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <Card className="w-full h-[250px] flex items-center justify-center bg-muted">
      <p className="text-muted-foreground animate-pulse">Térkép betöltése...</p>
    </Card>
  ),
})

interface Producer {
  id: string
  is_approved_by_admin: boolean
  producer_profiles: { farm_name: string; phone: string } | null
  email: string | null
}

interface Market {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  schedule: string
}

interface BlogPost {
  id: string
  title: string
  content: string
  is_sponsored: boolean
  created_at: string
}

interface AdminClientProps {
  producers: Producer[]
  markets: Market[]
  blogPosts: BlogPost[]
}

export default function AdminClient({ producers, markets, blogPosts }: AdminClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Market states
  const [marketOpen, setMarketOpen] = useState(false)
  const [marketName, setMarketName] = useState('')
  const [marketAddress, setMarketAddress] = useState('')
  const [marketLat, setMarketLat] = useState(47.4979)
  const [marketLng, setMarketLng] = useState(19.0402)
  const [marketSchedule, setMarketSchedule] = useState('')

  // Blog states
  const [blogOpen, setBlogOpen] = useState(false)
  const [blogTitle, setBlogTitle] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [blogSponsored, setBlogSponsored] = useState(false)

  const handleApprove = async (id: string, status: boolean) => {
    try {
      const res = await approveProducer(id, status)
      if (res.error) {
        alert(res.error)
      }
    } catch (err) {
      alert('Hiba a jóváhagyás során.')
    }
  }

  const handleMarketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!marketName || !marketAddress || !marketLat || !marketLng || !marketSchedule) return

    setLoading(true)
    setError(null)

    try {
      const res = await addMarket(null, {
        name: marketName,
        address: marketAddress,
        latitude: marketLat,
        longitude: marketLng,
        schedule: marketSchedule,
      })

      if (res.error) {
        setError(res.error)
      } else {
        setMarketOpen(false)
        setMarketName('')
        setMarketAddress('')
        setMarketSchedule('')
      }
    } catch (err) {
      setError('Hiba történt a piac hozzáadásakor.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarketDelete = async (id: string) => {
    if (!confirm('Biztosan törlöd ezt a piacot?')) return

    try {
      const res = await deleteMarket(id)
      if (res.error) {
        alert(res.error)
      }
    } catch (err) {
      alert('Sikertelen törlés.')
    }
  }

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blogTitle || !blogContent) return

    setLoading(true)
    setError(null)

    try {
      const res = await createBlogPost(null, {
        title: blogTitle,
        content: blogContent,
        is_sponsored: blogSponsored,
      })

      if (res.error) {
        setError(res.error)
      } else {
        setBlogOpen(false)
        setBlogTitle('')
        setBlogContent('')
        setBlogSponsored(false)
      }
    } catch (err) {
      setError('Hiba történt a blogbejegyzés mentésekor.')
    } finally {
      setLoading(false)
    }
  }

  const handleBlogDelete = async (id: string) => {
    if (!confirm('Biztosan törlöd ezt a bejegyzést?')) return

    try {
      const res = await deleteBlogPost(id)
      if (res.error) {
        alert(res.error)
      }
    } catch (err) {
      alert('Sikertelen törlés.')
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-heading flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-primary" /> Rendszeradminisztráció
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Termelők jóváhagyása, központi piacok kezelése és PR cikkek publikálása.
        </p>
      </div>

      <Tabs defaultValue="producers" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="producers">Jóváhagyások ({producers.length})</TabsTrigger>
          <TabsTrigger value="markets">Piacok ({markets.length})</TabsTrigger>
          <TabsTrigger value="blog">Blog cikkek ({blogPosts.length})</TabsTrigger>
        </TabsList>

        {/* Producers approval tab */}
        <TabsContent value="producers">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Regisztrált Termelők</CardTitle>
              <CardDescription>Jóváhagyásra váró és már engedélyezett kistermelők listája.</CardDescription>
            </CardHeader>
            <CardContent>
              {producers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gazdaság neve</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Státusz</TableHead>
                      <TableHead className="text-right">Művelet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {producers.map((prod) => (
                      <TableRow key={prod.id}>
                        <TableCell className="font-semibold text-foreground">
                          {prod.producer_profiles?.farm_name || 'Ismeretlen'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{prod.email || 'Nincs'}</TableCell>
                        <TableCell>{prod.producer_profiles?.phone || 'Nincs'}</TableCell>
                        <TableCell>
                          <Badge variant={prod.is_approved_by_admin ? 'default' : 'secondary'} className="text-[10px]">
                            {prod.is_approved_by_admin ? 'Jóváhagyva' : 'Jóváhagyásra vár'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {prod.is_approved_by_admin ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(prod.id, false)}
                              className="h-8 text-destructive hover:bg-destructive/10 text-xs font-semibold"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Visszavonás
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(prod.id, true)}
                              className="h-8 text-xs font-semibold bg-primary hover:opacity-95"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Jóváhagyás
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-6 text-sm text-muted-foreground">Nincs regisztrált termelő.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Markets central management */}
        <TabsContent value="markets">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Piacok listája</h3>
              <Dialog open={marketOpen} onOpenChange={setMarketOpen}>
                <DialogTrigger className={buttonVariants() + " font-semibold gap-1.5 shadow-sm text-sm cursor-pointer"}>
                  <Plus className="h-4 w-4" /> Új piac felvitele
                </DialogTrigger>
                <DialogContent className="max-w-md border-border">
                  <DialogHeader>
                    <DialogTitle className="font-bold">Központi piac felvétele</DialogTitle>
                    <DialogDescription>Add meg a piac nevét, címét és nyitvatartását.</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleMarketSubmit} className="space-y-4 py-2">
                    {error && (
                      <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="m-name">Piac neve</Label>
                      <Input
                        id="m-name"
                        value={marketName}
                        onChange={(e) => setMarketName(e.target.value)}
                        placeholder="pl. Fény utcai piac"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="m-address">Pontos cím</Label>
                      <Input
                        id="m-address"
                        value={marketAddress}
                        onChange={(e) => setMarketAddress(e.target.value)}
                        placeholder="pl. 1024 Budapest, Lövőház u. 12."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="m-lat">Szélesség (Lat)</Label>
                        <Input
                          id="m-lat"
                          type="number"
                          step="0.000001"
                          value={marketLat}
                          onChange={(e) => setMarketLat(parseFloat(e.target.value))}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="m-lng">Hosszúság (Lng)</Label>
                        <Input
                          id="m-lng"
                          type="number"
                          step="0.000001"
                          value={marketLng}
                          onChange={(e) => setMarketLng(parseFloat(e.target.value))}
                          required
                        />
                      </div>
                    </div>

                    {/* Helper map */}
                    <div className="h-[150px] border rounded overflow-hidden">
                      <Map
                        center={[marketLat, marketLng]}
                        zoom={11}
                        markers={[{ id: 'm-picker', name: 'Új piac', lat: marketLat, lng: marketLng, type: 'market' }]}
                        onPositionSelect={(lat, lng) => {
                          setMarketLat(parseFloat(lat.toFixed(6)))
                          setMarketLng(parseFloat(lng.toFixed(6)))
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="m-sched">Nyitvatartási rend</Label>
                      <Input
                        id="m-sched"
                        value={marketSchedule}
                        onChange={(e) => setMarketSchedule(e.target.value)}
                        placeholder="pl. Szombat: 06:00 - 13:00"
                        required
                      />
                    </div>

                    <DialogFooter className="border-t border-border pt-4">
                      <Button type="button" variant="outline" onClick={() => setMarketOpen(false)}>Mégse</Button>
                      <Button type="submit" disabled={loading} className="font-semibold">
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Hozzáadás
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {markets.length > 0 ? (
              <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Név</TableHead>
                      <TableHead>Cím</TableHead>
                      <TableHead>Nyitvatartás</TableHead>
                      <TableHead className="text-right">Törlés</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {markets.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-semibold text-foreground">{m.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.address}</TableCell>
                        <TableCell className="text-xs font-medium">{m.schedule}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarketDelete(m.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-6 text-sm text-muted-foreground">Még nincs piac hozzáadva a rendszerhez.</p>
            )}
          </div>
        </TabsContent>

        {/* Blog Post Management */}
        <TabsContent value="blog">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Blog cikkek listája</h3>
              <Dialog open={blogOpen} onOpenChange={setBlogOpen}>
                <DialogTrigger className={buttonVariants() + " font-semibold gap-1.5 shadow-sm text-sm cursor-pointer"}>
                  <Plus className="h-4 w-4" /> Új cikk írása
                </DialogTrigger>
                <DialogContent className="max-w-xl border-border">
                  <DialogHeader>
                    <DialogTitle className="font-bold">Új blog bejegyzés</DialogTitle>
                    <DialogDescription>Írj egy új cikket, vagy egy szponzorált PR anyagot.</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleBlogSubmit} className="space-y-4 py-2">
                    {error && (
                      <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="b-title">Cikk címe</Label>
                      <Input
                        id="b-title"
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        placeholder="pl. 5 módszer a friss zöldségek tárolására..."
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="b-content">Tartalom</Label>
                      <Textarea
                        id="b-content"
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        placeholder="A cikk részletes szövege..."
                        rows={8}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div className="flex flex-col gap-0.5">
                        <Label htmlFor="b-sponsored">Szponzorált bejegyzés</Label>
                        <span className="text-[10px] text-muted-foreground">
                          PR vagy fizetett hirdető cikkek jelölésére szolgál.
                        </span>
                      </div>
                      <Switch
                        id="b-sponsored"
                        checked={blogSponsored}
                        onCheckedChange={setBlogSponsored}
                      />
                    </div>

                    <DialogFooter className="border-t border-border pt-4">
                      <Button type="button" variant="outline" onClick={() => setBlogOpen(false)}>Mégse</Button>
                      <Button type="submit" disabled={loading} className="font-semibold">
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Publikálás
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {blogPosts.length > 0 ? (
              <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cím</TableHead>
                      <TableHead>Dátum</TableHead>
                      <TableHead>Státusz</TableHead>
                      <TableHead className="text-right">Törlés</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-semibold text-foreground">{post.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString('hu-HU')}
                        </TableCell>
                        <TableCell>
                          {post.is_sponsored ? (
                            <Badge variant="secondary" className="text-[10px] bg-accent/20 text-accent-foreground font-bold">
                              Szponzorált
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Normál</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleBlogDelete(post.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-6 text-sm text-muted-foreground">Nincsenek publikált cikkek.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
