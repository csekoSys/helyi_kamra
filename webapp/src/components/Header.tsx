import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { ShoppingBasket, User, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let role: string | null = null
  let displayName = user?.email

  if (user) {
    // Get role and details
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile) {
      role = profile.role
      if (role === 'producer') {
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary font-heading tracking-tight hover:opacity-90 transition-opacity">
          <ShoppingBasket className="h-6 w-6 stroke-[2.5]" />
          <span>Helyi<span className="text-accent-foreground font-extrabold bg-accent px-1.5 py-0.5 rounded ml-0.5">Kamra</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-foreground/80">
          <Link href="/search" className="hover:text-primary transition-colors">Keresés</Link>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          {role === 'admin' && (
            <Link href="/admin" className="text-destructive hover:opacity-95 font-semibold transition-colors">Admin Panel</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
                Szia, <strong className="text-foreground">{displayName}</strong>!
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "icon" }) + " rounded-full border-primary/20 hover:border-primary/50 transition-colors"}>
                  <User className="h-4 w-4 text-primary" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 border-border">
                  <DropdownMenuLabel className="font-semibold">Fiók kezelése</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2 w-full">
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      <span>Vezérlőpult</span>
                    </Link>
                  </DropdownMenuItem>
                  {role === 'producer' && (
                    <>
                      <DropdownMenuItem className="cursor-pointer">
                        <Link href="/dashboard/products" className="flex items-center gap-2 w-full">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span>Termékeim</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive font-semibold cursor-pointer focus:bg-destructive/10 p-0">
                    <form action={logout} className="w-full h-full">
                      <button type="submit" className="flex items-center gap-2 w-full h-full px-2.5 py-1.5 text-left text-sm outline-none cursor-pointer">
                        <LogOut className="h-4 w-4" />
                        <span>Kijelentkezés</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login" className={buttonVariants({ variant: "ghost" }) + " text-sm font-semibold hover:bg-primary/5"}>
                Bejelentkezés
              </Link>
              <Link href="/register" className={buttonVariants() + " text-sm font-semibold shadow-sm hover:opacity-95 transition-all"}>
                Regisztráció
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
