import Link from 'next/link'
import { ShoppingBasket } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-muted/30 py-8 md:py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <ShoppingBasket className="h-5 w-5" />
            <span>HelyiKamra</span>
          </Link>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            Közvetlen kapcsolat kistermelők és tudatos vásárlók között.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-muted-foreground">
          <Link href="/search" className="hover:text-primary transition-colors">Keresés</Link>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <Link href="/login" className="hover:text-primary transition-colors">Termelői Belépés</Link>
        </div>

        <div className="text-center md:text-right">
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HelyiKamra. Minden jog fenntartva.
          </span>
        </div>
      </div>
    </footer>
  )
}
