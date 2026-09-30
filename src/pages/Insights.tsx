import { ArrowRight, ChartColumn, Flame, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { decorateInventoryItem, getFreshScore, getInsightCards, sortByPriority } from '@/features/inventory/model'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useInventoryStore } from '@/stores/useInventoryStore'

export default function Insights() {
  const items = useInventoryStore((state) => state.items)
  const { settings } = useAppSettings()
  const decoratedItems = sortByPriority(items.map((item) => decorateInventoryItem(item, new Date(), settings.reminderDays)))
  const activeItems = decoratedItems.filter((item) => item.status !== 'resolved')
  const handledCount = decoratedItems.length - activeItems.length
  const freshScore = getFreshScore(activeItems)
  const warningCount = activeItems.filter((item) => item.status !== 'safe').length
  const categoryCount = new Set(decoratedItems.map((item) => item.category)).size
  const completionRate = activeItems.length === 0 ? 100 : Math.round(((activeItems.length - warningCount) / activeItems.length) * 100)
  const insightCards = getInsightCards(decoratedItems)

  return (
    <div className="space-y-4">
      <section className="plan-card plan-card-mint px-4 py-4">
        <div className="stats-grid">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Fresh score</p>
            <p className="mt-2 text-[44px] font-[800] leading-none text-[var(--text-primary)]">{freshScore}%</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-secondary)]">基于新鲜度、临期和过期状态动态计算。分数越高，收纳站越清爽。</p>
          </div>
          <div className="mini-bars" aria-hidden="true">
            <span style={{ height: Math.max(18, freshScore * 0.42) + '%' }} />
            <span style={{ height: Math.max(18, completionRate * 0.62) + '%' }} />
            <span style={{ height: Math.max(18, categoryCount * 14) + '%' }} />
            <span style={{ height: Math.max(18, (decoratedItems.length - warningCount) * 12) + '%' }} />
            <span style={{ height: Math.max(18, (100 - warningCount * 10)) + '%' }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <article className="rounded-[18px] bg-[var(--surface-lilac)] px-3 py-3">
          <Trophy size={17} />
          <p className="mt-3 text-lg font-[800] leading-none">{categoryCount}</p>
          <p className="mt-1 text-[11px] font-bold text-[var(--text-secondary)]">覆盖品类</p>
        </article>
        <article className="rounded-[18px] bg-[var(--surface-orange)] px-3 py-3">
          <Flame size={17} />
          <p className="mt-3 text-lg font-[800] leading-none">{warningCount}</p>
          <p className="mt-1 text-[11px] font-bold text-[var(--text-secondary)]">风险任务</p>
        </article>
        <article className="rounded-[18px] bg-[var(--surface-blue)] px-3 py-3">
          <ChartColumn size={17} />
          <p className="mt-3 text-lg font-[800] leading-none">{handledCount}</p>
          <p className="mt-1 text-[11px] font-bold text-[var(--text-secondary)]">已处理</p>
        </article>
      </section>

      <section className="space-y-3">
        {insightCards.map((card) => (
          <article key={card.title} className="grid grid-cols-[1fr_34px] items-center gap-3 rounded-[20px] bg-white px-4 py-4 shadow-[var(--shadow-card)]">
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">{card.title}</p>
              <p className="mt-2 text-[28px] font-[800] leading-none text-[var(--text-primary)]">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{card.description}</p>
            </div>
            <Link to="/inventory" className="icon-badge bg-[var(--surface-subtle)]" aria-label="查看详情">
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </section>
    </div>
  )
}