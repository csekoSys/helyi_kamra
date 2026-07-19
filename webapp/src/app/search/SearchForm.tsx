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
    <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col gap-6">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        {/* Keyword Search */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="query" className="font-semibold text-xs">Termék vagy Termelő neve</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="query"
              type="text"
              placeholder="pl. alma, méz, kovi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="category" className="font-semibold text-xs">Kategória</Label>
          <Select value={categoryId} onValueChange={(val) => setCategoryId(val || 'all')}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Összes kategória" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes kategória</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Distance Selector */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="distance" className="font-semibold text-xs">Távolság (km)</Label>
          <Select value={distance} onValueChange={(val) => setDistance(val || '25')}>
            <SelectTrigger id="distance">
              <SelectValue placeholder="Hatósugár" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 km</SelectItem>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="25">25 km</SelectItem>
              <SelectItem value="50">50 km</SelectItem>
              <SelectItem value="100">100 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Geolocation & Search Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGeolocation}
            disabled={locating}
            className="flex-1"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4 text-primary" />
            )}
            <span className="ml-1.5 hidden lg:inline">Pozícióm</span>
          </Button>

          <Button type="submit" className="flex-1 font-semibold">
            Keresés
          </Button>
        </div>
      </div>
    </form>
  )
}
