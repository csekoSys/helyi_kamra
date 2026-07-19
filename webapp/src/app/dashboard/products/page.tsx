import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductsClient from './ProductsClient'

export const metadata = {
  title: 'Termékeim - HelyiKamra',
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile and verify role is producer
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_buyer, is_producer')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_producer) {
    redirect('/dashboard')
  }

  // Fetch producer details (subscription tier)
  const { data: producerProfile } = await supabase
    .from('producer_profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  // Fetch products
  const { data: products = [] } = await supabase
    .from('products')
    .select('*')
    .eq('producer_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch categories
  const { data: categories = [] } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <ProductsClient
      products={products || []}
      categories={categories || []}
      subscriptionTier={producerProfile?.subscription_tier || 'free'}
    />
  )
}
