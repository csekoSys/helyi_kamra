'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { replyToMessage, markThreadAsRead } from '@/app/actions/messages'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Loader2, User, Store } from 'lucide-react'

interface Message {
  id: string
  thread_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface Thread {
  id: string
  buyer_id: string
  producer_id: string
  buyer_profiles: { name: string }
  producer_profiles: { farm_name: string }
  lastMessage: { content: string; created_at: string; sender_id: string } | null
  unreadCount: number
}

interface MessagesClientProps {
  threads: Thread[]
  messages: Message[]
  currentUserId: string
  selectedThreadId: string | null
  userRole: 'buyer' | 'producer'
}

export default function MessagesClient({
  threads,
  messages,
  currentUserId,
  selectedThreadId,
  userRole,
}: MessagesClientProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat on load or when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark thread as read when selected
  useEffect(() => {
    if (selectedThreadId) {
      markThreadAsRead(selectedThreadId)
    }
  }, [selectedThreadId, messages])

  const handleThreadSelect = (id: string) => {
    router.push(`/dashboard/messages?threadId=${id}`)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !selectedThreadId) return

    setSending(true)
    try {
      const res = await replyToMessage(selectedThreadId, content)
      if (res.error) {
        alert(res.error)
      } else {
        setContent('')
      }
    } catch (err) {
      alert('Nem sikerült elküldeni az üzenetet.')
    } finally {
      setSending(false)
    }
  }

  const activeThread = threads.find((t) => t.id === selectedThreadId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 border border-border bg-card rounded-xl overflow-hidden min-h-[500px] shadow-sm">
      {/* Threads Sidebar */}
      <div className={`md:col-span-4 border-r border-border flex flex-col ${selectedThreadId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="font-bold text-base flex items-center gap-1.5 text-foreground">
            <MessageSquare className="h-5 w-5 text-primary" /> Üzenetváltások
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {threads.length > 0 ? (
            threads.map((thread) => {
              const otherName =
                userRole === 'producer'
                  ? thread.buyer_profiles?.name
                  : thread.producer_profiles?.farm_name
              const isSelected = thread.id === selectedThreadId
              const isUnread = thread.unreadCount > 0

              return (
                <button
                  key={thread.id}
                  onClick={() => handleThreadSelect(thread.id)}
                  className={`w-full p-4 text-left transition-colors flex flex-col gap-1.5 hover:bg-muted/50 ${
                    isSelected ? 'bg-primary/5 hover:bg-primary/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-center w-full gap-2">
                    <span className={`font-bold text-sm truncate flex items-center gap-1.5 ${isUnread ? 'text-primary' : 'text-foreground'}`}>
                      {userRole === 'producer' ? (
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      ) : (
                        <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                      {otherName || 'Felhasználó'}
                    </span>
                    {isUnread && (
                      <Badge variant="default" className="text-[10px] h-5 w-5 rounded-full flex items-center justify-center p-0 shrink-0">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {thread.lastMessage && (
                    <p className={`text-xs truncate ${isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {thread.lastMessage.content}
                    </p>
                  )}
                </button>
              )
            })
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Még nincsenek üzeneteid.
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`md:col-span-8 flex flex-col bg-muted/5 ${!selectedThreadId ? 'hidden md:flex' : 'flex'}`}>
        {selectedThreadId && activeThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/messages')}
                  className="md:hidden p-0 h-8 w-8 text-primary"
                >
                  &larr;
                </Button>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-foreground">
                    {userRole === 'producer'
                      ? activeThread.buyer_profiles?.name
                      : activeThread.producer_profiles?.farm_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    {userRole === 'producer' ? 'Vásárló' : 'Termelő'}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[400px] min-h-[300px]">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === currentUserId
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm flex flex-col gap-1 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-card border border-border text-foreground rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span
                        className={`text-[9px] self-end mt-1 font-medium ${
                          isOwn ? 'text-primary-foreground/75' : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString('hu-HU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-border bg-card flex gap-2 items-end">
              <Textarea
                placeholder="Írd ide a választ..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                required
                className="resize-none"
              />
              <Button type="submit" size="icon" disabled={sending || !content.trim()} className="h-10 w-10 shrink-0">
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <h3 className="font-bold text-sm">Nincs beszélgetés kiválasztva</h3>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Kattints a bal oldali listában egy üzenetváltásra a megtekintéshez.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
