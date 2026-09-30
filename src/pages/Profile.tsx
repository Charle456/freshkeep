import { BellRing, ChevronRight, Database, FolderCog, Info, Moon, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_METADATA } from '@/data/app-metadata'
import { decorateInventoryItem, getFreshScore, sortByPriority } from '@/features/inventory/model'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useInventoryStore } from '@/stores/useInventoryStore'

const avatarUrl = '/images/freshkeep-avatar.svg'

const settingGroups = [
  {
    title: '应用设置',
    items: [
      { label: '临期提醒设置', helper: '调整提醒窗口和摘要', to: '/settings/reminders', icon: BellRing },
      { label: '分类管理', helper: '查看分类使用量并重命名', to: '/settings/categories', icon: FolderCog },
      { label: '外观偏好', helper: '跟随系统、浅色或深色模式', to: '/settings/appearance', icon: Moon },
    ],
  },
  {
    title: '数据与隐私',
    items: [
      { label: '导入 / 导出数据', helper: 'JSON 备份、CSV 表格、清空记录', to: '/settings/data', icon: Database },
      { label: '隐私与本地存储', helper: '了解当前 MVP 如何保存数据', to: '/about', icon: ShieldCheck },
      { label: '关于 FreshKeep', helper: `版本 ${APP_METADATA.version} 与支持信息`, to: '/about', icon: Info },
    ],
  },
]

export default function Profile() {
  const items = useInventoryStore((state) => state.items)
  const { settings } = useAppSettings()
  const decoratedItems = sortByPriority(items.map((item) => decorateInventoryItem(item, new Date(), settings.reminderDays)))
  const activeItems = decoratedItems.filter((item) => item.status !== 'resolved')
  const handledCount = decoratedItems.length - activeItems.length
  const freshScore = getFreshScore(activeItems)
  const categoryCount = new Set(decoratedItems.map((item) => item.category)).size
  const sparkCount = activeItems.filter((item) => item.status !== 'safe').length
  const statCards = [
    { label: 'Fresh score', value: freshScore + '%', tone: 'bg-[var(--surface-mint)]' },
    { label: 'Active items', value: String(activeItems.length).padStart(2, '0'), tone: 'bg-[var(--surface-aqua)]' },
    { label: 'Handled', value: String(handledCount).padStart(2, '0'), tone: 'bg-[var(--surface-orange)]' },
  ]

  return (
    <div className="space-y-4">
      <section className="rounded-[26px] bg-white px-4 py-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="avatar h-[58px] w-[58px]">
              <img src={avatarUrl} alt="FreshKeep profile" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-[800] text-[var(--text-primary)]">{settings.profileName}</h2>
              <p className="text-sm font-semibold text-[var(--text-muted)]">
                {sparkCount} 个任务在等你巡检，覆盖 {categoryCount} 类物品
              </p>
            </div>
          </div>
          <span className="icon-button">
            <Sparkles size={18} />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {statCards.map((card) => (
            <article key={card.label} className={card.tone + ' rounded-[18px] px-3 py-3'}>
              <p className="text-[11px] font-bold leading-tight text-[var(--text-secondary)]">{card.label}</p>
              <p className="mt-2 text-xl font-[800] leading-none text-[var(--text-primary)]">{card.value}</p>
            </article>
          ))}
        </div>
      </section>

      {settingGroups.map((group) => (
        <section key={group.title} className="rounded-[24px] bg-white px-4 py-4 shadow-[var(--shadow-card)]">
          <p className="text-sm font-[800] text-[var(--text-primary)]">{group.title}</p>
          <div className="mt-2 divide-y divide-[rgba(24,25,31,0.08)]">
            {group.items.map(({ helper, icon: Icon, label, to }) => (
              <Link key={label} to={to} className="settings-row no-underline">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="icon-badge bg-[var(--surface-subtle)]">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{label}</span>
                    <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{helper}</span>
                  </span>
                </span>
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
