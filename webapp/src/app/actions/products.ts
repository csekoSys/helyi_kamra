'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(2, 'A terméknév túl rövid'),
  description: z.string().optional(),
  price: z.number().min(0, 'Az ár nem lehet negatív'),
  unit: z.string().min(1, 'A mértékegység megadása kötelező'),
  category_id: z.string().uuid('Érvénytelen kategória'),
  is_active: z.boolean().default(true),
  image_url: z.string().optional(),
  tags: z.string().optional(),
})

async function checkActiveProductLimit(producerId: string, supabase: any, isNewOrActivating: boolean) {
  if (!isNewOrActivating) return { allowed: true }

  // Get subscription tier
  const { data: profile } = await supabase
    .from('producer_profiles')
    .select('subscription_tier')
    .eq('id', producerId)
    .single()

  if (!profile) return { error: 'Termelői profil nem található' }

  if (profile.subscription_tier === 'free') {
    // Count active products
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('producer_id', producerId)
      .eq('is_active', true)

    if (error) return { error: 'Hiba a termékek ellenőrzésekor: ' + error.message }

    if (count !== null && count >= 20) {
      return { allowed: false, error: 'Elérted a maximum 20 aktív termékes korlátot a díjmentes csomagban. Kérjük, fizess elő a korlátlan csomagra, vagy inaktiválj egy meglévő terméket.' }
    }
  }

  return { allowed: true }
}

export async function createProduct(prevState: any, data: {
  name: string
  description?: string
  price: number
  unit: string
  category_id: string
  is_active: boolean
  image_url?: string
  tags?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nem vagy bejelentkezve' }

  const validation = productSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check product limits
  const limitCheck = await checkActiveProductLimit(user.id, supabase, data.is_active)
  if (limitCheck.error || !limitCheck.allowed) {
    return { error: limitCheck.error }
  }

  const { error } = await supabase.from('products').insert({
    producer_id: user.id,
    name: data.name,
    description: data.description,
    price: data.price,
    unit: data.unit,
    category_id: data.category_id,
    is_active: data.is_active,
    image_url: data.image_url,
    tags: data.tags,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/products')
  return { success: 'Termék sikeresen hozzáadva!' }
}

export async function updateProduct(prevState: any, data: {
  id: string
  name: string
  description?: string
  price: number
  unit: string
  category_id: string
  is_active: boolean
  image_url?: string
  tags?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nem vagy bejelentkezve' }

  const validation = productSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Get previous state to see if it was inactive and now becoming active
  const { data: currentProduct } = await supabase
    .from('products')
    .select('is_active')
    .eq('id', data.id)
    .eq('producer_id', user.id)
    .single()

  if (!currentProduct) return { error: 'A termék nem található vagy nem a tiéd' }

  const activating = data.is_active && !currentProduct.is_active
  const limitCheck = await checkActiveProductLimit(user.id, supabase, activating)
  if (limitCheck.error || !limitCheck.allowed) {
    return { error: limitCheck.error }
  }

  const { error } = await supabase
    .from('products')
    .update({
      name: data.name,
      description: data.description,
      price: data.price,
      unit: data.unit,
      category_id: data.category_id,
      is_active: data.is_active,
      image_url: data.image_url,
      tags: data.tags,
    })
    .eq('id', data.id)
    .eq('producer_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/products')
  return { success: 'Termék sikeresen frissítve!' }
}

export async function toggleProductActive(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nem vagy bejelentkezve' }

  // If activating, check limit
  const limitCheck = await checkActiveProductLimit(user.id, supabase, is_active)
  if (limitCheck.error || !limitCheck.allowed) {
    return { error: limitCheck.error }
  }

  const { error } = await supabase
    .from('products')
    .update({ is_active })
    .eq('id', id)
    .eq('producer_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/products')
  return { success: is_active ? 'Termék aktiválva!' : 'Termék inaktiválva!' }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nem vagy bejelentkezve' }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('producer_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/products')
  return { success: 'Termék törölve!' }
}

export async function uploadProductImage(base64Data: string, fileName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nem vagy bejelentkezve' }

  try {
    // 1. Ensure bucket exists (ignores if already exists)
    await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })
  } catch (e) {
    // Bucket might already exist
  }

  try {
    // 2. Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')
    const extension = fileName.split('.').pop() || 'jpg'
    const filePath = `${user.id}/${Date.now()}.${extension}`

    // 3. Upload file
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: `image/${extension === 'png' ? 'png' : extension === 'webp' ? 'webp' : 'jpeg'}`,
        upsert: true
      })

    if (uploadError) {
      return { error: 'Sikertelen feltöltés: ' + uploadError.message }
    }

    // 4. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return { publicUrl }
  } catch (err: any) {
    return { error: 'Feltöltési hiba: ' + err.message }
  }
}
