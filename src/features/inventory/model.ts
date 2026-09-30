import type { ReactNode } from 'react'

export type ItemStatus = 'safe' | 'warning' | 'expired' | 'resolved'
export type AccentTone = 'indigo' | 'orange' | 'mint'
export type RiskLevel = 'fresh' | 'watch' | 'urgent' | 'expired' | 'resolved'
export type ItemResolution = 'used' | 'discarded' | 'donated'

export const REMINDER_WINDOW_DAYS = 3

export const COMMON_CATEGORIES = ['冷藏食品', '零食', '药品', '保健品', '日化用品', '调味酱料', '水果', '婴童用品']

export interface InventoryRecord {
  id: string
  name: string
  category: string
  productionDate: string
  shelfLifeDays: number
  expiryDate: string
  imageUrl: string
  notes: string
  resolvedAt?: string
  resolution?: ItemResolution
  resolutionNote?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryFormValues {
  name: string
  category: string
  productionDate: string
  shelfLifeDays: number
  imageUrl: string
  notes: string
}

export interface InventoryItemView extends InventoryRecord {
  accent: AccentTone
  daysLeft: number
  expiresAtText: string
  freshnessPercent: number
  questText: string
  remainingText: string
  riskLevel: RiskLevel
  riskLabel: string
  status: ItemStatus
  statusLabel: string
}

export interface InventoryMetric {
  label: string
  value: string
  helper: string
  tone: AccentTone
  to: string
}

export interface InsightCard {
  title: string
  value: string
  description: string
}

export interface FilterOption {
  label: string
  value: string
}

export interface DetailFact {
  label: string
  value: string | ReactNode
}

export const FALLBACK_ITEM_IMAGE = '/images/freshkeep-item.svg'

export function parseLocalDate(dateLike: string) {
  const [year, month, day] = dateLike.split('-').map(Number)

  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return new Date(dateLike)
  }

  return new Date(year, month - 1, day)
}

export function startOfDay(input: Date | string) {
  const date = typeof input === 'string' ? parseLocalDate(input) : new Date(input)
  date.setHours(0, 0, 0, 0)
  return date
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(input: Date | string, days: number) {
  const date = startOfDay(input)
  date.setDate(date.getDate() + days)
  return date
}

export function diffInDays(target: Date | string, base: Date | string = new Date()) {
  const msPerDay = 1000 * 60 * 60 * 24
  const distance = startOfDay(target).getTime() - startOfDay(base).getTime()
  return Math.round(distance / msPerDay)
}

export function formatDisplayDate(dateLike: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
  }).format(parseLocalDate(dateLike))
}

export function formatFullDate(dateLike: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parseLocalDate(dateLike))
}

export function calculateExpiryDate(productionDate: string, shelfLifeDays: number) {
  return formatDateInput(addDays(productionDate, shelfLifeDays))
}

export function getItemStatus(expiryDate: string, today: Date = new Date(), reminderWindowDays = REMINDER_WINDOW_DAYS): ItemStatus {
  const daysLeft = diffInDays(expiryDate, today)

  if (daysLeft < 0) {
    return 'expired'
  }

  if (daysLeft <= reminderWindowDays) {
    return 'warning'
  }

  return 'safe'
}

export function getStatusLabel(status: ItemStatus) {
  if (status === 'resolved') {
    return '已处理'
  }

  if (status === 'expired') {
    return '已过期'
  }

  if (status === 'warning') {
    return '即将临期'
  }

  return '状态正常'
}

export function getAccentTone(status: ItemStatus): AccentTone {
  if (status === 'resolved') {
    return 'mint'
  }

  if (status === 'expired') {
    return 'indigo'
  }

  if (status === 'warning') {
    return 'orange'
  }

  return 'mint'
}

export function getFreshnessPercent(record: Pick<InventoryRecord, 'productionDate' | 'expiryDate' | 'shelfLifeDays'>, today: Date = new Date()) {
  if (diffInDays(record.expiryDate, today) < 0) {
    return 0
  }

  const totalDays = Math.max(1, record.shelfLifeDays)
  const elapsedDays = Math.max(0, diffInDays(today, record.productionDate))
  const percent = Math.round(((totalDays - elapsedDays) / totalDays) * 100)
  return Math.min(100, Math.max(0, percent))
}

export function getRiskLevel(status: ItemStatus, freshnessPercent: number): RiskLevel {
  if (status === 'resolved') {
    return 'resolved'
  }

  if (status === 'expired') {
    return 'expired'
  }

  if (status === 'warning') {
    return 'urgent'
  }

  if (freshnessPercent <= 45) {
    return 'watch'
  }

  return 'fresh'
}

