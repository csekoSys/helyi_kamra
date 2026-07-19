import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MessagesClient from './MessagesClient'

export const metadata = {
  title: 'Üzeneteim - HelyiKamra',
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ threadId?: string }>
}) {
  const resolvedParams = await searchParams
  const threadId = resolvedParams.threadId || null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Fetch threads matching current user
  const { data: threads = [] } = await supabase
    .from('message_threads')
    .select(`
      id,
      buyer_id,
      producer_id,
      buyer_profiles(name),
      producer_profiles(farm_name)
    `)
    .or(`buyer_id.eq.${user.id},producer_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Map last messages and unread counts for each thread on the server
  const threadsWithDetails = await Promise.all(
    (threads || []).map(async (t: any) => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('content, created_at, sender_id, is_read')
        .eq('thread_id', t.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', t.id)
        .neq('sender_id', user.id)
        .eq('is_read', false)

      return {
        ...t,
        lastMessage: msgs?.[0] || null,
        unreadCount: unreadCount || 0,
      }
    })
  )

  // Fetch messages if a thread is selected
  let messages: any[] = []
  if (threadId) {
    // Double check that user has access to this thread
    const selectedThread = (threads || []).find((t) => t.id === threadId)
    if (selectedThread) {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
      messages = data || []
    }
  }

  return (
    <MessagesClient
      threads={threadsWithDetails}
      messages={messages}
      currentUserId={user.id}
      selectedThreadId={threadId}
      userRole={profile.role}
    />
  )
}
