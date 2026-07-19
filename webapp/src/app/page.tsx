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

export const dynamic = 'force-dynamic';


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
      <section className="relative min-h-[85vh] flex items-center justify-center bg-background px-4 overflow-hidden py-16">
        {/* Glow Spheres */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/[0.03] text-primary border border-white/[0.08] mb-8 shadow-sm">
            <MapPin className="h-3.5 w-3.5" /> Helyi kistermelők egy helyen
          </span>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white font-heading mb-8 leading-[1.1] max-w-4xl mx-auto">
            Vásárolj friss, hazai termékeket <br />
            <span className="text-gradient">
              közvetlenül a termelőktől!
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Keresd meg a hozzád legközelebb lévő biogazdaságokat, kistermelőket és kézműveseket. Térképes keresőnkkel másodpercek alatt megtalálod a helyi ízeket.
          </p>

          {/* Quick Search Redirect - Styled like modern SaaS */}
          <div className="max-w-2xl mx-auto bg-white/[0.02] backdrop-blur-xl p-3 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row gap-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <div className="flex-1 flex items-center px-4 gap-3 bg-white/[0.01] rounded-xl border border-white/[0.03]">
              <Search className="text-white/40 h-5 w-5" />
              <input 
                type="text" 
                placeholder="Mit keresel? (pl. alma, méz, tej...)" 
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder:text-white/30 text-base py-3"
                disabled
              />
            </div>
            <Link href="/search" className={buttonVariants() + " h-14 px-8 font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl shadow-lg shadow-emerald-950/20 border-0"}>
              Térképes keresés <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-background px-4 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Kategóriák</h2>
            <p className="text-white/50 mt-3 text-base">Válassz a legnépszerűbb friss terméktípusok közül</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories && categories.length > 0 ? (
              categories.map((cat) => {
                const Icon = iconMap[cat.icon_name] || Carrot
                return (
                  <Link 
                    key={cat.id} 
                    href={`/search?category=${cat.id}`}
                    className="glass-card glass-card-hover flex flex-col items-center justify-center p-6 rounded-2xl text-center group"
                  >
                    <div className="h-14 w-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all mb-4">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                )
              })
            ) : (
              ['Zöldség', 'Gyümölcs', 'Tejtermék', 'Hústermék', 'Pékáru', 'Méz', 'Tojás', 'Egyéb'].map((name, idx) => (
                <Link 
                  key={idx}
                  href="/search"
                  className="glass-card glass-card-hover flex flex-col items-center justify-center p-6 rounded-2xl text-center group"
                >
                  <div className="h-14 w-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all mb-4">
                    <Carrot className="h-7 w-7" />
                  </div>
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white">{name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white/[0.01] border-y border-white/[0.04] px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.01] to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Miért a HelyiKamra?</h2>
            <p className="text-white/50 mt-3 text-base max-w-xl mx-auto">Támogatjuk a helyi közösségeket és a fenntartható gazdálkodást.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl flex flex-col gap-5 hover:border-white/10 transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">100% Hazai és Friss</h3>
              <p className="text-sm leading-relaxed text-white/60">
                Nincsenek hetekig hűtőházban tárolt gyümölcsök és zöldségek. A termékek egyenesen a földről vagy a termelőtől kerülnek az asztalodra.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl flex flex-col gap-5 hover:border-white/10 transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Közvetlen Kapcsolat</h3>
              <p className="text-sm leading-relaxed text-white/60">
                Kérdezz közvetlenül a termelőtől az alkalmazáson belüli chat-en keresztül, ismerd meg a gazdaságot és a termesztés módját.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl flex flex-col gap-5 hover:border-white/10 transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Rugalmas Beszerzés</h3>
              <p className="text-sm leading-relaxed text-white/60">
                Találkozz a termelőkkel a helyi piacokon, vedd át a megrendelésed közvetlenül a tanyán, vagy egyeztess házhozszállítást.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products / Producer Profiles section */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Friss kistermelői kínálat</h2>
              <p className="text-white/50 mt-3 text-base">Néhány kiemelt termék a közeli gazdaságokból</p>
            </div>
            <Link href="/search" className={buttonVariants({ variant: "outline" }) + " h-12 rounded-xl border-white/10 hover:bg-white/[0.05] text-white hover:text-white"}>
              Böngészés térképen
            </Link>
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => (
                <div key={prod.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden group flex flex-col h-full">
                  <div className="h-48 bg-white/[0.01] relative overflow-hidden flex items-center justify-center border-b border-white/[0.04]">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Carrot className="h-16 w-16 text-primary/10" />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-xs text-primary font-bold tracking-wider uppercase mb-2">
                      {prod.producer_profiles?.farm_name || 'Gazdaság'}
                    </span>
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-primary transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-2 mb-6 flex-grow leading-relaxed">
                      {prod.description || 'Nincs leírás megadva.'}
                    </p>
                    <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-auto">
                      <span className="font-extrabold text-primary text-xl">
                        {Math.round(prod.price)} Ft <span className="text-xs font-semibold text-white/40">/ {prod.unit}</span>
                      </span>
                      <Link href={`/producers/${prod.producer_id}`} className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-white hover:text-white hover:bg-white/[0.08]"}>
                        Gazda lapja
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-white/[0.08] rounded-2xl bg-white/[0.01]">
              <p className="text-white/60 text-lg">Jelenleg nincsenek feltöltött termékek az adatbázisban.</p>
              <p className="text-sm text-white/40 mt-1">Lépj be termelőként és töltsd fel az első kínálatodat!</p>
            </div>
          )}
        </div>
      </section>

      {/* Blog module teaser */}
      <section className="py-24 bg-white/[0.01] border-t border-white/[0.04] px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Hasznos Tanácsok & Hírek</h2>
            <Link href="/blog" className={buttonVariants({ variant: "ghost" }) + " gap-2 text-white hover:text-white hover:bg-white/[0.05]"}>
              Összes cikk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts && blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <div key={post.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full hover:border-white/10 transition-all">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-xs text-white/45">
                        {new Date(post.created_at).toLocaleDateString('hu-HU')}
                      </span>
                      {post.is_sponsored && (
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full">
                          Szponzorált
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-white mb-3 hover:text-primary transition-colors">
                      <Link href={`/blog#post-${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-3 mb-5 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                  <Link href={`/blog#post-${post.id}`} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                    Olvasás folytatása &rarr;
                  </Link>
                </div>
              ))
            ) : (
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
                <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full hover:border-white/10 transition-all">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-xs text-white/45">{post.date}</span>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-3 hover:text-primary transition-colors">
                      <Link href="/blog">{post.title}</Link>
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-3 mb-5 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                  <Link href="/blog" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
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
