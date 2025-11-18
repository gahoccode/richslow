"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, TrendingUp, FileText } from "lucide-react"

export function FloatingNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
      active: pathname === "/",
    },
    {
      name: "Market Data",
      href: "/market",
      icon: TrendingUp,
      active: pathname === "/market",
    },
    {
      name: "Statements",
      href: "/statement",
      icon: FileText,
      active: pathname === "/statement",
    },
  ]

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-2 p-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border rounded-full shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                item.active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
