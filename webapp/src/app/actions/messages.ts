'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startOrSendMessage(producerId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Be kell jelentkezned az üzenetküldéshez' }

  // Check if buyer profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'buyer') {
    return { error: 'Csak vásárlóként küldhetsz üzenetet a termelőknek' }
  }

  // Find or create thread
  let threadId: string

  const { data: existingThread, error: findError } = await supabase
    .from('message_threads')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('producer_id', producerId)
    .maybeSingle()

  if (findError) return { error: findError.message }

  if (existingThread) {
    threadId = existingThread.id
  } else {
    // Create new thread
    const { data: newThread, error: createError } = await supabase
      .from('message_threads')
      .insert({
        buyer_id: user.id,
        producer_id: producerId
      })
      .select('id')
      .single()

    if (createError) return { error: 'Nem sikerült létrehozni a beszélgetést: ' + createError.message }
    threadId = newThread.id
  }

  // Insert message
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      content: content,
      is_read: false
    })

  if (msgError) return { error: 'Nem sikerült elküldeni az üzenetet: ' + msgError.message }

  revalidatePath('/dashboard/messages')
  return { success: 'Üzenet elküldve!', threadId }
}

export async function replyToMessage(threadId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nem vagy bejelentkezve' }

  // Verify user is part of the thread
  const { data: thread, error: threadError } = await supabase
    .from('message_threads')
    .select('buyer_id, producer_id')
    .eq('id', threadId)
    .single()

  if (threadError || !thread) {
    return { error: 'A beszélgetés nem található' }
  }

  if (thread.buyer_id !== user.id && thread.producer_id !== user.id) {
    return { error: 'Nincs jogosultságod ehhez a beszélgetéshez' }
  }

  // Insert message
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      content: content,
      is_read: false
    })

  if (msgError) return { error: 'Sikertelen üzenetküldés: ' + msgError.message }

  // Update read status for other messages in thread? Optional.
  revalidatePath(`/dashboard/messages`)
  return { success: 'Üzenet elküldve!' }
}

export async function markThreadAsRead(threadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nem vagy bejelentkezve' }

  // Update messages where sender_id != user.id in the thread
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('thread_id', threadId)
    .neq('sender_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/messages')
  return { success: true }
}
