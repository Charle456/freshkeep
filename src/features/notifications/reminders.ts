import { decorateInventoryItem, type InventoryRecord } from '../inventory/model.ts'
import { safeGetStorageItem, safeSetStorageItem, type StorageLike } from '../platform/runtime.ts'
import type { AppSettings } from '../settings/model.ts'

export const REMINDER_NOTIFICATION_IDS_STORAGE_KEY = 'freshkeep.notifications.scheduledIds'

export interface ReminderScheduleOptions {
  enabled: boolean
  now?: Date
  reminderDays: number
}

export interface ReminderScheduleEntry {
  body: string
  id: number
  itemId: string
  scheduleAt: Date
  title: string
}

export interface ReminderSyncPlan {
  cancelIds: number[]
  nextNotificationIds: number[]
  schedule: ReminderScheduleEntry[]
}

export interface ReminderSyncPlanOptions {
  now?: Date
  previousNotificationIds?: number[]
}

function getStableNotificationId(value: string) {
  let hash = 0

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) % 1_000_000_000
  }

  return (hash + 327_662_768) % 1_000_000_000
}

function getReminderDate(now: Date, daysLeft: number) {
  const scheduleAt = new Date(now)
  scheduleAt.setHours(9, 0, 0, 0)

  if (daysLeft > 1) {
    scheduleAt.setDate(scheduleAt.getDate() + daysLeft - 1)
  }

  return scheduleAt
}

function uniqueNumbers(values: number[]) {
  return Array.from(new Set(values.filter((value) => Number.isInteger(value))))
}

function parseStoredNotificationIds(storage: StorageLike | undefined) {
  const raw = safeGetStorageItem(storage, REMINDER_NOTIFICATION_IDS_STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? uniqueNumbers(parsed) : []
  } catch {
    return []
  }
}

function persistNotificationIds(storage: StorageLike | undefined, ids: number[]) {
  return safeSetStorageItem(storage, REMINDER_NOTIFICATION_IDS_STORAGE_KEY, JSON.stringify(uniqueNumbers(ids)))
}

export function buildReminderSchedule(items: InventoryRecord[], options: ReminderScheduleOptions): ReminderScheduleEntry[] {
  if (!options.enabled) {
    return []
  }

  const now = options.now ?? new Date()

  return items
    .map((item) => decorateInventoryItem(item, now, options.reminderDays))
    .filter((item) => item.status === 'warning' || item.status === 'expired')
    .map((item) => ({
      body: item.daysLeft < 0 ? `${item.name} 已过期，请尽快复核。` : `${item.name} 将在 ${item.daysLeft} 天内到期。`,
      id: getStableNotificationId(item.id),
      itemId: item.id,
      scheduleAt: getReminderDate(now, item.daysLeft),
      title: 'FreshKeep 临期提醒',
    }))
}

export function buildReminderSyncPlan(
  items: InventoryRecord[],
  settings: AppSettings,
  options: ReminderSyncPlanOptions = {},
): ReminderSyncPlan {
  const schedule = buildReminderSchedule(items, {
    enabled: settings.notificationsEnabled,
    now: options.now,
    reminderDays: settings.reminderDays,
  })
  const currentItemIds = items.map((item) => getStableNotificationId(item.id))
  const nextNotificationIds = schedule.map((entry) => entry.id)

  return {
    cancelIds: uniqueNumbers([...(options.previousNotificationIds ?? []), ...currentItemIds]),
    nextNotificationIds,
    schedule,
  }
}

export async function syncFreshKeepReminders(items: InventoryRecord[], settings: AppSettings, storage: StorageLike | undefined = window.localStorage) {
  const plan = buildReminderSyncPlan(items, settings, {
    previousNotificationIds: parseStoredNotificationIds(storage),
  })

  if (!window.Capacitor?.isNativePlatform?.()) {
    persistNotificationIds(storage, plan.nextNotificationIds)
    return { cancelledCount: plan.cancelIds.length, scheduledCount: plan.schedule.length, status: 'web-preview' as const }
  }

  const { LocalNotifications } = await import('@capacitor/local-notifications')

  if (plan.cancelIds.length > 0) {
    await LocalNotifications.cancel({
      notifications: plan.cancelIds.map((id) => ({ id })),
    })
  }

  if (plan.schedule.length === 0) {
    persistNotificationIds(storage, [])
    return { cancelledCount: plan.cancelIds.length, scheduledCount: 0, status: 'scheduled' as const }
  }

  const permission = await LocalNotifications.requestPermissions()

  if (permission.display !== 'granted') {
    persistNotificationIds(storage, [])
    return { cancelledCount: plan.cancelIds.length, scheduledCount: 0, status: 'permission-denied' as const }
  }

  await LocalNotifications.schedule({
    notifications: plan.schedule.map((entry) => ({
      body: entry.body,
      id: entry.id,
      schedule: { at: entry.scheduleAt },
      title: entry.title,
    })),
  })

  persistNotificationIds(storage, plan.nextNotificationIds)
  return { cancelledCount: plan.cancelIds.length, scheduledCount: plan.schedule.length, status: 'scheduled' as const }
}