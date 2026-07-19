import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export const metadata = {
  title: 'Adminisztráció - HelyiKamra',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile role and verify role is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_admin) {
    redirect('/')
  }

  // Fetch all registered producers
  const { data: producers = [] } = await supabase
    .from('profiles')
    .select(`
      id,
      is_approved_by_admin,
      producer_profiles(farm_name, phone)
    `)
    .eq('is_producer', true)
    .order('created_at', { ascending: false })

  // Fetch all central markets using coordinates view
  const { data: markets = [] } = await supabase
    .from('markets_view')
    .select('*')
    .order('name')

  // Fetch all blog posts
  const { data: blogPosts = [] } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  // Pull emails for users. Note: in Supabase we can fetch users list via auth admin SDK if service role key is set,
  // but to keep it simple, we can display the farm_name. We don't strictly need user emails unless wanted, but let's map email as null or mock it
  const formattedProducers = (producers || []).map((p: any) => ({
    id: p.id,
    is_approved_by_admin: p.is_approved_by_admin,
    producer_profiles: p.producer_profiles,
    email: null // we don't select auth.users directly from public schema due to security
  }))

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
      <AdminClient
        producers={formattedProducers}
        markets={markets || []}
        blogPosts={blogPosts || []}
      />
    </div>
  )
}
