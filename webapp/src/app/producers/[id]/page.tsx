import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContactForm from './ContactForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Mail, Store, AlertCircle, ShoppingBag, Carrot } from 'lucide-react'
import { MapMarker } from '@/components/Map'
import DynamicMap from '@/components/DynamicMap'

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

  // Check permissions of current user
  let isAdmin = false
  if (user) {
    const { data: viewerProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    isAdmin = !!viewerProfile?.is_admin
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
  const extractCity = (address: string) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts.length > 1 && !parts[0].match(/\d{4}/) && parts[1].match(/\d{4}/) ? parts[1].trim() : parts[0].trim();
  }

  const isAuthenticated = !!user;
  const showPhone = isAuthenticated && (profile.producer_profiles.is_phone_public || isOwner || isAdmin);

  const markers: MapMarker[] = (locations || []).map((loc: any) => ({
    id: loc.id,
    name: loc.location_type === 'farm' ? 'Tanya / Telephely' : 'Átvételi pont / Piac',
    lat: loc.latitude,
    lng: loc.longitude,
    type: 'producer',
    address: isAuthenticated ? loc.address : `${extractCity(loc.address)} (Pontos cím bejelentkezés után)`,
    radius_km: loc.radius_km,
    info: loc.delivery_text || undefined,
  }))

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-7xl relative">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Alert if not approved yet */}
      {!profile.is_approved_by_admin && (
        <div className="mb-8 p-4 border border-amber-500/20 bg-amber-500/10 rounded-2xl flex gap-3 text-amber-300 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Ez a profil jóváhagyásra vár az adminisztrátor által. Jelenleg csak Ön látja.</span>
        </div>
      )}

      {/* Producer header info */}
      <div className="glass-card p-6 md:p-10 rounded-3xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.04] text-primary border border-white/[0.08] w-fit">
            <Store className="h-3.5 w-3.5" /> Kistermelő
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {profile.producer_profiles.farm_name}
          </h1>
          <p className="text-white/60 text-sm max-w-xl leading-relaxed">
            {profile.producer_profiles.bio || 'Nincs bemutatkozás megadva.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2 bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl text-xs text-white/50 w-full sm:w-auto shrink-0">
              <span className="font-bold text-white mb-1">Elérhetőségek</span>
              {showPhone ? (
                <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary" /> {profile.producer_profiles.phone}</span>
              ) : (
                <span className="flex items-center gap-2 italic"><Phone className="h-3.5 w-3.5 text-white/30" /> Nem publikus</span>
              )}
              <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> {profile.email}</span>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl text-xs text-white/40 text-center w-full sm:w-auto">
              Kattints a kapcsolatfelvételre az elérhetőségek megtekintéséhez.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Products */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Termékek Kínálata
          </h2>

          {products && products.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {products.map((prod) => (
                <Card key={prod.id} className="glass-card glass-card-hover flex flex-col justify-between overflow-hidden rounded-2xl">
                  <div className="h-44 bg-white/[0.01] flex items-center justify-center relative border-b border-white/[0.04]">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="object-cover w-full h-full" />
                    ) : (
                      <Carrot className="h-14 w-14 text-primary/10" />
                    )}
                    {prod.categories && (
                      <Badge className="absolute top-3 left-3 text-[10px] font-bold bg-white/[0.05] border border-white/[0.08] text-primary" variant="secondary">
                        {prod.categories.name}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-lg font-bold text-white">{prod.name}</CardTitle>
                    <CardDescription className="text-sm text-white/50 line-clamp-2 mt-1 leading-relaxed">
                      {prod.description || 'Nincs leírás.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 border-t border-white/[0.04] mt-4 flex items-center justify-between text-sm">
                    <span className="font-extrabold text-primary text-lg">
                      {Math.round(prod.price)} Ft <span className="text-xs font-semibold text-white/40">/ {prod.unit}</span>
                    </span>
                    {prod.tags && (
                      <span className="text-[10px] text-white/60 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                        {prod.tags.split(',')[0]}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card p-12 text-center border-dashed border-white/[0.08]">
              <Carrot className="h-16 w-16 text-primary/10 mx-auto mb-4" />
              <p className="font-bold text-white text-lg">Jelenleg nincs aktív termék feltöltve.</p>
            </Card>
          )}
        </div>

        {/* Side Details Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Location Map */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              Helyszínek & Átvétel
            </h2>
            <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-white/[0.08] shadow-inner relative z-10">
              {locations && locations.length > 0 ? (
                <DynamicMap 
                  center={[locations[0].latitude, locations[0].longitude]} 
                  zoom={12} 
                  markers={markers} 
                  interactive={false} 
                />
              ) : (
                <div className="h-full w-full bg-white/[0.02] flex items-center justify-center text-sm text-white/40 text-center p-6 border border-white/[0.08] rounded-2xl">
                  Nincs telephely vagy átvételi hely megadva.
                </div>
              )}
            </div>

            {/* Location Address Details */}
            {locations && locations.length > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                {locations.map((loc: any) => (
                  <div key={loc.id} className="text-sm border-l-2 border-primary pl-4 py-1.5 flex flex-col gap-1.5">
                    <div className="font-bold flex items-center gap-2 text-white/90">
                      <Store className="h-4 w-4 text-primary" />
                      {loc.location_type === 'farm' ? 'Gazdaság / Tanya' : 'Kiszállítási Pont'} 
                      {loc.radius_km > 0 && ` (${loc.radius_km} km körzetben)`}
                    </div>
                    <div className="text-white/60">
                      {isAuthenticated ? loc.address : `${extractCity(loc.address)} (Pontos cím bejelentkezés után)`}
                    </div>
                    {loc.schedule_info && <div className="text-white/40 text-xs italic">{loc.schedule_info}</div>}
                    {loc.delivery_text && <div className="text-white/40 text-xs">{loc.delivery_text}</div>}
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
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  )
}
