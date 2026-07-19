'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const marketSchema = z.object({
  name: z.string().min(2, 'A piac neve túl rövid'),
  address: z.string().min(3, 'A cím túl rövid'),
  latitude: z.number(),
  longitude: z.number(),
  schedule: z.string().min(1, 'A nyitvatartás megadása kötelező'),
})

const blogSchema = z.object({
  title: z.string().min(3, 'A cím túl rövid'),
  content: z.string().min(10, 'A tartalom túl rövid'),
  is_sponsored: z.boolean().default(false),
})

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Nincs admin jogosultságod' }
  }

  return { is_admin: true }
}

export async function approveProducer(id: string, isApproved: boolean) {
  const supabase = await createClient()
  const adminCheck = await checkAdmin(supabase)
  if (adminCheck.error) return { error: adminCheck.error }

  const { error } = await supabase
    .from('profiles')
    .update({ is_approved_by_admin: isApproved })
    .eq('id', id)

  if (error) return { error: 'Sikertelen jóváhagyás: ' + error.message }

  revalidatePath('/admin')
  return { success: isApproved ? 'Termelő jóváhagyva!' : 'Termelő jóváhagyása visszavonva!' }
}

export async function addMarket(prevState: any, data: {
  name: string
  address: string
  latitude: number
  longitude: number
  schedule: string
}) {
  const supabase = await createClient()
  const adminCheck = await checkAdmin(supabase)
  if (adminCheck.error) return { error: adminCheck.error }

  const validation = marketSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const pointWKT = `POINT(${data.longitude} ${data.latitude})`

  const { error } = await supabase.from('markets').insert({
    name: data.name,
    address: data.address,
    location: pointWKT,
    schedule: data.schedule,
  })

  if (error) return { error: 'Sikertelen piac hozzáadás: ' + error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard/locations')
  return { success: 'Piac sikeresen hozzáadva!' }
}

export async function deleteMarket(id: string) {
  const supabase = await createClient()
  const adminCheck = await checkAdmin(supabase)
  if (adminCheck.error) return { error: adminCheck.error }

  const { error } = await supabase
    .from('markets')
    .delete()
    .eq('id', id)

  if (error) return { error: 'Sikertelen piac törlés: ' + error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard/locations')
  return { success: 'Piac törölve!' }
}

export async function createBlogPost(prevState: any, data: {
  title: string
  content: string
  is_sponsored: boolean
}) {
  const supabase = await createClient()
  const adminCheck = await checkAdmin(supabase)
  if (adminCheck.error) return { error: adminCheck.error }

  const validation = blogSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { error } = await supabase.from('blog_posts').insert({
    title: data.title,
    content: data.content,
    is_sponsored: data.is_sponsored,
  })

  if (error) return { error: 'Sikertelen blog bejegyzés hozzáadás: ' + error.message }

  revalidatePath('/blog')
  revalidatePath('/admin')
  return { success: 'Blog bejegyzés létrehozva!' }
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient()
  const adminCheck = await checkAdmin(supabase)
  if (adminCheck.error) return { error: adminCheck.error }

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) return { error: 'Sikertelen törlés: ' + error.message }

  revalidatePath('/blog')
  revalidatePath('/admin')
  return { success: 'Blog bejegyzés törölve!' }
}
