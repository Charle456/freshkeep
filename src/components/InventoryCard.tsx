import { ChevronRight, Clock3, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { InventoryItemView } from '@/features/inventory/model'
import { cn } from '@/lib/utils'

interface InventoryCardProps {
  item: InventoryItemView
}

export function InventoryCard({ item }: InventoryCardProps) {
  return (
    <Link to={'/items/' + item.id} className="inventory-card block">
      <div className={cn('inventory-card-thumb', 'inventory-card-thumb-' + item.accent)}>
        <img src={item.imageUrl} alt={item.name} className="inventory-card-image" />
        <div className="inventory-card-overlay" />
        <span className="inventory-card-thumb-glow" />
        <p className="inventory-card-category">{item.category}</p>
        <div className="relative z-[1] max-w-[190px]">
          <div className="flex flex-wrap gap-2">
            <span className={cn('status-badge', 'status-badge-' + item.status)}>{item.statusLabel}</span>
            <span className="status-badge bg-white/45 text-[var(--text-primary)]">{item.riskLabel}</span>
          </div>
          <h3 className="mt-3 text-[24px] font-[800] leading-none text-[var(--text-primary)]">{item.name}</h3>
          <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)]">{item.expiresAtText}</p>
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        <div>
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Clock3 size={14} />
              {item.status === 'resolved' ? '已处理' : item.daysLeft < 0 ? '超期 ' + Math.abs(item.daysLeft) + ' 天' : '剩余 ' + item.daysLeft + ' 天'}
            </span>
            <span>新鲜度 {item.freshnessPercent}%</span>
          </div>
          <div className="freshness-track mt-2" aria-label={'新鲜度 ' + item.freshnessPercent + '%'}>
            <span
              className={'freshness-fill freshness-fill-' + item.riskLevel}
              style={{ width: item.freshnessPercent + '%' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_36px] items-center gap-3">
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">
            <Sparkles className="mr-1 inline" size={13} />
            {item.questText}
          </p>
          <span className="icon-badge bg-[var(--surface-subtle)]">
            <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  )
}
