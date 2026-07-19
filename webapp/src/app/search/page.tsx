import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import SearchForm from './SearchForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DynamicMap, { type MapMarker } from '@/components/DynamicMap'
import { Carrot, MapPin, Store, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

// Dynamic map wrapper is imported directly now

export const metadata = {
  title: 'Keresés - HelyiKamra',
  description: 'Keress hazai termelőket és piacokat a közeledben térképes felületünk segítségével.',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string
    distance?: string
    category?: string
    lat?: string
    lng?: string
  }>
}) {
  const resolvedParams = await searchParams
  const query = resolvedParams.query || ''
  const distance = parseFloat(resolvedParams.distance || '25')
  const categoryId = resolvedParams.category || ''
  const lat = parseFloat(resolvedParams.lat || '47.4979')
  const lng = parseFloat(resolvedParams.lng || '19.0402')

  const supabase = await createClient()

  // Fetch all categories for the filter
  const { data: categories = [] } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Fetch central markets from view
  const { data: markets = [] } = await supabase
    .from('markets_view')
    .select('id, name, address, schedule, latitude, longitude')

  // Let's call the search_producers RPC
  const { data: producers = [], error } = await supabase.rpc('search_producers', {
    p_lat: lat,
    p_lng: lng,
    p_max_distance_km: distance,
    p_category_id: categoryId || null,
    p_query_text: query || null
  })

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const extractCity = (address: string) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts.length > 1 && !parts[0].match(/\d{4}/) && parts[1].match(/\d{4}/) ? parts[1].trim() : parts[0].trim();
  }

  // Format markers for Map
  const producerMarkers: MapMarker[] = (producers || []).map((prod: any) => ({
    id: prod.producer_id,
    name: prod.farm_name,
    lat: prod.latitude,
    lng: prod.longitude,
    type: 'producer',
    address: isAuthenticated ? prod.address : `${extractCity(prod.address)} (Pontos cím bejelentkezés után)`,
    radius_km: prod.radius_km || 0,
    info: `${prod.distance_km.toFixed(1)} km-re tőled`,
  }))

  // Format markets for Map
  const marketMarkers: MapMarker[] = (markets || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    lat: m.latitude,
    lng: m.longitude,
    type: 'market',
    address: m.address,
    info: `Piac nyitvatartás: ${m.schedule}`,
  }))

  // Center helper marker
  const centerMarker: MapMarker = {
    id: 'search-center',
    name: 'Te itt vagy',
    lat: lat,
    lng: lng,
    type: 'center',
    info: 'Keresés középpontja',
  }

  const allMarkers = [centerMarker, ...producerMarkers, ...marketMarkers]

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-7xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Közeli Kistermelők & Piacok</h1>
        <p className="text-white/50 mt-2 text-base">Használd a térképet vagy a listát a friss helyi termékek megtalálásához.</p>
      </div>

      <SearchForm categories={categories || []} />

      {/* Responsive View layout: list + map */}
      <Tabs defaultValue="split" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8 sm:hidden bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl">
          <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">Lista</TabsTrigger>
          <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">Térkép</TabsTrigger>
          <TabsTrigger value="split" className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">Mindkettő</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List side */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <TabsContent value="list" className="mt-0 block sm:block sm:data-[state=inactive]:block">
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-white/[0.06] scrollbar-track-transparent">
                <h3 className="font-extrabold text-lg text-white hidden sm:block mb-2">Találatok ({producers.length})</h3>
                
                {producers.length > 0 ? (
                  producers.map((prod: any) => (
                    <Card key={prod.producer_id} className="glass-card hover:border-white/15 transition-all duration-300 shadow-xl group">
                      <CardHeader className="p-5 pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                            <Link href={`/producers/${prod.producer_id}`} className="hover:text-primary transition-colors">
                              {prod.farm_name}
                            </Link>
                          </CardTitle>
                          <Badge className="bg-white/[0.04] text-primary border border-white/[0.06] rounded-lg text-xs font-bold py-1 px-2.5 whitespace-nowrap shrink-0">
                            {prod.distance_km.toFixed(1)} km
                          </Badge>
                        </div>
                        <CardDescription className="text-xs flex flex-col gap-1.5 mt-2 text-white/50">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary shrink-0" /> 
                            {isAuthenticated ? prod.address : extractCity(prod.address)}
                          </span>
                          {!isAuthenticated && (
                            <span className="text-[10px] text-white/40 italic ml-6 bg-white/[0.02] border border-white/[0.04] py-0.5 px-2 rounded-md w-fit">
                              Pontos cím és kapcsolatfelvétel bejelentkezés után
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 pt-0">
                        <p className="text-sm text-white/60 line-clamp-2 italic mb-4 leading-relaxed bg-white/[0.01] p-3 rounded-xl border border-white/[0.03]">
                          {prod.bio || 'Nincs leírás megadva.'}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs">
                          <span className="font-bold text-primary">
                            {prod.matching_products_count} aktív termék
                          </span>
                          
                          <div className="flex gap-2">
                            <Link 
                              href={`/producers/${prod.producer_id}`} 
                              className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' h-9 rounded-lg border-white/10 text-white hover:bg-white/[0.08] hover:text-white'}
                            >
                              Profil
                            </Link>
                            <Link 
                              href={`/producers/${prod.producer_id}#kapcsolat`} 
                              className={buttonVariants({ size: 'sm' }) + ' h-9 gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg border-0 font-bold hover:opacity-95'}
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Üzenet
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="glass-card p-12 text-center border-dashed border-white/[0.08]">
                    <Carrot className="h-16 w-16 text-primary/10 mx-auto mb-4" />
                    <p className="font-bold text-lg text-white">Nincs találat ebben a körzetben.</p>
                    <p className="text-sm text-white/45 mt-2 max-w-xs mx-auto leading-relaxed">Próbálj meg nagyobb hatósugarat választani, vagy írj be más keresőszót.</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </div>

          {/* Map side */}
          <div className="lg:col-span-7 h-[500px] lg:h-[600px] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl relative z-10">
            <TabsContent value="map" className="mt-0 h-full block sm:block sm:data-[state=inactive]:block">
              <DynamicMap 
                center={[lat, lng]} 
                zoom={11} 
                markers={allMarkers} 
                selectedRadiusKm={distance}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
