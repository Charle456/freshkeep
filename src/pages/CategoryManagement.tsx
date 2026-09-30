import { Save } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import Empty from '@/components/Empty'
import { COMMON_CATEGORIES } from '@/features/inventory/model'
import { useInventoryStore } from '@/stores/useInventoryStore'

export default function CategoryManagement() {
  const items = useInventoryStore((state) => state.items)
  const renameCategory = useInventoryStore((state) => state.renameCategory)
  const [editingCategory, setEditingCategory] = useState('')
  const [nextCategory, setNextCategory] = useState('')
  const [message, setMessage] = useState('')

  const categories = useMemo(() => {
    const usage = new Map<string, number>()

    items.forEach((item) => {
      usage.set(item.category, (usage.get(item.category) ?? 0) + 1)
    })

    COMMON_CATEGORIES.forEach((category) => {
      usage.set(category, usage.get(category) ?? 0)
    })

    return Array.from(usage.entries())
      .map(([name, count]) => ({ count, name }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'zh-CN'))
  }, [items])

  const beginEdit = (category: string) => {
    setEditingCategory(category)
    setNextCategory(category)
    setMessage('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingCategory || !nextCategory.trim()) {
      setMessage('请输入新的分类名称。')
      return
    }

    renameCategory(editingCategory, nextCategory)
    setMessage(`已将「${editingCategory}」改为「${nextCategory.trim()}」。`)
    setEditingCategory('')
    setNextCategory('')
  }

  if (categories.length === 0) {
    return (
      <Empty
        title="还没有分类"
        description="新增第一件物品后，FreshKeep 会自动整理分类和使用数量。"
        actionLabel="新增物品"
        actionTo="/items/new"
      />
    )
  }

  return (
    <div className="space-y-4">
      <section className="plan-card plan-card-mint px-4 py-4">
        <p className="text-lg font-[800] text-[var(--text-primary)]">分类管理</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
          MVP 阶段分类来自已有记录和常用模板。重命名会同步更新当前所有匹配物品。
        </p>
      </section>

      {editingCategory ? (
        <form className="glass-panel rounded-[28px] px-4 py-4" onSubmit={handleSubmit}>
          <label>
            <span className="form-label">重命名分类</span>
            <input className="form-input" value={nextCategory} onChange={(event) => setNextCategory(event.target.value)} />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="secondary-chip justify-center" onClick={() => setEditingCategory('')}>
              取消
            </button>
            <button type="submit" className="primary-chip justify-center">
              <Save size={16} />
              保存
            </button>
          </div>
        </form>
      ) : null}

      {message ? <p className="rounded-[18px] bg-white px-4 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-card)]">{message}</p> : null}

      <section className="space-y-3">
        {categories.map((category) => (
          <button key={category.name} type="button" className="category-row" onClick={() => beginEdit(category.name)}>
            <span>
              <span className="block text-sm font-bold text-[var(--text-primary)]">{category.name}</span>
              <span className="block text-sm text-[var(--text-secondary)]">{category.count > 0 ? category.count + ' 条记录' : '常用模板'}</span>
            </span>
            <span className="soft-chip">重命名</span>
          </button>
        ))}
      </section>
    </div>
  )
}
