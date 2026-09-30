import { BellDot, ChevronLeft, Plus, Search } from 'lucide-react'
import { Link, Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { navigationItems } from '@/data/app-data'
import { useInventoryStore } from '@/stores/useInventoryStore'

const pageTitles: Record<string, string> = {
  home: 'FreshKeep',
  inventory: 'Inventory',
  newItem: 'New item',
  editItem: 'Edit item',
  detail: 'Fresh detail',
  insights: 'Fresh stats',
  profile: 'Profile',
  reminders: 'Reminders',
  data: 'Data',
  categories: 'Categories',
  appearance: 'Appearance',
  about: 'About',
}

const avatarUrl = '/images/freshkeep-avatar.svg'

function getPageKey(pathname: string) {
  if (matchPath('/inventory', pathname)) return 'inventory'
  if (matchPath('/items/new', pathname)) return 'newItem'
  if (matchPath('/items/:itemId/edit', pathname)) return 'editItem'
  if (matchPath('/items/:itemId', pathname)) return 'detail'
  if (matchPath('/insights', pathname)) return 'insights'
  if (matchPath('/profile', pathname)) return 'profile'
  if (matchPath('/settings/reminders', pathname)) return 'reminders'
  if (matchPath('/settings/data', pathname)) return 'data'
  if (matchPath('/settings/categories', pathname)) return 'categories'
  if (matchPath('/settings/appearance', pathname)) return 'appearance'
  if (matchPath('/about', pathname)) return 'about'
  return 'home'
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialized = useInventoryStore((state) => state.initialized)
  const pageKey = getPageKey(location.pathname)
  const isHome = pageKey === 'home'
  const showQuickActions = !matchPath('/items/new', location.pathname) && !matchPath('/items/:itemId/edit', location.pathname)
  const todayText = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' }).format(new Date())

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
        <main className="app-phone mx-auto flex min-h-screen w-full max-w-[430px] items-center px-5 pb-28 pt-5">
          <section className="glass-panel w-full rounded-[28px] px-5 py-8 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">正在恢复你的保鲜记录...</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">本地示例数据与已保存记录会在这里统一加载。</p>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="app-phone relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden px-4 pb-28 pt-5 sm:px-5">
        <header className="mb-5 flex min-h-[48px] items-center justify-between gap-3">
          {isHome ? (
            <div className="flex min-w-0 items-center gap-3">
              <span className="avatar shrink-0">
                <img src={avatarUrl} alt="FreshKeep profile" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[var(--text-primary)]">Hello, Fresh keeper</p>
                <p className="text-xs font-semibold text-[var(--text-muted)]">Today {todayText}</p>
              </div>
            </div>
          ) : (
            <div className="grid flex-1 grid-cols-[40px_1fr_40px] items-center gap-2">
              <button type="button" className="icon-button" aria-label="返回" onClick={() => navigate(-1)}>
                <ChevronLeft size={18} />
              </button>
              <h1 className="truncate text-center text-lg font-bold text-[var(--text-primary)]">{pageTitles[pageKey]}</h1>
              <Link to="/profile" className="icon-button" aria-label="打开设置">
                <BellDot size={17} />
              </Link>
            </div>
          )}

          {isHome ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link to="/inventory" className="icon-button" aria-label="搜索库存">
                <Search size={18} />
              </Link>
              {showQuickActions ? (
                <Link to="/items/new" className="icon-button" aria-label="新增物品">
                  <Plus size={18} />
                </Link>
              ) : null}
            </div>
          ) : null}
        </header>

        <Outlet />
      </div>

      <BottomNav items={navigationItems} />
    </div>
  )
}
