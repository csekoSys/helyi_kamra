import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LocationsClient from './LocationsClient'

export const metadata = {
  title: 'Helyszíneim - HelyiKamra',
}

export default async function LocationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'producer') {
    redirect('/dashboard')
  }

  // Fetch producer locations using views
  const { data: locations = [] } = await supabase
    .from('producer_locations_view')
    .select('*')
    .eq('producer_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch central markets using views
  const { data: markets = [] } = await supabase
    .from('markets_view')
    .select('*')
    .order('name')

  return (
    <LocationsClient
      locations={locations || []}
      markets={markets || []}
    />
  )
}
