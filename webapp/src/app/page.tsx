import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, buttonVariants } from '@/components/ui/button'
import { 
  Carrot, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Truck, 
  Users, 
  ArrowRight,
  BookOpen,
  Apple,
  Milk,
  ChefHat
} from 'lucide-react'

// Icon mapping helper
const iconMap: Record<string, any> = {
  carrot: Carrot,
  apple: Apple,
  milk: Milk,
  shopping: ChefHat,
}

export default async function Home() {
  const supabase = await createClient()

  // Fetch categories from DB
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Fetch latest blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  // Fetch some active products as featured
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, producer_profiles(farm_name)')
    .eq('is_active', true)
    .limit(4)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 py-20 md:py-32 px-4 border-b border-border overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary filter blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent filter blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">
            <MapPin className="h-3 w-3" /> Helyi kistermelők egy helyen
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground font-heading mb-6 leading-tight">
            Vásárolj friss, hazai termékeket <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
              közvetlenül a termelőktől!
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Keresd meg a hozzád legközelebb lévő biogazdaságokat, kistermelőket és kézműveseket. Térképes keresőnkkel másodpercek alatt megtalálod a helyi ízeket.
          </p>

          {/* Quick Search Redirect */}
          <div className="max-w-xl mx-auto bg-background p-2 rounded-xl shadow-xl border border-border flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center px-3 gap-2">
              <Search className="text-muted-foreground h-5 w-5" />
              <input 
                type="text" 
                placeholder="Mit keresel? (pl. alma, méz, tej...)" 
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm py-2.5"
                disabled
              />
            </div>
            <Link href="/search" className={buttonVariants({ size: "lg" }) + " sm:w-auto font-semibold flex items-center justify-center gap-1"}>
              Térképes keresés <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Kategóriák</h2>
            <p className="text-muted-foreground mt-2">Válassz a legnépszerűbb friss terméktípusok közül</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories && categories.length > 0 ? (
              categories.map((cat) => {
                const Icon = iconMap[cat.icon_name] || Carrot
                return (
                  <Link 
                    key={cat.id} 
                    href={`/search?category=${cat.id}`}
                    className="flex flex-col items-center justify-center p-5 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md hover:scale-[1.02] transition-all text-center group"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all mb-3">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                )
              })
            ) : (
              // Fallback categories if database is not seeded yet
              ['Zöldség', 'Gyümölcs', 'Tejtermék', 'Hústermék', 'Pékáru', 'Méz', 'Tojás', 'Egyéb'].map((name, idx) => (
                <Link 
                  key={idx}
                  href="/search"
                  className="flex flex-col items-center justify-center p-5 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Carrot className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold">{name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/40 border-y border-border px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight font-heading">Miért a HelyiKamra?</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Támogatjuk a helyi közösségeket és a fenntartható gazdálkodást.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm flex flex-col gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">100% Hazai és Friss</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Nincsenek hetekig hűtőházban tárolt gyümölcsök és zöldségek. A termékek egyenesen a földről vagy a termelőtől kerülnek az asztalodra.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-sm flex flex-col gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Közvetlen Kapcsolat</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Kérdezz közvetlenül a termelőtől az alkalmazáson belüli chat-en keresztül, ismerd meg a gazdaságot és a termesztés módját.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-sm flex flex-col gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Rugalmas Beszerzés</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Találkozz a termelőkkel a helyi piacokon, vedd át a megrendelésed közvetlenül a tanyán, vagy egyeztess házhozszállítást.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products / Producer Profiles section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight font-heading">Friss kistermelői kínálat</h2>
              <p className="text-muted-foreground mt-1">Néhány kiemelt termék a közeli gazdaságokból</p>
            </div>
            <Link href="/search" className={buttonVariants({ variant: "outline" })}>
              Böngészés térképen
            </Link>
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => (
                <div key={prod.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                  <div className="h-48 bg-muted relative overflow-hidden flex items-center justify-center">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                    ) : (
                      <Carrot className="h-16 w-16 text-primary/20" />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-xs text-primary font-semibold tracking-wider uppercase mb-1">
                      {prod.producer_profiles?.farm_name || 'Gazdaság'}
                    </span>
                    <h3 className="font-bold text-base text-foreground mb-2 group-hover:text-primary transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-grow">
                      {prod.description || 'Nincs leírás megadva.'}
                    </p>
                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <span className="font-extrabold text-primary text-lg">
                        {Math.round(prod.price)} Ft <span className="text-xs font-normal text-muted-foreground">/ {prod.unit}</span>
                      </span>
                      <Link href={`/producers/${prod.producer_id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                        Gazda lapja
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/20">
              <p className="text-muted-foreground">Jelenleg nincsenek feltöltött termékek az adatbázisban.</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Lépj be termelőként és töltsd fel az első kínálatodat!</p>
            </div>
          )}
        </div>
      </section>

      {/* Blog module teaser */}
      <section className="py-20 bg-muted/30 border-t border-border px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight font-heading">Hasznos Tanácsok & Hírek</h2>
            <Link href="/blog" className={buttonVariants({ variant: "ghost" }) + " gap-1"}>
              Összes cikk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts && blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <div key={post.id} className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString('hu-HU')}
                      </span>
                      {post.is_sponsored && (
                        <span className="text-[10px] bg-accent/20 text-accent-foreground font-bold px-1.5 py-0.5 rounded">
                          Szponzorált
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-3 hover:text-primary transition-colors">
                      <Link href={`/blog#post-${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                  <Link href={`/blog#post-${post.id}`} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                    Olvasás folytatása &rarr;
                  </Link>
                </div>
              ))
            ) : (
              // Default mock posts if blog is empty
              [
                {
                  title: 'Hogyan válaszd ki a legfrissebb zöldséget?',
                  content: 'A szezonalitás a legfontosabb tényező a friss termékek kiválasztásakor. Mutatunk 5 tippet, mire figyelj a vásárlás során...',
                  date: '2026-07-15',
                },
                {
                  title: 'Miért éri meg támogatni a helyi gazdaságokat?',
                  content: 'Ha helyben vásárolsz, nemcsak jobb minőségű ételt kapsz, hanem közvetlenül segíted a helyi kistermelőket a talpon maradásban...',
                  date: '2026-07-10',
                },
                {
                  title: 'Biogazdálkodás vs Hagyományos termesztés',
                  content: 'Valóban egészségesebbek a bio zöldségek? Tisztázzuk a tévhiteket és megmutatjuk a valódi különbségeket a két módszer között...',
                  date: '2026-07-05',
                }
              ].map((post, idx) => (
                <div key={idx} className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-3 hover:text-primary transition-colors">
                      <Link href="/blog">{post.title}</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                  <Link href="/blog" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                    Olvasás folytatása &rarr;
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
