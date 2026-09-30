import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import capacitorConfig from '../capacitor.config.ts'
import { APP_METADATA } from '../src/data/app-metadata.ts'
import { getRouterKind } from '../src/app/router.ts'
import {
  MAX_IMAGE_UPLOAD_BYTES,
  getImageUploadError,
  sanitizeStoreImageSource,
} from '../src/features/inventory/image-storage.ts'
import {
  FALLBACK_ITEM_IMAGE,
  createInventoryRecord,
  getSampleInventory,
} from '../src/features/inventory/model.ts'
import { buildReminderSchedule, buildReminderSyncPlan } from '../src/features/notifications/reminders.ts'
import {
  createMemoryStorage,
  safeGetStorageItem,
  safeSetStorageItem,
} from '../src/features/platform/runtime.ts'
import { persistTheme, resolveInitialTheme } from '../src/hooks/useTheme.ts'

function assertNoRemoteAssetUrl(value) {
  assert.doesNotMatch(value, /^https?:\/\//)
  assert.doesNotMatch(value, /trae\.ai|unsplash\.com|googleapis\.com/)
}

test('inventory fallback and sample images are bundled assets for store builds', () => {
  assertNoRemoteAssetUrl(FALLBACK_ITEM_IMAGE)

  for (const item of getSampleInventory()) {
    assertNoRemoteAssetUrl(item.imageUrl)
  }
})

test('app metadata exposes store review support and privacy basics', () => {
  assert.equal(APP_METADATA.name, 'FreshKeep')
  assert.match(APP_METADATA.version, /^\d+\.\d+\.\d+$/)
  assert.match(APP_METADATA.bundleId, /^[a-z][a-z0-9]*(\.[a-z][a-z0-9-]*)+$/)
  assert.match(APP_METADATA.supportEmail, /^[^@\s]+@[^@\s]+\.[^@\s]+$/)
  assert.equal(APP_METADATA.privacyPolicyPath, '/about')
  assert.match(APP_METADATA.dataStorageSummary, /stored on this device/)
})

test('router selection uses hash routing for Capacitor and file builds', () => {
  assert.equal(getRouterKind({ isNativePlatform: false, protocol: 'https:' }), 'browser')
  assert.equal(getRouterKind({ isNativePlatform: true, protocol: 'capacitor:' }), 'hash')
  assert.equal(getRouterKind({ isNativePlatform: false, protocol: 'file:' }), 'hash')
})

test('capacitor config targets the iOS app shell bundle', () => {
  assert.equal(capacitorConfig.appId, APP_METADATA.bundleId)
  assert.equal(capacitorConfig.appName, APP_METADATA.name)
  assert.equal(capacitorConfig.webDir, 'dist')
  assert.equal(capacitorConfig.plugins?.LocalNotifications?.presentationOptions?.includes('badge'), true)
})

test('safe storage helpers preserve app state when native storage is unavailable', () => {
  const memory = createMemoryStorage()

  assert.equal(safeSetStorageItem(memory, 'freshkeep.test', 'value'), true)
  assert.equal(safeGetStorageItem(memory, 'freshkeep.test'), 'value')

  const throwingStorage = {
    getItem() {
      throw new Error('blocked')
    },
    setItem() {
      throw new Error('quota')
    },
    removeItem() {
      throw new Error('blocked')
    },
  }

  assert.equal(safeGetStorageItem(throwingStorage, 'freshkeep.test'), null)
  assert.equal(safeSetStorageItem(throwingStorage, 'freshkeep.test', 'value'), false)
})

test('image upload validation blocks unsupported or oversized files', () => {
  assert.equal(getImageUploadError({ type: 'text/plain', size: 128 }), '请选择图片文件')
  assert.equal(getImageUploadError({ type: 'image/png', size: MAX_IMAGE_UPLOAD_BYTES + 1 }), '图片不能超过 1.5 MB，请先压缩后再上传')
  assert.equal(getImageUploadError({ type: 'image/jpeg', size: MAX_IMAGE_UPLOAD_BYTES }), null)
})


test('store image sources stay local or bundled', () => {
  assert.equal(sanitizeStoreImageSource('/images/freshkeep-item.svg'), '/images/freshkeep-item.svg')
  assert.equal(sanitizeStoreImageSource('data:image/png;base64,abc'), 'data:image/png;base64,abc')
  assert.equal(sanitizeStoreImageSource('https://example.com/item.png'), '')
  assert.equal(sanitizeStoreImageSource('http://example.com/item.png'), '')
})

test('theme preference tolerates blocked storage', () => {
  const storage = createMemoryStorage({ theme: 'dark' })
  assert.equal(resolveInitialTheme(storage, false), 'dark')
  assert.equal(resolveInitialTheme(storage, true), 'dark')

  const throwingStorage = {
    getItem() {
      throw new Error('blocked')
    },
    setItem() {
      throw new Error('quota')
    },
    removeItem() {
      throw new Error('blocked')
    },
  }

  assert.equal(resolveInitialTheme(throwingStorage, true), 'dark')
  assert.equal(resolveInitialTheme(throwingStorage, false), 'light')
  assert.equal(persistTheme(throwingStorage, 'dark'), false)
})

test('release copy has no unfinished App Store packaging language', () => {
  const releaseFiles = [
    'src/pages/About.tsx',
    'src/pages/ReminderSettings.tsx',
    'src/pages/ItemForm.tsx',
    'src/pages/DataManagement.tsx',
  ]

  for (const path of releaseFiles) {
    const source = readFileSync(path, 'utf8')
    assert.doesNotMatch(source, /后续|上架流程|iOS 包装后|Capacitor 加入|图片链接|https:\/\/\.\.\./, path)
  }
})

test('data management uses app confirmation UI instead of browser dialogs', () => {
  const source = readFileSync('src/pages/DataManagement.tsx', 'utf8')
  assert.doesNotMatch(source, /window\.confirm/)
  assert.match(source, /pendingConfirmation/)
})


test('data management previews imports before replacing local records', () => {
  const source = readFileSync('src/pages/DataManagement.tsx', 'utf8')
  assert.match(source, /pendingImportPreview/)
  assert.match(source, /confirmImportPreview/)
  assert.doesNotMatch(source, /replaceItems\(importedItems\)/)
})
test('reminder sync plan cancels stale notifications before rescheduling current ones', () => {
  const today = new Date('2026-07-01T08:00:00.000Z')
  const dueSoon = createInventoryRecord(
    {
      name: 'Greek yogurt',
      category: 'Cold food',
      productionDate: '2026-06-28',
      shelfLifeDays: 5,
      imageUrl: '',
      notes: '',
    },
    'due-soon',
  )
  const later = createInventoryRecord(
    {
      name: 'Tea',
      category: 'Pantry',
      productionDate: '2026-06-28',
      shelfLifeDays: 20,
      imageUrl: '',
      notes: '',
    },
    'later',
  )

  const plan = buildReminderSyncPlan(
    [dueSoon, later],
    { notificationsEnabled: true, reminderDays: 3, dailyDigestEnabled: true, profileName: 'Fresh keeper' },
    { now: today, previousNotificationIds: [999] },
  )

  assert.deepEqual(plan.cancelIds.sort((a, b) => a - b), [363643428, 430407484, 999].sort((a, b) => a - b))
  assert.equal(plan.schedule.length, 1)
  assert.equal(plan.nextNotificationIds.length, 1)
  assert.equal(plan.nextNotificationIds[0], 363643428)
})

test('reminder sync plan cancels known notifications when reminders are disabled', () => {
  const today = new Date('2026-07-01T08:00:00.000Z')
  const dueSoon = createInventoryRecord(
    {
      name: 'Greek yogurt',
      category: 'Cold food',
      productionDate: '2026-06-28',
      shelfLifeDays: 5,
      imageUrl: '',
      notes: '',
    },
    'due-soon',
  )

  const plan = buildReminderSyncPlan(
    [dueSoon],
    { notificationsEnabled: false, reminderDays: 3, dailyDigestEnabled: true, profileName: 'Fresh keeper' },
    { now: today, previousNotificationIds: [999] },
  )

  assert.deepEqual(plan.cancelIds.sort((a, b) => a - b), [363643428, 999].sort((a, b) => a - b))
  assert.equal(plan.schedule.length, 0)
  assert.deepEqual(plan.nextNotificationIds, [])
})

test('ios app bundle declares a privacy manifest', () => {
  const manifest = readFileSync('ios/App/App/PrivacyInfo.xcprivacy', 'utf8')
  const project = readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8')

  assert.match(manifest, /NSPrivacyTracking/) 
  assert.match(manifest, /<false\/>/) 
  assert.match(manifest, /NSPrivacyCollectedDataTypes/) 
  assert.match(project, /PrivacyInfo\.xcprivacy in Resources/)
})
test('reminder schedule only includes active items inside the reminder window', () => {
  const today = new Date('2026-07-01T08:00:00.000Z')
  const dueSoon = createInventoryRecord(
    {
      name: 'Greek yogurt',
      category: 'Cold food',
      productionDate: '2026-06-28',
      shelfLifeDays: 5,
      imageUrl: '',
      notes: '',
    },
    'due-soon',
  )
  const later = createInventoryRecord(
    {
      name: 'Tea',
      category: 'Pantry',
      productionDate: '2026-06-28',
      shelfLifeDays: 20,
      imageUrl: '',
      notes: '',
    },
    'later',
  )

  const schedule = buildReminderSchedule([dueSoon, later], { enabled: true, reminderDays: 3, now: today })

  assert.equal(schedule.length, 1)
  assert.equal(schedule[0].id, 363643428)
  assert.equal(schedule[0].title, 'FreshKeep 临期提醒')
  assert.match(schedule[0].body, /Greek yogurt/)
  assert.equal(schedule[0].scheduleAt.toISOString(), '2026-07-02T01:00:00.000Z')
})
