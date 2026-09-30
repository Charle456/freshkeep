import { ImagePlus, Save } from 'lucide-react'
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Empty from '@/components/Empty'
import { readImageFileAsDataUrl, sanitizeStoreImageSource } from '@/features/inventory/image-storage'
import {
  COMMON_CATEGORIES,
  calculateExpiryDate,
  formatFullDate,
  type InventoryFormValues,
} from '@/features/inventory/model'
import { useInventoryStore } from '@/stores/useInventoryStore'

interface FormErrors {
  category?: string
  name?: string
  productionDate?: string
  shelfLifeDays?: string
}

function createDefaultValues(): InventoryFormValues {
  return {
    name: '',
    category: '',
    productionDate: '',
    shelfLifeDays: 7,
    imageUrl: '',
    notes: '',
  }
}

export default function ItemForm() {
  const navigate = useNavigate()
  const { itemId } = useParams()
  const items = useInventoryStore((state) => state.items)
  const upsertItem = useInventoryStore((state) => state.upsertItem)
  const editingItem = items.find((item) => item.id === itemId)
  const isEditing = Boolean(itemId)

  const [values, setValues] = useState<InventoryFormValues>(createDefaultValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [imageMessage, setImageMessage] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (!editingItem) {
      setValues(createDefaultValues())
      setImagePreview('')
      setImageMessage('')
      return
    }

    setValues({
      name: editingItem.name,
      category: editingItem.category,
      productionDate: editingItem.productionDate,
      shelfLifeDays: editingItem.shelfLifeDays,
      imageUrl: editingItem.imageUrl,
      notes: editingItem.notes,
    })
    const safeImageUrl = sanitizeStoreImageSource(editingItem.imageUrl)
    setValues((current) => ({ ...current, imageUrl: safeImageUrl }))
    setImagePreview(safeImageUrl)
    setImageMessage('')
  }, [editingItem])

  const categorySuggestions = useMemo(() => {
    const categories = Array.from(new Set([...items.map((item) => item.category), ...COMMON_CATEGORIES]))
    return categories.slice(0, 10)
  }, [items])

  if (isEditing && !editingItem) {
    return (
      <Empty
        title="未找到要编辑的记录"
        description="这条记录可能已被删除。你可以新建一条物品记录，或先回到列表确认数据是否存在。"
        actionLabel="返回全部记录"
        actionTo="/inventory"
      />
    )
  }

  const updateField = <K extends keyof InventoryFormValues>(field: K, value: InventoryFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const result = await readImageFileAsDataUrl(file)
      updateField('imageUrl', result)
      setImagePreview(result)
      setImageMessage('')
    } catch (error) {
      setImageMessage(error instanceof Error ? error.message : '图片上传失败，请重新选择')
    } finally {
      event.target.value = ''
    }
  }

  const validate = () => {
    const nextErrors: FormErrors = {}

    if (!values.name.trim()) {
      nextErrors.name = '请输入物品名称'
    }

    if (!values.category.trim()) {
      nextErrors.category = '请输入分类'
    }

    if (!values.productionDate) {
      nextErrors.productionDate = '请选择生产日期'
    }

    if (!Number.isFinite(Number(values.shelfLifeDays)) || Number(values.shelfLifeDays) <= 0) {
      nextErrors.shelfLifeDays = '保质期必须是大于 0 的天数'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const predictedExpiryDate = values.productionDate
    ? calculateExpiryDate(values.productionDate, Number(values.shelfLifeDays || 0))
    : ''

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    const savedId = upsertItem({ ...values, imageUrl: sanitizeStoreImageSource(values.imageUrl) }, editingItem?.id)
    navigate(`/items/${savedId}`, { replace: true })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <section className="glass-panel rounded-[28px] px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">图片预览</p>
            <p className="text-sm text-[var(--text-secondary)]">支持上传本地图片，图片会随这台设备上的记录一起保存。</p>
          </div>
          <label className="icon-button cursor-pointer" aria-label="上传图片">
            <ImagePlus size={18} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <div className="upload-panel">
          {imagePreview ? (
            <img src={imagePreview} alt="物品预览" className="upload-preview-image" />
          ) : (
            <div className="upload-placeholder">
              <ImagePlus size={22} />
              <span>上传后在这里查看图片</span>
            </div>
          )}
        </div>
        {imageMessage ? <p className="mt-3 text-sm font-semibold text-[var(--danger)]">{imageMessage}</p> : null}

      </section>

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <div className="grid grid-cols-1 gap-4">
          <label>
            <span className="form-label">物品名称</span>
            <input
              className="form-input"
              type="text"
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="例如：酸奶、薯片、退热贴"
            />
            {errors.name ? <span className="form-error">{errors.name}</span> : null}
          </label>

          <label>
            <span className="form-label">分类</span>
            <input
              className="form-input"
              type="text"
              value={values.category}
              onChange={(event) => updateField('category', event.target.value)}
              placeholder="例如：零食、药品、日化用品"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              {categorySuggestions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            {errors.category ? <span className="form-error">{errors.category}</span> : null}
          </label>

          <label>
            <span className="form-label">生产日期</span>
            <input
              className="form-input"
              type="date"
              value={values.productionDate}
              onChange={(event) => updateField('productionDate', event.target.value)}
            />
            {errors.productionDate ? <span className="form-error">{errors.productionDate}</span> : null}
          </label>

          <label>
            <span className="form-label">保质期（天）</span>
            <input
              className="form-input"
              type="number"
              min="1"
              value={values.shelfLifeDays}
              onChange={(event) => updateField('shelfLifeDays', Number(event.target.value))}
              placeholder="例如：7"
            />
            {errors.shelfLifeDays ? <span className="form-error">{errors.shelfLifeDays}</span> : null}
          </label>

          <label>
            <span className="form-label">备注</span>
            <textarea
              className="form-input min-h-[104px] resize-none py-3"
              value={values.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="补充保存方式、使用建议、药品复核提醒或风险说明"
            />
          </label>
        </div>
      </section>

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">保存预览</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          保存时会自动根据生产日期和保质期计算过期日期，并同步更新首页任务、Fresh Score、全部记录和详情状态。食品、零食、药物、保健品和日化用品都可以记录。
        </p>
        <div className="mt-4 rounded-[22px] bg-[var(--surface-subtle)] px-4 py-4">
          <p className="text-xs font-bold text-[var(--text-muted)]">预计过期日期</p>
          <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
            {predictedExpiryDate ? formatFullDate(predictedExpiryDate) : '填写日期后自动计算'}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link to={editingItem ? `/items/${editingItem.id}` : '/inventory'} className="secondary-chip justify-center">
          取消
        </Link>
        <button type="submit" className="primary-chip justify-center">
          <Save size={16} />
          {editingItem ? '保存修改' : '创建记录'}
        </button>
      </section>
    </form>
  )
}
