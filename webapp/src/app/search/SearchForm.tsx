'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export default function SearchForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('query') || '')
  const [distance, setDistance] = useState(searchParams.get('distance') || '25')
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || 'all')
  const [lat, setLat] = useState(searchParams.get('lat') || '47.4979')
  const [lng, setLng] = useState(searchParams.get('lng') || '19.0402')
  const [locating, setLocating] = useState(false)

  // Request browser geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('A böngésződ nem támogatja a helymeghatározást.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toString()
        const longitude = position.coords.longitude.toString()
        setLat(latitude)
        setLng(longitude)
        setLocating(false)

        // Perform immediate search with new coordinates
        const params = new URLSearchParams(searchParams)
        params.set('lat', latitude)
        params.set('lng', longitude)
        router.push(`/search?${params.toString()}`)
      },
      (error) => {
        setLocating(false)
        alert('Nem sikerült lekérni a pozíciódat. Alapértelmezett pozíciót használunk.')
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (distance) params.set('distance', distance)
    if (categoryId !== 'all') params.set('category', categoryId)
    params.set('lat', lat)
    params.set('lng', lng)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Category Buttons Grid */}
      <div className="flex flex-col gap-4">
        <Label className="font-extrabold text-lg text-white">Mit keresel ma?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Button
            type="button"
            className={`h-14 rounded-2xl flex items-center justify-center gap-2 border font-bold text-sm transition-all duration-300 cursor-pointer ${
              categoryId === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-[0_0_20px_rgba(52,211,153,0.25)]'
                : 'bg-white/[0.02] border-white/[0.06] text-white/80 hover:text-white hover:bg-white/[0.06] hover:border-white/12'
            }`}
            onClick={() => setCategoryId('all')}
          >
            <span>Minden</span>
          </Button>
          {categories.slice(0, 5).map((cat) => {
            const isSelected = categoryId === cat.id
            return (
              <Button
                key={cat.id}
                type="button"
                className={`h-14 rounded-2xl flex items-center justify-center gap-2 border font-bold text-sm transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-[0_0_20px_rgba(52,211,153,0.25)]'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/80 hover:text-white hover:bg-white/[0.06] hover:border-white/12'
                }`}
                onClick={() => setCategoryId(cat.id)}
              >
                <span className="line-clamp-1">{cat.name}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
        {/* Keyword Search */}
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="query" className="font-bold text-sm text-white/80">Szabad szavas keresés</Label>
          <div className="relative">
            <Search className="absolute left-4 top-4.5 h-5 w-5 text-white/40" />
            <Input
              id="query"
              type="text"
              placeholder="pl. friss alma, méz, kézműves sajt..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 rounded-xl border border-white/[0.08] bg-white/[0.01] text-white placeholder:text-white/30 focus-visible:border-primary/50 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Distance Dropdown */}
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="distance" className="font-bold text-sm text-white/80">Távolság tőled</Label>
            <Select value={distance} onValueChange={(val) => setDistance(val || '25')}>
              <SelectTrigger id="distance" className="h-14 rounded-xl border border-white/[0.08] bg-white/[0.01] text-white font-semibold focus:border-primary/50">
                <SelectValue placeholder="Válassz távolságot" />
              </SelectTrigger>
              <SelectContent className="border-white/[0.08] bg-card/90 backdrop-blur-xl">
                <SelectItem value="10">10 km-en belül</SelectItem>
                <SelectItem value="25">25 km-en belül</SelectItem>
                <SelectItem value="50">50 km-en belül</SelectItem>
                <SelectItem value="100">100 km-en belül</SelectItem>
                <SelectItem value="1000">Országos (bárhol)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
             <Button
                type="button"
                onClick={handleGeolocation}
                disabled={locating}
                className="h-14 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] text-white font-bold transition-all cursor-pointer"
              >
                {locating ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Helymeghatározás
                  </span>
                )}
             </Button>
          </div>
        </div>

        <Button type="submit" className="w-full h-14 rounded-xl text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-950/20 mt-2 cursor-pointer">
          Keresés indítása
        </Button>
      </div>
    </form>
  )
}
