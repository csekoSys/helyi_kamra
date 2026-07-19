import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button, buttonVariants } from '@/components/ui/button'
import { 
  Carrot, 
  MapPin, 
  MessageSquare, 
  User, 
  LayoutDashboard,
  Menu,
  ShieldCheck
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_approved_by_admin')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const role = profile.role

  const producerNav = [
    { name: 'Vezérlőpult', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Termékeim', href: '/dashboard/products', icon: Carrot },
    { name: 'Helyszíneim', href: '/dashboard/locations', icon: MapPin },
    { name: 'Üzenetek', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Profilom', href: '/dashboard/profile', icon: User },
  ]

  const buyerNav = [
    { name: 'Vezérlőpult', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Üzenetek', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Profilom', href: '/dashboard/profile', icon: User },
  ]

  const navItems = role === 'producer' ? producerNav : buyerNav

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-6 gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-lg text-foreground">Vezérlőpult</h2>
          <span className="text-xs text-primary font-semibold uppercase tracking-wider">
            {role === 'producer' ? 'Termelői fiók' : 'Vásárlói fiók'}
          </span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-muted text-foreground/80 hover:text-primary transition-all"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Navigation - Mobile Top Bar / Drawer */}
      <div className="md:hidden border-b border-border bg-card p-4 flex items-center justify-between">
        <span className="font-bold text-sm text-foreground">
          {role === 'producer' ? 'Termelői Vezérlőpult' : 'Vásárlói Vezérlőpult'}
        </span>
        <Sheet>
          <SheetTrigger className={buttonVariants({ variant: "outline", size: "icon" }) + " h-9 w-9 cursor-pointer"}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-bold text-lg text-foreground">HelyiKamra</h2>
              <span className="text-xs text-primary font-bold uppercase">
                {role === 'producer' ? 'Termelő' : 'Vásárló'}
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-muted text-foreground/80 hover:text-primary transition-all"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main dashboard content area */}
      <main className="flex-1 p-6 md:p-10 bg-background overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