export function getRiskLabel(riskLevel: RiskLevel) {
  if (riskLevel === 'resolved') {
    return '已完成'
  }

  if (riskLevel === 'expired') {
    return '任务失败'
  }

  if (riskLevel === 'urgent') {
    return '紧急关卡'
  }

  if (riskLevel === 'watch') {
    return '注意观察'
  }

  return '状态满格'
}

export function getResolutionLabel(resolution?: ItemResolution) {
  if (resolution === 'discarded') {
    return '已丢弃'
  }

  if (resolution === 'donated') {
    return '已分享'
  }

  return '已使用'
}

export function getQuestText(item: Pick<InventoryRecord, 'category' | 'name'>, status: ItemStatus, daysLeft: number) {
  if (status === 'resolved') {
    return `${item.name} 已完成处理，保留在历史记录中`
  }

  if (status === 'expired') {
    return `清理 ${item.name}，把风险从收纳站移走`
  }

  if (status === 'warning') {
    if (item.category.includes('药')) {
      return `复核 ${item.name}，确认是否还能安全使用`
    }

    if (item.category.includes('日化') || item.category.includes('婴童')) {
      return `安排 ${item.name}，别让它悄悄过期`
    }

    return `优先使用 ${item.name}，完成今日保鲜任务`
  }

  return daysLeft > 14 ? '库存很稳，保持巡检节奏' : '进入观察区，下一轮轻检查关注它'
}

export function getFreshScore(items: InventoryItemView[]) {
  if (items.length === 0) {
    return 100
  }

  const averageFreshness = items.reduce((total, item) => total + item.freshnessPercent, 0) / items.length
  const expiredPenalty = items.filter((item) => item.status === 'expired').length * 12
  const warningPenalty = items.filter((item) => item.status === 'warning').length * 6
  return Math.max(0, Math.min(100, Math.round(averageFreshness - expiredPenalty - warningPenalty)))
}

export function getRemainingText(daysLeft: number, reminderWindowDays = REMINDER_WINDOW_DAYS) {
  if (daysLeft < 0) {
    return `已过期 ${Math.abs(daysLeft)} 天，需要立刻处理`
  }

  if (daysLeft === 0) {
    return '今天到期，建议优先处理'
  }

  if (daysLeft <= reminderWindowDays) {
    return `还有 ${daysLeft} 天，请尽快使用`
  }

  return `还有 ${daysLeft} 天，可继续观察`
}

export function decorateInventoryItem(record: InventoryRecord, today: Date = new Date(), reminderWindowDays = REMINDER_WINDOW_DAYS): InventoryItemView {
  const daysLeft = diffInDays(record.expiryDate, today)
  const status: ItemStatus = record.resolvedAt ? 'resolved' : getItemStatus(record.expiryDate, today, reminderWindowDays)
  const freshnessPercent = getFreshnessPercent(record, today)
  const riskLevel = getRiskLevel(status, freshnessPercent)
  const resolutionLabel = record.resolvedAt ? getResolutionLabel(record.resolution) : ''
  const resolutionText = record.resolutionNote?.trim()

  return {
    ...record,
    imageUrl: normalizeImageUrl(record.imageUrl),
    accent: getAccentTone(status),
    daysLeft,
    freshnessPercent,
    questText: record.resolvedAt
      ? `${resolutionLabel}${resolutionText ? '：' + resolutionText : '，保留在历史记录中'}`
      : getQuestText(record, status, daysLeft),
    riskLevel,
    riskLabel: getRiskLabel(riskLevel),
    expiresAtText: `${formatDisplayDate(record.expiryDate)}到期`,
    remainingText: getRemainingText(daysLeft, reminderWindowDays),
    status,
    statusLabel: getStatusLabel(status),
  }
}

