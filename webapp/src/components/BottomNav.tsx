'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, LayoutDashboard, User } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Kezdőlap', href: '/', icon: Home },
    { name: 'Keresés', href: '/search', icon: Search },
    { name: 'Vezérlőpult', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profil', href: '/dashboard/profile', icon: User },
  ]

  // Hide bottom nav on specific pages if needed
  if (pathname.includes('/login') || pathname.includes('/register')) {
    return null
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-border pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-around h-[72px] px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/20 stroke-primary stroke-2' : 'stroke-[1.5]'}`} />
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-primary' : ''}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
