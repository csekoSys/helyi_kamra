import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { ShoppingBasket, User, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isAdmin = false
  let isProducer = false
  let displayName = user?.email

  if (user) {
    // Get role and details
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, is_producer')
      .eq('id', user.id)
      .single()
      
    if (profile) {
      isAdmin = profile.is_admin
      isProducer = profile.is_producer
      if (isProducer) {
        const { data: prod } = await supabase
          .from('producer_profiles')
          .select('farm_name')
          .eq('id', user.id)
          .single()
        if (prod) displayName = prod.farm_name
      } else {
        const { data: buy } = await supabase
          .from('buyer_profiles')
          .select('name')
          .eq('id', user.id)
          .single()
        if (buy) displayName = buy.name
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/50 backdrop-blur-xl shadow-lg shadow-black/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl font-heading tracking-tight hover:opacity-90 transition-opacity">
          <ShoppingBasket className="h-7 w-7 text-primary" />
          <span className="text-white">
            Helyi<span className="text-gradient font-extrabold font-sans">Kamra</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground/80">
          <Link href="/search" className="hover:text-primary transition-colors text-white/80 hover:text-white">Keresés</Link>
          <Link href="/blog" className="hover:text-primary transition-colors text-white/80 hover:text-white">Blog</Link>
          {isAdmin && (
            <Link href="/admin" className="text-destructive hover:opacity-90 font-semibold transition-colors">Admin Panel</Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm font-medium text-white/60">
                Szia, <strong className="text-white">{displayName}</strong>!
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "icon" }) + " rounded-full border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer"}>
                  <User className="h-4 w-4 text-primary" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 border-white/[0.08] bg-card/90 backdrop-blur-xl">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-semibold text-white/90">Fiók kezelése</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/[0.08]" />
                    <DropdownMenuItem className="cursor-pointer hover:bg-white/[0.05] focus:bg-white/[0.05]">
                      <Link href="/dashboard" className="flex items-center gap-2.5 w-full text-white/80">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        <span>Vezérlőpult</span>
                      </Link>
                    </DropdownMenuItem>
                    {isProducer && (
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/[0.05] focus:bg-white/[0.05]">
                        <Link href="/dashboard/products" className="flex items-center gap-2.5 w-full text-white/80">
                          <Settings className="h-4 w-4 text-primary" />
                          <span>Termékeim</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-white/[0.08]" />
                  <DropdownMenuItem className="text-destructive font-semibold cursor-pointer focus:bg-destructive/10 p-0">
                    <form action={logout} className="w-full h-full">
                      <button type="submit" className="flex items-center gap-2 w-full h-full px-2.5 py-2 text-left text-sm outline-none cursor-pointer">
                        <LogOut className="h-4 w-4" />
                        <span>Kijelentkezés</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className={buttonVariants({ variant: "ghost" }) + " text-sm font-semibold text-white/80 hover:text-white hover:bg-white/[0.04]"}>
                Bejelentkezés
              </Link>
              <Link href="/register" className={buttonVariants() + " text-sm font-semibold shadow-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 transition-all border-0 rounded-xl"}>
                Regisztráció
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
