import { CalendarDays, CheckCircle2, PencilLine, RotateCcw, Share2, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Empty from '@/components/Empty'
import {
  decorateInventoryItem,
  formatFullDate,
  getResolutionLabel,
  type ItemResolution,
} from '@/features/inventory/model'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useInventoryStore } from '@/stores/useInventoryStore'

const resolutionActions: Array<{ label: string; resolution: ItemResolution; icon: typeof CheckCircle2 }> = [
  { label: '已使用', resolution: 'used', icon: CheckCircle2 },
  { label: '已丢弃', resolution: 'discarded', icon: Trash2 },
  { label: '已分享', resolution: 'donated', icon: Share2 },
]

export default function ItemDetail() {
  const navigate = useNavigate()
  const { itemId } = useParams()
  const items = useInventoryStore((state) => state.items)
  const removeItem = useInventoryStore((state) => state.removeItem)
  const resolveItem = useInventoryStore((state) => state.resolveItem)
  const restoreItem = useInventoryStore((state) => state.restoreItem)
  const { settings } = useAppSettings()
  const [pendingResolution, setPendingResolution] = useState<ItemResolution | undefined>()
  const [resolutionNote, setResolutionNote] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const record = items.find((item) => item.id === itemId)

  if (!record) {
    return (
      <Empty
        title="这条记录不存在"
        description="可能已被删除，或者本地数据已经重置。你可以回到列表继续查看其他物品。"
        actionLabel="返回全部记录"
        actionTo="/inventory"
      />
    )
  }

  const item = decorateInventoryItem(record, new Date(), settings.reminderDays)
  const isResolved = item.status === 'resolved'
  const pendingAction = resolutionActions.find((action) => action.resolution === pendingResolution)

  const facts = [
    { label: '分类', value: item.category },
    { label: '生产日期', value: formatFullDate(item.productionDate) },
    { label: '保质期', value: `${item.shelfLifeDays} 天` },
    { label: '过期日期', value: formatFullDate(item.expiryDate) },
    { label: '当前状态', value: item.statusLabel },
    { label: '新鲜度', value: item.freshnessPercent + '%' },
    { label: '任务关卡', value: item.riskLabel },
    ...(item.resolvedAt
      ? [
          { label: '处理方式', value: getResolutionLabel(item.resolution) },
          { label: '处理时间', value: formatFullDate(item.resolvedAt.slice(0, 10)) },
        ]
      : []),
  ]

  const openResolutionPanel = (resolution: ItemResolution) => {
    setPendingResolution(resolution)
    setResolutionNote('')
    setDeleteConfirmOpen(false)
  }

  const handleConfirmResolution = () => {
    if (!pendingResolution) {
      return
    }

    resolveItem(item.id, pendingResolution, resolutionNote)
    setPendingResolution(undefined)
    setResolutionNote('')
  }

  const handleDelete = () => {
    removeItem(item.id)
    navigate('/inventory', { replace: true })
  }

  const handleRestore = () => {
    restoreItem(item.id)
    setDeleteConfirmOpen(false)
  }

  return (
    <div className="space-y-4">
      <section className="inventory-card">
        <div className="detail-hero">
          <img src={item.imageUrl} alt={item.name} className="detail-hero-image" />
          <div className="detail-hero-overlay" />
          <div className="relative z-[1] px-5 pb-5 pt-24">
            <p className="text-xs font-semibold text-white/80">{item.category}</p>
            <h2 className="mt-2 text-[30px] font-[800] leading-[1.05] text-white">{item.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`status-badge status-badge-${item.status}`}>{item.statusLabel}</span>
              <span className="status-badge bg-white/20 text-white">{item.riskLabel}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-[var(--text-muted)]">
            <span>{isResolved ? '处理记录' : '新鲜度生命值'}</span>
            <span>{item.freshnessPercent}%</span>
          </div>
          <div className="freshness-track mt-2">
            <span className={'freshness-fill freshness-fill-' + item.riskLevel} style={{ width: item.freshnessPercent + '%' }} />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{item.questText}</p>
        </div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <CalendarDays size={16} />
          状态说明
        </div>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          FreshKeep 当前使用 {settings.reminderDays} 天提醒窗口：超过阈值显示“状态正常”，小于等于阈值显示“即将临期”，晚于过期日则显示“已过期”。已处理的物品会保留在历史记录中，但不再进入首页任务队列。
        </p>
      </section>

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <div className="space-y-3">
          {facts.map((fact) => (
            <div key={fact.label} className="detail-fact-row">
              <span className="text-sm text-[var(--text-secondary)]">{fact.label}</span>
              <span className="text-right text-sm font-semibold text-[var(--text-primary)]">{fact.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">备注</p>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.notes || '暂无备注'}</p>
      </section>

      {pendingAction ? (
        <section className="glass-panel rounded-[28px] px-4 py-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">确认标记为「{pendingAction.label}」</p>
              <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">可给这次处理留一句备注，也可以直接确认。</p>
            </div>
            <button type="button" className="icon-badge bg-[var(--surface-subtle)]" aria-label="关闭处理面板" onClick={() => setPendingResolution(undefined)}>
              <X size={15} />
            </button>
          </div>
          <textarea
            className="form-input min-h-[92px] resize-none py-3"
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
            placeholder="例如：今晚已用完、包装破损已丢弃、分给同事了"
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="secondary-chip justify-center" onClick={() => setPendingResolution(undefined)}>
              取消
            </button>
            <button type="button" className="primary-chip justify-center" onClick={handleConfirmResolution}>
              确认处理
            </button>
          </div>
        </section>
      ) : null}

      {deleteConfirmOpen ? (
        <section className="glass-panel rounded-[28px] px-4 py-4">
          <p className="text-sm font-bold text-[var(--danger)]">确认删除「{item.name}」？</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">删除后首页、列表和详情都会同步更新，这条记录不会进入历史。</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="secondary-chip justify-center" onClick={() => setDeleteConfirmOpen(false)}>
              取消
            </button>
            <button type="button" className="danger-chip" onClick={handleDelete}>
              <Trash2 size={16} />
              删除
            </button>
          </div>
        </section>
      ) : null}

      {isResolved ? (
        <section className="grid grid-cols-2 gap-3">
          <button type="button" className="primary-chip justify-center" onClick={handleRestore}>
            <RotateCcw size={16} />
            恢复追踪
          </button>
          <button type="button" className="secondary-chip justify-center" onClick={() => setDeleteConfirmOpen(true)}>
            <Trash2 size={16} />
            删除
          </button>
        </section>
      ) : (
        <section className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {resolutionActions.map(({ icon: Icon, label, resolution }) => (
              <button key={resolution} type="button" className="data-action min-h-[74px]" onClick={() => openResolutionPanel(resolution)}>
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to={`/items/${item.id}/edit`} className="primary-chip justify-center">
              <PencilLine size={16} />
              编辑
            </Link>
            <button type="button" className="secondary-chip justify-center" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 size={16} />
              删除
            </button>
          </div>
        </section>
      )}
    </div>
  )
}