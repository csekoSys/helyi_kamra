'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const locationSchema = z.object({
  location_type: z.string().min(1, 'A típus megadása kötelező'),
  address: z.string().min(3, 'A cím túl rövid'),
  latitude: z.number(),
  longitude: z.number(),
  radius_km: z.number().min(0, 'A hatósugár nem lehet negatív'),
  delivery_text: z.string().optional(),
  schedule_info: z.string().optional(),
})

export async function addLocation(prevState: any, data: {
  location_type: string
  address: string
  latitude: number
  longitude: number
  radius_km: number
  delivery_text?: string
  schedule_info?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nem vagy bejelentkezve' }

  const validation = locationSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Convert lat/lng to WKT (Well-Known Text) Point: POINT(longitude latitude)
  const pointWKT = `POINT(${data.longitude} ${data.latitude})`

  const { error } = await supabase.from('producer_locations').insert({
    producer_id: user.id,
    location_type: data.location_type,
    address: data.address,
    location: pointWKT,
    radius_km: data.radius_km,
    delivery_text: data.delivery_text,
    schedule_info: data.schedule_info,
  })

  if (error) return { error: 'Sikertelen helyszín hozzáadás: ' + error.message }

  revalidatePath('/dashboard/locations')
  return { success: 'Helyszín sikeresen hozzáadva!' }
}

export async function deleteLocation(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nem vagy bejelentkezve' }

  const { error } = await supabase
    .from('producer_locations')
    .delete()
    .eq('id', id)
    .eq('producer_id', user.id)

  if (error) return { error: 'Sikertelen törlés: ' + error.message }

  revalidatePath('/dashboard/locations')
  return { success: 'Helyszín törölve!' }
}
