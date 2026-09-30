import assert from 'node:assert/strict'
import test from 'node:test'

import * as inventoryModel from '../src/features/inventory/model.ts'

const {
  createInventoryRecord,
  decorateInventoryItem,
  getItemStatus,
  restoreInventoryRecord,
  resolveInventoryRecord,
} = inventoryModel
import {
  exportInventoryToCsv,
  exportInventoryToJson,
  parseInventoryImport,
  previewInventoryImport,
} from '../src/features/inventory/data-portability.ts'
import {
  buildPortableFileName,
  getBackupStatusText,
} from '../src/features/inventory/mobile-data-actions.ts'

const baseValues = {
  name: 'Milk, oat',
  category: '冷藏食品',
  productionDate: '2026-06-20',
  shelfLifeDays: 10,
  imageUrl: '',
  notes: 'Keep "upright"',
}

test('resolved inventory records decorate as handled history', () => {
  const record = createInventoryRecord(baseValues, 'item-1')
  const resolved = resolveInventoryRecord(record, 'used', 'Finished breakfast', new Date('2026-06-24T08:00:00.000Z'))
  const view = decorateInventoryItem(resolved, new Date('2026-06-25T08:00:00.000Z'))

  assert.equal(view.status, 'resolved')
  assert.equal(view.statusLabel, '已处理')
  assert.equal(view.riskLabel, '已完成')
  assert.match(view.questText, /Finished breakfast/)
})

test('restoring a resolved inventory record returns it to active tracking', () => {
  const record = createInventoryRecord(baseValues, 'item-2')
  const resolved = resolveInventoryRecord(record, 'discarded', '', new Date('2026-06-24T08:00:00.000Z'))
  const restored = restoreInventoryRecord(resolved)

  assert.equal(restored.resolvedAt, undefined)
  assert.equal(restored.resolution, undefined)
  assert.equal(restored.resolutionNote, undefined)
})

test('inventory JSON export can be imported back into records', () => {
  const record = createInventoryRecord(baseValues, 'item-3')
  const payload = exportInventoryToJson([record], new Date('2026-06-24T08:00:00.000Z'))
  const imported = parseInventoryImport(payload)

  assert.equal(imported.length, 1)
  assert.equal(imported[0].id, 'item-3')
  assert.equal(imported[0].name, 'Milk, oat')
})


test('inventory import preview summarizes replacement before records are applied', () => {
  const record = createInventoryRecord(baseValues, 'item-preview')
  const payload = exportInventoryToJson([record], new Date('2026-06-24T08:00:00.000Z'))
  const preview = previewInventoryImport(payload, 3)

  assert.equal(preview.records.length, 1)
  assert.equal(preview.currentCount, 3)
  assert.equal(preview.incomingCount, 1)
  assert.equal(preview.summaryText, '将从备份恢复 1 条记录')
  assert.equal(preview.warningText, '确认后会替换当前本机 3 条记录。')
})
test('inventory import rejects files without valid records', () => {
  assert.throws(() => parseInventoryImport('{"records":[{"id":12}]}'), /没有找到可导入的记录/)
})

test('CSV export escapes commas and quotes', () => {
  const record = createInventoryRecord(baseValues, 'item-4')
  const csv = exportInventoryToCsv([record])

  assert.match(csv, /"Milk, oat"/)
  assert.match(csv, /"Keep ""upright"""/)
})

test('portable backup filenames use mobile-friendly dated names', () => {
  const now = new Date('2026-06-29T12:30:00.000Z')

  assert.equal(buildPortableFileName('backup', now), 'freshkeep-backup-2026-06-29.json')
  assert.equal(buildPortableFileName('spreadsheet', now), 'freshkeep-table-2026-06-29.csv')
})

test('backup status text explains local app state', () => {
  assert.equal(getBackupStatusText(undefined), '尚未备份')
  assert.equal(getBackupStatusText('2026-06-29T12:30:00'), '上次备份：2026/06/29 12:30')
})


test('configurable reminder window changes item warning status', () => {
  const today = new Date('2026-06-30T08:00:00.000Z')

  assert.equal(getItemStatus('2026-07-06', today, 3), 'safe')
  assert.equal(getItemStatus('2026-07-06', today, 7), 'warning')
})

test('insight cards derive active category and completion from inventory views', () => {
  const today = new Date('2026-06-30T08:00:00.000Z')
  const snackOne = createInventoryRecord({ ...baseValues, name: '海盐薯片', category: '零食', productionDate: '2026-06-28', shelfLifeDays: 4 }, 'snack-1')
  const snackTwo = createInventoryRecord({ ...baseValues, name: '坚果罐', category: '零食', productionDate: '2026-06-20', shelfLifeDays: 30 }, 'snack-2')
  const medicine = createInventoryRecord({ ...baseValues, name: '退热贴', category: '药品', productionDate: '2026-06-10', shelfLifeDays: 20 }, 'medicine-1')
  const resolved = resolveInventoryRecord(medicine, 'used', '', new Date('2026-06-30T09:00:00.000Z'))
  const views = [snackOne, snackTwo, resolved].map((item) => decorateInventoryItem(item, today, 3))

  const cards = inventoryModel.getInsightCards(views)

  assert.equal(cards.find((card) => card.title === '最活跃分类')?.value, '零食')
  assert.equal(cards.find((card) => card.title === '处理完成率')?.value, '33%')
})