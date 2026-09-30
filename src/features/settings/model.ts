export type ThemeMode = 'system' | 'light' | 'dark'

export interface AppSettings {
  reminderDays: number
  notificationsEnabled: boolean
  dailyDigestEnabled: boolean
  themeMode: ThemeMode
  profileName: string
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  reminderDays: 3,
  notificationsEnabled: true,
  dailyDigestEnabled: false,
  themeMode: 'system',
  profileName: 'Fresh keeper',
}

function clampReminderDays(value: unknown) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return DEFAULT_APP_SETTINGS.reminderDays
  }

  return Math.min(30, Math.max(1, Math.round(numericValue)))
}

function normalizeThemeMode(value: unknown): ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system' ? value : DEFAULT_APP_SETTINGS.themeMode
}

function normalizeProfileName(value: unknown) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed || DEFAULT_APP_SETTINGS.profileName
}

export function normalizeAppSettings(value: unknown): AppSettings {
  const source = value && typeof value === 'object' ? (value as Partial<AppSettings>) : {}

  return {
    reminderDays: clampReminderDays(source.reminderDays),
    notificationsEnabled:
      typeof source.notificationsEnabled === 'boolean'
        ? source.notificationsEnabled
        : DEFAULT_APP_SETTINGS.notificationsEnabled,
    dailyDigestEnabled:
      typeof source.dailyDigestEnabled === 'boolean'
        ? source.dailyDigestEnabled
        : DEFAULT_APP_SETTINGS.dailyDigestEnabled,
    themeMode: normalizeThemeMode(source.themeMode),
    profileName: normalizeProfileName(source.profileName),
  }
}

export function serializeAppSettings(settings: AppSettings) {
  return JSON.stringify(normalizeAppSettings(settings), null, 2)
}
