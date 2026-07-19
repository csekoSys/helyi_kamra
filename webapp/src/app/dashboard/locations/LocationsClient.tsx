'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { addLocation, deleteLocation } from '@/app/actions/locations'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Plus, MapPin, Trash2, Home, Store, Truck } from 'lucide-react'
import { MapMarker } from '@/components/Map'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <Card className="w-full h-[350px] flex items-center justify-center bg-muted">
      <p className="text-muted-foreground animate-pulse">Térkép betöltése...</p>
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
  const [open, setOpen] = useState(false)
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
    // Only update if manually placing coordinate
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
      // Focus map to market
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
    setOpen(true)
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
        setOpen(false)
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading">Helyszíneim & Elérhetőség</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Állítsd be a telephelyed és add meg, hol vagy elérhető a vásárlók számára.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger onClick={handleOpenAdd} className={buttonVariants() + " font-semibold gap-1.5 shadow-sm text-sm cursor-pointer"}>
            <Plus className="h-4 w-4" /> Új helyszín hozzáadása
          </DialogTrigger>
          <DialogContent className="max-w-xl border-border">
            <DialogHeader>
              <DialogTitle className="font-bold">Helyszín hozzáadása</DialogTitle>
              <DialogDescription>
                Add meg a címet vagy koordinátákat, illetve csatlakozhatsz meglévő piachoz is.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              {error && (
                <div className="p-3 text-xs font-semibold bg-destructive/10 text-destructive rounded-lg">
                  {error}
                </div>
              )}

              {/* Location Type */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loc-type">Helyszín típusa</Label>
                <Select value={locationType} onValueChange={(val) => {
                  setLocationType(val || 'farm')
                  // Reset market select if switching from market
                  if (val !== 'market') handleMarketChange('none')
                }}>
                  <SelectTrigger id="loc-type">
                    <SelectValue placeholder="Típus kiválasztása..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farm">Saját Gazdaság / Tanya (Fix helyszín)</SelectItem>
                    <SelectItem value="market">Csatlakozás meglévő piachoz</SelectItem>
                    <SelectItem value="delivery_point">Átvételi / Kiszállítási pont</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Market selection (if type is market) */}
              {locationType === 'market' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="market-select">Válassz piacot a listából</Label>
                  <Select value={selectedMarketId} onValueChange={(val) => handleMarketChange(val || 'none')}>
                    <SelectTrigger id="market-select">
                      <SelectValue placeholder="Piacok listája..." />
                    </SelectTrigger>
                    <SelectContent>
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="address">Pontos cím</Label>
                <Input
                  id="address"
                  placeholder="pl. 6720 Szeged, Oskola utca 5."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={selectedMarketId !== 'none'}
                  required
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lat">Szélesség (GPS Lat)</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    disabled={selectedMarketId !== 'none'}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lng">Hosszúság (GPS Lng)</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    disabled={selectedMarketId !== 'none'}
                    required
                  />
                </div>
              </div>

              {/* Helper map */}
              <div className="h-[200px] w-full border rounded-lg overflow-hidden">
                <Map
                  center={center}
                  zoom={zoom}
                  markers={latitude && longitude ? [{ id: 'picker', name: 'Kijelölt hely', lat: latitude, lng: longitude, type: 'center' }] : []}
                  onPositionSelect={handleMapClick}
                />
                <span className="text-[10px] text-muted-foreground block p-1 bg-muted/30">
                  {selectedMarketId === 'none' 
                    ? 'Kattints a térképre a pontos koordináták beállításához!' 
                    : 'A koordináták a kiválasztott piachoz vannak rögzítve.'}
                </span>
              </div>

              {/* Radius (For delivery points) */}
              {locationType === 'delivery_point' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="radius">Kiszállítási hatósugár (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    placeholder="pl. 15 (0 ha csak egy fix pont)"
                  />
                </div>
              )}

              {/* Schedule and delivery info */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="schedule">Nyitvatartás / Átvételi idősáv</Label>
                <Input
                  id="schedule"
                  placeholder="pl. Szombat reggel 8-12, vagy egyedi egyeztetéssel"
                  value={scheduleInfo}
                  onChange={(e) => setScheduleInfo(e.target.value)}
                  disabled={selectedMarketId !== 'none'}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="delivery-text">Átvételi megjegyzés</Label>
                <Input
                  id="delivery-text"
                  placeholder="pl. A piac 3-as asztalánál, vagy tanya kapucsengő..."
                  value={deliveryText}
                  onChange={(e) => setDeliveryText(e.target.value)}
                />
              </div>

              <DialogFooter className="border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
                <Button type="submit" disabled={loading} className="font-semibold">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Mentés
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main View: Split Map + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <h3 className="font-bold text-lg">Regisztrált helyszíneid ({locations.length})</h3>

          {locations.length > 0 ? (
            <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Típus</TableHead>
                    <TableHead>Cím</TableHead>
                    <TableHead className="text-right">Törlés</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-semibold flex items-center gap-1.5 text-xs text-foreground">
                        {loc.location_type === 'farm' && <Home className="h-4 w-4 text-primary" />}
                        {loc.location_type === 'market' && <Store className="h-4 w-4 text-primary" />}
                        {loc.location_type === 'delivery_point' && <Truck className="h-4 w-4 text-primary" />}
                        {loc.location_type === 'farm' ? 'Gazdaság' : loc.location_type === 'market' ? 'Piac' : 'Átvétel'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground leading-relaxed max-w-[200px] truncate">
                        {loc.address}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(loc.id)}
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
            <Card className="p-8 text-center border-dashed">
              <MapPin className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Még nincs rögzített helyszíned.</p>
            </Card>
          )}
        </div>

        {/* Map visualization of current locations */}
        <div className="lg:col-span-6 h-[400px]">
          <Map
            center={locations.length > 0 ? [locations[0].latitude, locations[0].longitude] : center}
            zoom={locations.length > 0 ? 12 : 9}
            markers={mapMarkers}
          />
        </div>
      </div>
    </div>
  )
}
