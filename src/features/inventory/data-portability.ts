import type { InventoryRecord } from './model.ts'
import { isInventoryRecord } from './model.ts'

export interface InventoryImportPreview {
  currentCount: number
  incomingCount: number
  records: InventoryRecord[]
  summaryText: string
  warningText: string
}

interface InventoryExportPayload {
  app: 'FreshKeep'
  version: 1
  exportedAt: string
  records: InventoryRecord[]
}

const CSV_COLUMNS: Array<{ key: keyof InventoryRecord; label: string }> = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '名称' },
  { key: 'category', label: '分类' },
  { key: 'productionDate', label: '生产日期' },
  { key: 'shelfLifeDays', label: '保质期天数' },
  { key: 'expiryDate', label: '过期日期' },
  { key: 'notes', label: '备注' },
  { key: 'resolvedAt', label: '处理时间' },
  { key: 'resolution', label: '处理方式' },
  { key: 'resolutionNote', label: '处理备注' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'updatedAt', label: '更新时间' },
]

function getImportCandidates(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) {
    return parsed
  }

  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { records?: unknown }).records)) {
    return (parsed as { records: unknown[] }).records
  }

  return []
}

function escapeCsvValue(value: unknown) {
  const normalized = value === undefined || value === null ? '' : String(value)
  return '"' + normalized.replace(/"/g, '""') + '"'
}

export function exportInventoryToJson(records: InventoryRecord[], exportedAt: Date = new Date()) {
  const payload: InventoryExportPayload = {
    app: 'FreshKeep',
    version: 1,
    exportedAt: exportedAt.toISOString(),
    records,
  }

  return JSON.stringify(payload, null, 2)
}

export function parseInventoryImport(raw: string): InventoryRecord[] {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('导入文件不是有效的 JSON')
  }

  const records = getImportCandidates(parsed).filter(isInventoryRecord)

  if (records.length === 0) {
    throw new Error('没有找到可导入的记录')
  }

  return records
}


export function previewInventoryImport(raw: string, currentCount: number): InventoryImportPreview {
  const records = parseInventoryImport(raw)

  return {
    currentCount,
    incomingCount: records.length,
    records,
    summaryText: `将从备份恢复 ${records.length} 条记录`,
    warningText: `确认后会替换当前本机 ${currentCount} 条记录。`,
  }
}
export function exportInventoryToCsv(records: InventoryRecord[]) {
  const header = CSV_COLUMNS.map((column) => escapeCsvValue(column.label)).join(',')
  const rows = records.map((record) =>
    CSV_COLUMNS.map((column) => escapeCsvValue(record[column.key])).join(','),
  )

  return [header, ...rows].join('\n')
}

