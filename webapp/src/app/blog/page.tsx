import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, Star } from 'lucide-react'

export const metadata = {
  title: 'Blog & PR Cikkek - HelyiKamra',
  description: 'Olvasd el legfrissebb bejegyzéseinket a fenntartható gazdálkodásról és a helyi kistermelőkről.',
}

export default async function BlogPage() {
  const supabase = await createClient()

  // Fetch blog posts from DB
  const { data: posts = [] } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl flex flex-col gap-8">
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
          <BookOpen className="h-3.5 w-3.5" /> HelyiKamra Tudástár
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-heading">
          Hírek, Tippek & Érdekességek
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Tudj meg többet a tudatos vásárlásról, a szezonális zöldségekről és a hazai kistermelők mindennapjairól.
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              id={`post-${post.id}`}
              className={`transition-all scroll-mt-20 ${
                post.is_sponsored
                  ? 'border-accent bg-accent/5 shadow-md relative overflow-hidden'
                  : 'shadow-sm border-border'
              }`}
            >
              {post.is_sponsored && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent-foreground" /> Szponzorált PR cikk
                </div>
              )}
              
              <CardHeader className="p-6 md:p-8 pb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(post.created_at).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <CardTitle className="text-xl md:text-2xl font-extrabold text-foreground hover:text-primary transition-colors leading-tight">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Fallback mockup posts if blog is empty
        <div className="flex flex-col gap-6">
          {[
            {
              title: 'Hogyan válaszd ki a legfrissebb zöldséget a piacon?',
              content: `A szezonalitás a legfontosabb tényező a friss termékek kiválasztásakor. Amikor a piacon jársz, az alábbi szempontokra érdemes odafigyelni:
              
1. Illat: A valódi, vegyszermentesen vagy természetes körülmények között nevelt zöldségeknek és gyümölcsöknek jellegzetes, intenzív illatuk van. Ha teljesen szagtalan, valószínűleg túl korán szüretelték.
2. Állag: A friss zöldség feszes és roppanós. Különösen a salátafélék, a répa és a retek esetében kerüld a kissé fonnyadt árukat.
3. Levelek állapota: Sok zöldséget (pl. répa, retek, karfiol) a leveleivel együtt árulnak. Ha a levelek frissek és zöldek, az áru is szinte biztosan friss.
4. Szín: Keresd az egyenletes, természetes színeket. A természetellenesen egyforma méretű és színű darabok gyakran nagyüzemi, külföldi importból származnak.

Ha közvetlenül helyi termelőtől vásárolsz, sokkal nagyobb eséllyel kapsz olyat, amit akár aznap reggel szedtek le a kertben!`,
              is_sponsored: false,
              created_at: '2026-07-15T12:00:00Z',
            },
            {
              title: 'A helyi vásárlás ökológiai előnyei: Miért jobb a környezetnek?',
              content: `A globalizált élelmiszeriparban megszokottá vált, hogy télen epret, nyáron pedig egzotikus gyümölcsöket fogyasztunk. Ennek azonban óriási ára van a környezetünkre nézve:

- Szállítási távolság: Egy átlagos szupermarketben kapható élelmiszer több ezer kilométert utazik, mire a tányérodra kerül. Ezzel szemben a helyi kistermelő termékei legfeljebb 20-50 kilométert utaznak.
- Csomagolás: Az import árukat a hosszú utazás és a tartósítás miatt rengeteg műanyagba és kartonba kell csomagolni. A helyi piacokon szinte teljesen kiküszöbölhető a felesleges csomagolóanyag.
- Kevesebb élelmiszer-pazarlás: Mivel a helyi árut nem kell napokig raktározni és szállítani, lényegesen kisebb a romlási arány.

Vásárolj tudatosan, támogasd a helyi gazdaságot és csökkentsd az ökológiai lábnyomod a HelyiKamra segítségével!`,
              is_sponsored: false,
              created_at: '2026-07-10T10:00:00Z',
            },
            {
              title: 'Kóstold meg a hazai mézeket - Különleges fajtamézek a HelyiKamrán',
              content: `A magyar méz világhírű, és nem véletlenül! A klíma és a gazdag növényvilág kiváló feltételeket biztosít a méhészkedéshez. Az akácmézen és a vegyes virágmézen túl számos izgalmas fajtamézzel találkozhatsz a helyi méhészeknél:

- Repceméz: Az egyik legkevésbé savas méz, magas vastartalommal. Különlegessége, hogy nagyon gyorsan és finom krémesre kristályosodik.
- Hársmez: Rendkívül aromás, karakteres ízű méz. Kiváló görcsoldó és idegnyugtató hatású, megfázás esetén pedig az egyik legjobb természetes orvosság.
- Napraforgóméz: Aranybarna színű, kellemesen savanykás ízű méz. Sütéshez kiváló, mivel intenzív aromát kölcsönöz a tésztáknak.

Keresd a térképen a hozzád legközelebbi méhészt és kóstold meg az igazi, tiszta magyar mézet!`,
              is_sponsored: true,
              created_at: '2026-07-05T08:00:00Z',
            }
          ].map((post, idx) => (
            <Card
              key={idx}
              className={`transition-all ${
                post.is_sponsored
                  ? 'border-accent bg-accent/5 shadow-md relative overflow-hidden'
                  : 'shadow-sm border-border'
              }`}
            >
              {post.is_sponsored && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent-foreground" /> Szponzorált PR cikk
                </div>
              )}
              
              <CardHeader className="p-6 md:p-8 pb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{post.created_at.substring(0, 10)}</span>
                </div>
                <CardTitle className="text-xl md:text-2xl font-extrabold text-foreground hover:text-primary transition-colors leading-tight">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
