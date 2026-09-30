import { Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Empty from '@/components/Empty'
import { InventoryCard } from '@/components/InventoryCard'
import {
  decorateInventoryItem,
  filterInventoryItems,
  getCategoryOptions,
  getStatusOptions,
  groupInventoryItems,
  sortByPriority,
} from '@/features/inventory/model'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useInventoryStore } from '@/stores/useInventoryStore'

export default function Inventory() {
  const items = useInventoryStore((state) => state.items)
  const { settings } = useAppSettings()
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all')
  const [status, setStatus] = useState(searchParams.get('status') ?? 'all')

  const decoratedItems = useMemo(() => sortByPriority(items.map((item) => decorateInventoryItem(item, new Date(), settings.reminderDays))), [items, settings.reminderDays])
  const categoryOptions = useMemo(() => getCategoryOptions(decoratedItems), [decoratedItems])
  const statusOptions = useMemo(() => getStatusOptions(), [])
  const filteredItems = useMemo(
    () => filterInventoryItems(decoratedItems, keyword, category, status),
    [category, decoratedItems, keyword, status],
  )
  const groupedItems = useMemo(() => groupInventoryItems(filteredItems), [filteredItems])

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-[var(--surface-subtle)] px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-[800] text-[var(--text-primary)]">Find fresh things</p>
            <p className="text-sm text-[var(--text-secondary)]">按状态和分类给冰箱做一次轻巡检。</p>
          </div>
          <span className="icon-badge bg-white">
            <SlidersHorizontal size={16} />
          </span>
        </div>

        <label className="search-shell">
          <Search size={16} />
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索物品、分类或备注"
            aria-label="搜索物品"
          />
        </label>

        <div className="mt-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={status === option.value ? 'soft-chip soft-chip-active' : 'soft-chip'}
                type="button"
                onClick={() => setStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                className={category === option.value ? 'soft-chip soft-chip-active' : 'soft-chip'}
                type="button"
                onClick={() => setCategory(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filteredItems.length > 0 ? (
        groupedItems.map((group) => (
          <section key={group.key} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-[800] text-[var(--text-primary)]">{group.title}</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">{group.items.length} 条</span>
            </div>
            {group.items.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </section>
        ))
      ) : (
        <Empty
          title="没有找到匹配记录"
          description="可以尝试调整关键词、分类或状态筛选，或者新增一条物品记录。"
          actionLabel="新增物品"
          actionTo="/items/new"
        />
      )}
    </div>
  )
}
