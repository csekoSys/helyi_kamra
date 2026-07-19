import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export const metadata = {
  title: 'Profil Beállítások - HelyiKamra',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, producer_profiles(*), buyer_profiles(*)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Format initial data based on role
  const initialData: Record<string, any> = {}
  if (profile.role === 'producer') {
    initialData.farm_name = profile.producer_profiles?.farm_name || ''
    initialData.bio = profile.producer_profiles?.bio || ''
    initialData.phone = profile.producer_profiles?.phone || ''
    initialData.is_phone_public = profile.producer_profiles?.is_phone_public || false
  } else {
    initialData.name = profile.buyer_profiles?.name || ''
    initialData.phone = profile.buyer_profiles?.phone || ''
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-heading">Profilom</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Saját adataid kezelése</p>
      </div>

      <ProfileForm role={profile.role} initialData={initialData} />
    </div>
  )
}
