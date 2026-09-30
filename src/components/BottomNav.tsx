import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

interface BottomNavProps {
  items: NavigationItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-5 z-20 mx-auto w-full max-w-[430px] px-6">
      <div className="bottom-nav-shell">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            aria-label={label}
            title={label}
            className={({ isActive }) => cn('bottom-nav-item', isActive && 'bottom-nav-item-active')}
          >
            <span className="bottom-nav-icon-wrap">
              <Icon size={19} strokeWidth={2.2} />
            </span>
            <span className="sr-only">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
