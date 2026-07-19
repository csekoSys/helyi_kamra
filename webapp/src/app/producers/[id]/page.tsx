import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContactForm from './ContactForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Mail, Store, AlertCircle, ShoppingBag, Carrot } from 'lucide-react'
import { MapMarker } from '@/components/Map'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <Card className="w-full h-[300px] flex items-center justify-center bg-muted">
      <p className="text-muted-foreground animate-pulse">Térkép betöltése...</p>
    </Card>
  ),
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('producer_profiles')
    .select('farm_name')
    .eq('id', resolvedParams.id)
    .single()

  return {
    title: profile ? `${profile.farm_name} - HelyiKamra` : 'Termelői Adatlap - HelyiKamra',
  }
}

export default async function ProducerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = resolvedParams.id

  // Fetch producer profiles and main profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, producer_profiles(*)')
    .eq('id', id)
    .single()

  if (error || !profile || !profile.producer_profiles) {
    notFound()
  }

  // Check role of current user
  let userRole: string | null = null
  let isAdmin = false
  if (user) {
    const { data: viewerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    userRole = viewerProfile?.role || null
    isAdmin = userRole === 'admin'
  }

  const isOwner = user?.id === id

  // If not approved and not owner/admin, restrict access
  if (!profile.is_approved_by_admin && !isOwner && !isAdmin) {
    notFound()
  }

  // Fetch products
  const { data: products = [] } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('producer_id', id)
    .eq('is_active', true)
    .order('name')

  // Fetch locations using the coordinates view
  const { data: locations = [] } = await supabase
    .from('producer_locations_view')
    .select('*')
    .eq('producer_id', id)

  // Map markers for Leaflet map
  const markers: MapMarker[] = (locations || []).map((loc: any) => ({
    id: loc.id,
    name: loc.location_type === 'farm' ? 'Tanya / Telephely' : 'Átvételi pont / Piac',
    lat: loc.latitude,
    lng: loc.longitude,
    type: 'producer',
    address: loc.address,
    radius_km: loc.radius_km,
    info: loc.delivery_text || undefined,
  }))

  const showPhone = profile.producer_profiles.is_phone_public || isOwner || isAdmin

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
      {/* Alert if not approved yet */}
      {!profile.is_approved_by_admin && (
        <div className="mb-6 p-4 border border-amber-300 bg-amber-50 rounded-xl flex gap-3 text-amber-800 text-sm font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            Ez a profil még jóváhagyásra vár az adminisztrátorok részéről. Nyilvánosan még nem kereshető.
          </div>
        </div>
      )}

      {/* Hero card */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start justify-between mb-8">
        <div className="flex-1 flex flex-col gap-3">
          <span className="text-xs font-bold text-primary tracking-wider uppercase">Kistermelő</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading">
            {profile.producer_profiles.farm_name}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">
            {profile.producer_profiles.bio || 'Még nincs bemutatkozás megadva.'}
          </p>

          <div className="flex flex-wrap gap-4 mt-2 text-xs font-medium text-muted-foreground">
            {showPhone && profile.producer_profiles.phone && (
              <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full">
                <Phone className="h-3.5 w-3.5 text-primary" /> {profile.producer_profiles.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full">
              <ShoppingBag className="h-3.5 w-3.5 text-primary" /> {products?.length || 0} aktív termék
            </span>
          </div>
        </div>

        {isOwner && (
          <Badge variant="outline" className="text-primary border-primary bg-primary/5 self-start">
            Saját Adatlap
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Carrot className="h-5 w-5 text-primary" />
              Kínálatunk
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Friss és elérhető termékek listája</p>
          </div>

          {products && products.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((prod) => (
                <Card key={prod.id} className="shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="h-40 bg-muted flex items-center justify-center relative">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="object-cover w-full h-full" />
                    ) : (
                      <Carrot className="h-12 w-12 text-primary/10" />
                    )}
                    {prod.categories && (
                      <Badge className="absolute top-2 left-2 text-[10px]" variant="secondary">
                        {prod.categories.name}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-bold">{prod.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {prod.description || 'Nincs leírás.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 border-t border-border mt-3 flex items-center justify-between text-sm">
                    <span className="font-extrabold text-primary text-base">
                      {Math.round(prod.price)} Ft <span className="text-xs font-normal text-muted-foreground">/ {prod.unit}</span>
                    </span>
                    {prod.tags && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-semibold">
                        {prod.tags.split(',')[0]}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Carrot className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="font-semibold text-muted-foreground">Jelenleg nincs aktív termék feltöltve.</p>
            </Card>
          )}
        </div>

        {/* Side Details Column */}
        <div className="flex flex-col gap-8">
          {/* Location Map */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Helyszínek & Átvétel
            </h2>
            <div className="h-[250px] w-full rounded-xl overflow-hidden shadow-inner">
              {locations && locations.length > 0 ? (
                <Map 
                  center={[locations[0].latitude, locations[0].longitude]} 
                  zoom={12} 
                  markers={markers} 
                  interactive={false} 
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground text-center p-4">
                  Nincs telephely vagy átvételi hely megadva.
                </div>
              )}
            </div>

            {/* Location Address Details */}
            {locations && locations.length > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                {locations.map((loc: any) => (
                  <div key={loc.id} className="text-xs border-l-2 border-primary pl-3 py-1 flex flex-col gap-1">
                    <div className="font-semibold flex items-center gap-1">
                      <Store className="h-3.5 w-3.5 text-primary" />
                      {loc.location_type === 'farm' ? 'Gazdaság / Tanya' : 'Kiszállítási Pont'} 
                      {loc.radius_km > 0 && ` (${loc.radius_km} km körzetben)`}
                    </div>
                    <div className="text-foreground">{loc.address}</div>
                    {loc.schedule_info && <div className="text-muted-foreground italic">{loc.schedule_info}</div>}
                    {loc.delivery_text && <div className="text-muted-foreground">{loc.delivery_text}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact form container */}
          <ContactForm 
            producerId={id} 
            farmName={profile.producer_profiles.farm_name} 
            isAuthenticated={!!user}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  )
}
