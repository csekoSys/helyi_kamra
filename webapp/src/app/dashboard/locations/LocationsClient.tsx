'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { addLocation, deleteLocation } from '@/app/actions/locations'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, MapPin, Trash2, Home, Store, Truck, Plus } from 'lucide-react'
import { MapMarker } from '@/components/Map'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <Card className="w-full h-[350px] flex items-center justify-center bg-white/[0.01] border-white/[0.08]">
      <p className="text-white/40 animate-pulse text-sm">Térkép betöltése...</p>
    </Card>
  ),
})

interface Market {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  schedule: string
}

interface Location {
  id: string
  location_type: string
  address: string
  latitude: number
  longitude: number
  radius_km: number
  delivery_text: string | null
  schedule_info: string | null
}

interface LocationsClientProps {
  locations: Location[]
  markets: Market[]
}

export default function LocationsClient({ locations, markets }: LocationsClientProps) {
  const [loading, setLoading] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Map settings
  const [center, setCenter] = useState<[number, number]>([47.4979, 19.0402])
  const [zoom, setZoom] = useState(11)

  // Form states
  const [locationType, setLocationType] = useState('farm')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState(47.4979)
  const [longitude, setLongitude] = useState(19.0402)
  const [radiusKm, setRadiusKm] = useState('0')
  const [deliveryText, setDeliveryText] = useState('')
  const [scheduleInfo, setScheduleInfo] = useState('')
  const [selectedMarketId, setSelectedMarketId] = useState('none')

  // Map markers to display current locations
  const mapMarkers: MapMarker[] = locations.map((loc) => ({
    id: loc.id,
    name: loc.location_type === 'farm' ? 'Saját Gazdaság' : 'Átvételi Pont',
    lat: loc.latitude,
    lng: loc.longitude,
    type: 'producer',
    address: loc.address,
    radius_km: loc.radius_km,
    info: loc.schedule_info || undefined,
  }))

  // Form helper: click on map updates coordinates
  const handleMapClick = (lat: number, lng: number) => {
    if (selectedMarketId === 'none') {
      setLatitude(parseFloat(lat.toFixed(6)))
      setLongitude(parseFloat(lng.toFixed(6)))
    }
  }

  // Handle market selection
  const handleMarketChange = (marketId: string) => {
    setSelectedMarketId(marketId)
    if (marketId === 'none') {
      setAddress('')
      return
    }

    const market = markets.find((m) => m.id === marketId)
    if (market) {
      setAddress(market.name + ' - ' + market.address)
      setLatitude(market.latitude)
      setLongitude(market.longitude)
      setScheduleInfo(market.schedule)
      setCenter([market.latitude, market.longitude])
      setZoom(14)
    }
  }

  const handleOpenAdd = () => {
    setLocationType('farm')
    setAddress('')
    setLatitude(47.4979)
    setLongitude(19.0402)
    setRadiusKm('0')
    setDeliveryText('')
    setScheduleInfo('')
    setSelectedMarketId('none')
    setError(null)
    setIsFormVisible(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !latitude || !longitude) return

    setLoading(true)
    setError(null)

    try {
      const res = await addLocation(null, {
        location_type: locationType,
        address,
        latitude,
        longitude,
        radius_km: parseFloat(radiusKm),
        delivery_text: deliveryText || undefined,
        schedule_info: scheduleInfo || undefined,
      })

      if (res.error) {
        setError(res.error)
      } else {
        setIsFormVisible(false)
      }
    } catch (err) {
      setError('Hiba történt a mentés során.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a helyszínt?')) return

    try {
      const res = await deleteLocation(id)
      if (res.error) {
        alert(res.error)
      }
    } catch (err) {
      alert('Sikertelen törlés.')
    }
  }

  return (
    <div className="flex flex-col gap-8 relative max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white leading-tight">Helyszíneim</h1>
          <p className="text-white/50 text-sm mt-1">Itt adhatod hozzá a telephelyeidet és piacaidat.</p>
        </div>
        {!isFormVisible && (
          <Button onClick={handleOpenAdd} className="h-12 px-6 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg cursor-pointer">
            <Plus className="h-5 w-5 mr-2" /> Új helyszín hozzáadása
          </Button>
        )}
      </div>

      {isFormVisible && (
        <Card className="glass-card shadow-2xl border-white/[0.08] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="border-b border-white/[0.06] pb-6">
            <CardTitle className="text-xl font-bold text-white">
              Új helyszín hozzáadása
            </CardTitle>
            <CardDescription className="text-white/50">
              Töltsd ki az alábbi adatokat. A koordinátákat a térképre való kattintással vagy piac kiválasztásával is megadhatod.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 text-sm font-semibold bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Type */}
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="loc-type" className="font-bold text-white/80">Helyszín típusa</Label>
                  <Select value={locationType} onValueChange={(val) => {
                    setLocationType(val || 'farm')
                    if (val !== 'market') handleMarketChange('none')
                  }}>
                    <SelectTrigger id="loc-type" className="h-14 rounded-xl border-white/[0.08] bg-white/[0.01] text-white focus:border-primary/50">
                      <SelectValue placeholder="Típus kiválasztása..." />
                    </SelectTrigger>
                    <SelectContent className="border-white/[0.08] bg-card/90 backdrop-blur-xl">
                      <SelectItem value="farm">Saját Gazdaság / Tanya (Fix helyszín)</SelectItem>
                      <SelectItem value="market">Csatlakozás meglévő piachoz</SelectItem>
                      <SelectItem value="delivery_point">Átvételi / Kiszállítási pont</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Market selection (if type is market) */}
                {locationType === 'market' && (
                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="market-select" className="font-bold text-white/80">Válassz piacot a listából</Label>
                    <Select value={selectedMarketId} onValueChange={(val) => handleMarketChange(val || 'none')}>
                      <SelectTrigger id="market-select" className="h-14 rounded-xl border-white/[0.08] bg-white/[0.01] text-white focus:border-primary/50">
                        <SelectValue placeholder="Piacok listája..." />
                      </SelectTrigger>
                      <SelectContent className="border-white/[0.08] bg-card/90 backdrop-blur-xl">
                        <SelectItem value="none">Egyik sem (egyéni cím megadása)</SelectItem>
                        {markets.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} ({m.address})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Address */}
                <div className="md:col-span-2 flex flex-col gap-2.5">
                  <Label htmlFor="address" className="font-bold text-white/80">Pontos cím</Label>
                  <Input
                    id="address"
                    placeholder="pl. 6720 Szeged, Oskola utca 5."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={selectedMarketId !== 'none'}
                    required
                    className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                  />
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="lat" className="font-bold text-white/80">Szélesség (GPS Lat)</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      disabled={selectedMarketId !== 'none'}
                      required
                      className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="lng" className="font-bold text-white/80">Hosszúság (GPS Lng)</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      disabled={selectedMarketId !== 'none'}
                      required
                      className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                    />
                  </div>
                </div>

                {/* Helper map */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <Label className="font-bold text-white/80">Hely kijelölése a térképen</Label>
                  <div className="h-[250px] w-full border border-white/[0.08] rounded-2xl overflow-hidden shadow-inner relative z-10">
                    <Map
                      center={center}
                      zoom={zoom}
                      markers={latitude && longitude ? [{ id: 'picker', name: 'Kijelölt hely', lat: latitude, lng: longitude, type: 'center' }] : []}
                      onPositionSelect={handleMapClick}
                    />
                  </div>
                  <span className="text-[10px] text-white/40 block mt-1">
                    {selectedMarketId === 'none' 
                      ? 'Tipp: Kattints a térképre a pontos koordináták beállításához!' 
                      : 'A koordináták a kiválasztott piachoz vannak rögzítve.'}
                  </span>
                </div>

                {/* Radius (For delivery points) */}
                {locationType === 'delivery_point' && (
                  <div className="flex flex-col gap-2.5 md:col-span-2">
                    <Label htmlFor="radius" className="font-bold text-white/80">Kiszállítási hatósugár (km)</Label>
                    <Input
                      id="radius"
                      type="number"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(e.target.value)}
                      placeholder="pl. 15 (0 ha csak egy fix pont)"
                      className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                    />
                  </div>
                )}

                {/* Schedule and delivery info */}
                <div className="flex flex-col gap-2.5 md:col-span-2">
                  <Label htmlFor="schedule" className="font-bold text-white/80">Nyitvatartás / Átvételi idősáv</Label>
                  <Input
                    id="schedule"
                    placeholder="pl. Szombat reggel 8-12, vagy egyedi egyeztetéssel"
                    value={scheduleInfo}
                    onChange={(e) => setScheduleInfo(e.target.value)}
                    disabled={selectedMarketId !== 'none'}
                    className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-2.5 md:col-span-2">
                  <Label htmlFor="delivery-text" className="font-bold text-white/80">Átvételi megjegyzés</Label>
                  <Input
                    id="delivery-text"
                    placeholder="pl. A piac 3-as asztalánál, vagy tanya kapucsengő..."
                    value={deliveryText}
                    onChange={(e) => setDeliveryText(e.target.value)}
                    className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                  />
                </div>
              </div>

              <CardFooter className="border-t border-white/[0.06] pt-6 px-0 pb-0 gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsFormVisible(false)} className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/[0.08] text-white hover:text-white cursor-pointer">
                  Mégse
                </Button>
                <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border-0 text-white cursor-pointer">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Mentés
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      )}

      {!isFormVisible && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <h3 className="font-extrabold text-xl text-white">Regisztrált helyszíneid ({locations.length})</h3>

            {locations.length > 0 ? (
              <div className="flex flex-col gap-4">
                {locations.map((loc) => (
                  <Card key={loc.id} className="glass-card p-5 border-white/[0.08] hover:border-white/15 transition-all duration-300 shadow-xl">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="font-bold flex items-center gap-2 text-sm text-primary">
                          {loc.location_type === 'farm' && <Home className="h-4 w-4" />}
                          {loc.location_type === 'market' && <Store className="h-4 w-4" />}
                          {loc.location_type === 'delivery_point' && <Truck className="h-4 w-4" />}
                          {loc.location_type === 'farm' ? 'Gazdaság' : loc.location_type === 'market' ? 'Piac' : 'Átvételi pont'}
                        </div>
                        <div className="text-base font-extrabold text-white leading-tight">
                          {loc.address}
                        </div>
                        {loc.schedule_info && (
                          <div className="text-xs text-white/50 italic mt-1">
                            Nyitva: {loc.schedule_info}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(loc.id)}
                        className="h-11 w-11 rounded-lg flex-shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card p-12 text-center border-dashed border-white/[0.08]">
                <MapPin className="h-16 w-16 text-primary/20 mx-auto mb-4" />
                <p className="font-bold text-white text-lg">Még nincs rögzített helyszíned.</p>
                <p className="text-sm text-white/50 mt-2 max-w-xs mx-auto leading-relaxed">Add meg a tanyád koordinátáit vagy csatlakozz piacokhoz a fenti gombbal.</p>
              </Card>
            )}
          </div>

          <div className="lg:col-span-6 h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl relative z-10">
            <Map 
              center={locations.length > 0 ? [locations[0].latitude, locations[0].longitude] : center} 
              zoom={11} 
              markers={mapMarkers} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
