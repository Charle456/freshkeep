import { ArrowRight, CalendarDays, Plus, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Empty from '@/components/Empty'
import { InventoryCard } from '@/components/InventoryCard'
import { decorateInventoryItem, getFreshScore, sortByPriority } from '@/features/inventory/model'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useInventoryStore } from '@/stores/useInventoryStore'

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })

function buildDateStrip() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index - 2)
    return {
      key: date.toISOString(),
      day: weekdayFormatter.format(date),
      date: String(date.getDate()).padStart(2, '0'),
      active: index === 2,
    }
  })
}

function getPrimaryActionLabel(category: string) {
  if (category.includes('药')) {
    return '复核'
  }

  if (category.includes('日化') || category.includes('婴童')) {
    return '安排'
  }

  return '拯救'
}

export default function Home() {
  const items = useInventoryStore((state) => state.items)
  const { settings } = useAppSettings()
  const decoratedItems = sortByPriority(items.map((item) => decorateInventoryItem(item, new Date(), settings.reminderDays)))
  const activeItems = decoratedItems.filter((item) => item.status !== 'resolved')
  const focusItems = activeItems.slice(0, 3)
  const rescueItems = activeItems.filter((item) => item.status !== 'safe')
  const watchItems = decoratedItems.filter((item) => item.riskLevel === 'watch')
  const dateStrip = buildDateStrip()
  const heroImages = focusItems.length > 0 ? focusItems : activeItems.slice(0, 3)
  const primaryItem = focusItems[0]
  const rescueCount = rescueItems.length
  const freshScore = getFreshScore(activeItems)
  const coveredCategories = new Set(activeItems.map((item) => item.category)).size

  return (
    <div className="space-y-5">
      <section className="challenge-card px-4 py-4">
        <div className="relative z-[1] max-w-[210px]">
          <p className="text-[28px] font-[800] leading-[1.02] text-[var(--text-primary)]">Daily shelf-life quest</p>
          <p className="mt-2 text-xs font-semibold text-[var(--text-primary)]">
            {rescueCount > 0 ? '今日处理 ' + rescueCount + ' 件临期物品' : '今天的收纳站状态很轻盈'}
          </p>
        </div>

        {heroImages.length > 0 ? (
          <div className="challenge-media" aria-hidden="true">
            {heroImages.slice(0, 3).map((item) => (
              <img key={item.id} src={item.imageUrl} alt="" />
            ))}
          </div>
        ) : null}

        <div className="absolute bottom-4 left-4 z-[1]">
          <div className="mini-avatar-stack">
            {focusItems.slice(0, 3).map((item) => (
              <img key={item.id} src={item.imageUrl} alt="" />
            ))}
            <span>+{Math.max(items.length - 3, 0)}</span>
          </div>
        </div>
      </section>

      <section className="-mx-1 overflow-x-auto px-1 pb-1 no-scrollbar" aria-label="日期选择">
        <div className="flex min-w-max gap-2">
          {dateStrip.map((day) => (
            <span key={day.key} className={day.active ? 'date-pill date-pill-active' : 'date-pill'}>
              <span className="text-[11px] font-bold leading-none">{day.day}</span>
              <span className="mt-1 text-xs font-bold leading-none">{day.date}</span>
            </span>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-lg font-[800] text-[var(--text-primary)]">Your plan</h2>
          <Link to="/inventory" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)]">
            全部
            <ArrowRight size={14} />
          </Link>
        </div>

        {primaryItem ? (
          <div className="grid grid-cols-2 gap-3">
            <Link to={'/items/' + primaryItem.id} className="plan-card plan-card-orange col-span-1 min-h-[190px] p-4 text-[var(--text-primary)]">
              <span className="rounded-full bg-white/45 px-3 py-1 text-[11px] font-bold">今日主线</span>
              <h3 className="mt-5 text-xl font-[800] leading-tight">
                {getPrimaryActionLabel(primaryItem.category)} {primaryItem.name}
              </h3>
              <p className="mt-2 text-xs font-semibold leading-5 text-[var(--text-secondary)]">{primaryItem.questText}</p>
              <span className="absolute bottom-4 left-4 avatar h-9 w-9 border-2">
                <img src={primaryItem.imageUrl} alt="" />
              </span>
            </Link>

            <div className="grid gap-3">
              <Link to="/insights" className="plan-card plan-card-mint min-h-[88px] p-3 text-[var(--text-primary)]">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-secondary)]">
                  <ShieldCheck size={13} />
                  Fresh Score
                </span>
                <p className="mt-2 text-2xl font-[800] leading-none">{freshScore}%</p>
                <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">覆盖 {coveredCategories} 类物品</p>
              </Link>
              <Link to="/inventory?status=warning" className="plan-card plan-card-blue min-h-[88px] p-3 text-[var(--text-primary)]">
                <span className="text-[11px] font-bold text-[var(--text-secondary)]">风险队列</span>
                <p className="mt-2 text-base font-[800] leading-tight">{rescueCount} 件待处理</p>
                <p className="text-xs font-semibold text-[var(--text-secondary)]">{watchItems.length} 件进入观察区</p>
              </Link>
            </div>
          </div>
        ) : (
          <Empty
            title="还没有任何记录"
            description="先添加一件有保质期的物品，首页会自动生成任务、分数和优先队列。"
            actionLabel="新增第一条记录"
            actionTo="/items/new"
          />
        )}
      </section>

      <section className="grid grid-cols-[1fr_116px] gap-3 rounded-[24px] bg-[var(--surface-subtle)] px-4 py-4">
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">多品类巡检</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">零食、药物、保健品、日化用品都能进入同一个保质期任务系统。</p>
        </div>
        <Link to="/items/new" className="plan-card plan-card-pink flex items-center justify-center gap-2 px-3 py-3 text-sm font-[800] text-[var(--text-primary)]">
          <Plus size={16} />
          登记
        </Link>
      </section>

      <section className="glass-panel rounded-[24px] px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Fresh missions</p>
            <p className="text-sm text-[var(--text-secondary)]">像做小任务一样管理每件有保质期的东西。</p>
          </div>
          <span className="icon-badge bg-[var(--surface-mint)]">
            <Sparkles size={16} />
          </span>
        </div>
        {focusItems.length > 0 ? (
          <div className="home-missions-list space-y-3">
            {focusItems.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Link to="/inventory" className="search-shell">
            <Search size={16} />
            <span>搜索物品、分类或备注</span>
          </Link>
        )}
      </section>

      <section className="grid grid-cols-[40px_1fr] gap-3 rounded-[24px] bg-[var(--surface-subtle)] px-4 py-4">
        <span className="icon-badge bg-white">
          <CalendarDays size={16} />
        </span>
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">连续巡检 3 天</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">每处理一件临期物品，FreshKeep 会把它从风险队列里移走。</p>
        </div>
      </section>
    </div>
  )
}