export function sortByPriority(items: InventoryItemView[]) {
  return [...items].sort((left, right) => {
    const statusRank = {
      expired: 0,
      warning: 1,
      safe: 2,
      resolved: 3,
    }

    const statusGap = statusRank[left.status] - statusRank[right.status]

    if (statusGap !== 0) {
      return statusGap
    }

    if (left.daysLeft !== right.daysLeft) {
      return left.daysLeft - right.daysLeft
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  })
}

export function matchesKeyword(item: InventoryItemView, keyword: string) {
  const normalized = keyword.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  return [item.name, item.category, item.notes].some((value) => value.toLowerCase().includes(normalized))
}

export function filterInventoryItems(
  items: InventoryItemView[],
  keyword: string,
  category: string,
  status: string,
) {
  return items.filter((item) => {
    const categoryMatch = category === 'all' || item.category === category
    const statusMatch = status === 'all' || item.status === status
    return categoryMatch && statusMatch && matchesKeyword(item, keyword)
  })
}

export function groupInventoryItems(items: InventoryItemView[]) {
  const groups = [
    { key: 'expired', title: '已过期', items: items.filter((item) => item.status === 'expired') },
    { key: 'warning', title: '即将临期', items: items.filter((item) => item.status === 'warning') },
    { key: 'safe', title: '状态正常', items: items.filter((item) => item.status === 'safe') },
    { key: 'resolved', title: '已处理', items: items.filter((item) => item.status === 'resolved') },
  ]

  return groups.filter((group) => group.items.length > 0)
}

export function getCategoryOptions(items: InventoryItemView[]): FilterOption[] {
  const categories = Array.from(new Set([...items.map((item) => item.category), ...COMMON_CATEGORIES]))
  return [{ label: '全部分类', value: 'all' }, ...categories.map((category) => ({ label: category, value: category }))]
}

export function getStatusOptions(): FilterOption[] {
  return [
    { label: '全部状态', value: 'all' },
    { label: '即将临期', value: 'warning' },
    { label: '已过期', value: 'expired' },
    { label: '状态正常', value: 'safe' },
    { label: '已处理', value: 'resolved' },
  ]
}

export function getOverviewMetrics(items: InventoryItemView[], reminderWindowDays = REMINDER_WINDOW_DAYS): InventoryMetric[] {
  const warningCount = items.filter((item) => item.status === 'warning').length
  const expiredCount = items.filter((item) => item.status === 'expired').length
  const allCount = items.length

  return [
    {
      label: '临期提醒',
      value: `${warningCount}`.padStart(2, '0'),
      helper: `未来 ${reminderWindowDays} 天内建议优先处理的物品`,
      tone: 'orange',
      to: '/inventory?status=warning',
    },
    {
      label: '已过期',
      value: `${expiredCount}`.padStart(2, '0'),
      helper: '需要清理或复核的库存记录',
      tone: 'indigo',
      to: '/inventory?status=expired',
    },
    {
      label: '全部记录',
      value: `${allCount}`.padStart(2, '0'),
      helper: '覆盖食品、药品和其他日常用品',
      tone: 'mint',
      to: '/inventory',
    },
  ]
}

function getRiskPeakCard(items: InventoryItemView[]): InsightCard {
  const activeItems = items.filter((item) => item.status !== 'resolved')
  const priorityItems = sortByPriority(activeItems.filter((item) => item.status !== 'safe'))
  const peakItem = priorityItems[0] ?? sortByPriority(activeItems)[0]

  if (!peakItem) {
    return {
      title: '本周风险峰值',
      value: '暂无',
      description: '当前没有正在追踪的保质期任务。',
    }
  }

  const value = peakItem.daysLeft < 0 ? `超期 ${Math.abs(peakItem.daysLeft)} 天` : peakItem.daysLeft === 0 ? '今天' : peakItem.daysLeft === 1 ? '明天' : formatDisplayDate(peakItem.expiryDate)
  const description = peakItem.status === 'safe'
    ? `${peakItem.name} 状态稳定，继续按当前节奏巡检。`
    : `${peakItem.name} 是当前最需要关注的任务。`

  return {
    title: '本周风险峰值',
    value,
    description,
  }
}

function getMostActiveCategoryCard(items: InventoryItemView[]): InsightCard {
  const categoryCounts = new Map<string, number>()

  items.forEach((item) => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1)
  })

  const [topCategory, topCount] = Array.from(categoryCounts.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-CN'))[0] ?? []

  if (!topCategory) {
    return {
      title: '最活跃分类',
      value: '暂无',
      description: '新增物品后，这里会显示记录最多的分类。',
    }
  }

  return {
    title: '最活跃分类',
    value: topCategory,
    description: `${topCategory} 当前有 ${topCount} 条记录，适合优先整理和复核。`,
  }
}

function getCompletionRateCard(items: InventoryItemView[]): InsightCard {
  const handledCount = items.filter((item) => item.status === 'resolved').length
  const completionRate = items.length === 0 ? 100 : Math.round((handledCount / items.length) * 100)

  return {
    title: '处理完成率',
    value: `${completionRate}%`,
    description: handledCount > 0 ? `已完成 ${handledCount} 件保质期任务。` : '完成临期复核、使用或清理任务后，Fresh Score 会更好看。',
  }
}

