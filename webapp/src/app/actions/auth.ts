'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Érvénytelen e-mail cím'),
  password: z.string().min(6, 'A jelszónak legalább 6 karakterből kell állnia'),
})

const registerSchema = z.object({
  email: z.string().email('Érvénytelen e-mail cím'),
  password: z.string().min(6, 'A jelszónak legalább 6 karakterből kell állnia'),
  role: z.enum(['buyer', 'producer']),
  name: z.string().min(2, 'A név túl rövid'),
  phone: z.string().optional(),
  farmName: z.string().optional(),
})

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validation = loginSchema.safeParse({ email, password })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Sikertelen bejelentkezés: ' + error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as 'buyer' | 'producer'
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const farmName = formData.get('farmName') as string

  const validation = registerSchema.safeParse({ email, password, role, name, phone, farmName })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        name,
        phone,
        farm_name: role === 'producer' ? (farmName || 'Új Gazdaság') : name
      }
    }
  })

  if (error) {
    return { error: 'Sikertelen regisztráció: ' + error.message }
  }

  return { success: 'Sikeres regisztráció! Kérjük, ellenőrizd az e-mail fiókodat a visszaigazoláshoz.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(prevState: any, data: {
  name?: string
  farm_name?: string
  bio?: string
  phone?: string
  is_phone_public?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  // Get user profile first to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profil nem található' }
  }

  if (profile.role === 'producer') {
    const { error } = await supabase
      .from('producer_profiles')
      .update({
        farm_name: data.farm_name,
        bio: data.bio,
        phone: data.phone,
        is_phone_public: data.is_phone_public ?? false
      })
      .eq('id', user.id)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('buyer_profiles')
      .update({
        name: data.name,
        phone: data.phone
      })
      .eq('id', user.id)

    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: 'Profil sikeresen frissítve!' }
}
