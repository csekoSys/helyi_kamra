import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import SearchForm from './SearchForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapMarker } from '@/components/Map'
import { Carrot, MapPin, Store, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

// Dynamically import Leaflet Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <Card className="w-full h-[500px] flex items-center justify-center bg-muted">
      <p className="text-muted-foreground animate-pulse">Térkép betöltése...</p>
    </Card>
  ),
})

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

  // Format markers for Map
  const producerMarkers: MapMarker[] = (producers || []).map((prod: any) => ({
    id: prod.producer_id,
    name: prod.farm_name,
    lat: prod.latitude,
    lng: prod.longitude,
    type: 'producer',
    address: prod.address,
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
    <div className="container mx-auto px-4 md:px-6 py-6 max-w-7xl flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-heading">Közeli Kistermelők & Piacok</h1>
        <p className="text-muted-foreground mt-1">Használd a térképet vagy a listát a friss helyi termékek megtalálásához.</p>
      </div>

      <SearchForm categories={categories || []} />

      {/* Responsive View layout: list + map */}
      <Tabs defaultValue="split" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6 sm:hidden">
          <TabsTrigger value="list">Lista nézet</TabsTrigger>
          <TabsTrigger value="map">Térkép nézet</TabsTrigger>
          <TabsTrigger value="split">Mindkettő</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List side */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <TabsContent value="list" className="mt-0 block sm:block sm:data-[state=inactive]:block">
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                <h3 className="font-bold text-lg hidden sm:block">Találatok ({producers.length})</h3>
                
                {producers.length > 0 ? (
                  producers.map((prod: any) => (
                    <Card key={prod.producer_id} className="hover:border-primary/50 transition-colors shadow-sm">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg font-bold text-foreground">
                            <Link href={`/producers/${prod.producer_id}`} className="hover:text-primary transition-colors">
                              {prod.farm_name}
                            </Link>
                          </CardTitle>
                          <Badge variant="secondary" className="whitespace-nowrap shrink-0">
                            {prod.distance_km.toFixed(1)} km
                          </Badge>
                        </div>
                        <CardDescription className="text-xs flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {prod.address}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2 italic mb-3">
                          {prod.bio || 'Nincs leírás megadva.'}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                          <span className="font-semibold text-primary">
                            {prod.matching_products_count} aktív termék
                          </span>
                          
                          <div className="flex gap-2">
                            <Link 
                              href={`/producers/${prod.producer_id}`} 
                              className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' h-8'}
                            >
                              Profil
                            </Link>
                            <Link 
                              href={`/producers/${prod.producer_id}#kapcsolat`} 
                              className={buttonVariants({ size: 'sm' }) + ' h-8 gap-1'}
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Üzenet
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center border-dashed">
                    <Carrot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-semibold">Nincs találat ebben a körzetben.</p>
                    <p className="text-sm text-muted-foreground mt-1">Próbálj meg nagyobb hatósugarat választani, vagy írj be más keresőszót.</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </div>

          {/* Map side */}
          <div className="lg:col-span-7 h-[500px] lg:h-[600px]">
            <TabsContent value="map" className="mt-0 h-full block sm:block sm:data-[state=inactive]:block">
              <Map 
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