export function getInsightCards(items: InventoryItemView[]): InsightCard[] {
  return [getRiskPeakCard(items), getMostActiveCategoryCard(items), getCompletionRateCard(items)]
}
export function createInventoryRecord(values: InventoryFormValues, existingId?: string): InventoryRecord {
  const now = new Date().toISOString()
  return {
    id: existingId ?? crypto.randomUUID(),
    name: values.name.trim(),
    category: values.category.trim(),
    productionDate: values.productionDate,
    shelfLifeDays: Number(values.shelfLifeDays),
    expiryDate: calculateExpiryDate(values.productionDate, Number(values.shelfLifeDays)),
    imageUrl: normalizeImageUrl(values.imageUrl),
    notes: values.notes.trim(),
    createdAt: now,
    updatedAt: now,
  }
}

export function updateInventoryRecord(record: InventoryRecord, values: InventoryFormValues): InventoryRecord {
  return {
    ...record,
    name: values.name.trim(),
    category: values.category.trim(),
    productionDate: values.productionDate,
    shelfLifeDays: Number(values.shelfLifeDays),
    expiryDate: calculateExpiryDate(values.productionDate, Number(values.shelfLifeDays)),
    imageUrl: normalizeImageUrl(values.imageUrl),
    notes: values.notes.trim(),
    updatedAt: new Date().toISOString(),
  }
}

export function isInventoryRecord(value: unknown): value is InventoryRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.category === 'string' &&
    typeof record.productionDate === 'string' &&
    typeof record.shelfLifeDays === 'number' &&
    typeof record.expiryDate === 'string' &&
    typeof record.imageUrl === 'string' &&
    typeof record.notes === 'string' &&
    (record.resolvedAt === undefined || typeof record.resolvedAt === 'string') &&
    (record.resolution === undefined || ['used', 'discarded', 'donated'].includes(String(record.resolution))) &&
    (record.resolutionNote === undefined || typeof record.resolutionNote === 'string') &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  )
}

export function resolveInventoryRecord(
  record: InventoryRecord,
  resolution: ItemResolution,
  resolutionNote = '',
  resolvedAt: Date = new Date(),
): InventoryRecord {
  const timestamp = resolvedAt.toISOString()

  return {
    ...record,
    resolvedAt: timestamp,
    resolution,
    resolutionNote: resolutionNote.trim(),
    updatedAt: timestamp,
  }
}

export function restoreInventoryRecord(record: InventoryRecord): InventoryRecord {
  const { resolvedAt, resolution, resolutionNote, ...activeRecord } = record

  void resolvedAt
  void resolution
  void resolutionNote

  return {
    ...activeRecord,
    updatedAt: new Date().toISOString(),
  }
}

function normalizeImageUrl(imageUrl: string) {
  const trimmed = imageUrl.trim()
  return trimmed || FALLBACK_ITEM_IMAGE
}

function createSampleRecord(
  values: Omit<InventoryFormValues, 'productionDate'> & { productionOffsetDays: number },
): InventoryRecord {
  const productionDate = formatDateInput(addDays(new Date(), values.productionOffsetDays))

  return createInventoryRecord({
    ...values,
    productionDate,
  })
}

export function getSampleInventory() {
  return [
    createSampleRecord({
      name: '希腊酸奶',
      category: '冷藏食品',
      productionOffsetDays: -5,
      shelfLifeDays: 7,
      notes: '早餐使用频率最高，建议优先放到冰箱上层。',
      imageUrl: FALLBACK_ITEM_IMAGE,
    }),
    createSampleRecord({
      name: '草莓果盒',
      category: '水果',
      productionOffsetDays: -2,
      shelfLifeDays: 5,
      notes: '适合今晚优先做水果碗，避免继续积压。',
      imageUrl: FALLBACK_ITEM_IMAGE,
    }),
    createSampleRecord({
      name: '罗勒青酱',
      category: '调味酱料',
      productionOffsetDays: -8,
      shelfLifeDays: 7,
      notes: '已开封且超过保鲜期，建议及时处理。',
      imageUrl: FALLBACK_ITEM_IMAGE,
    }),
    createSampleRecord({
      name: '维生素软糖',
      category: '保健品',
      productionOffsetDays: -12,
      shelfLifeDays: 30,
      notes: '保持干燥环境即可，当前状态安全。',
      imageUrl: FALLBACK_ITEM_IMAGE,
    }),
    createSampleRecord({
      name: '海盐薯片',
      category: '零食',
      productionOffsetDays: -42,
      shelfLifeDays: 60,
      notes: '开封后建议夹紧封口，周末电影夜可以优先安排。',
      imageUrl: FALLBACK_ITEM_IMAGE,
    }),
    createSampleRecord({
      name: '儿童退热贴',
      category: '药品',
      productionOffsetDays: -320,
      shelfLifeDays: 365,
      notes: '药品临期先复核有效期和包装状态，不确定时不要继续使用。',
      imageUrl: FALLBACK_ITEM_IMAGE,
    }),
  ]
}

