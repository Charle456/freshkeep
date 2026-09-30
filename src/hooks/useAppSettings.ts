import { createContext, createElement, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  DEFAULT_APP_SETTINGS,
  normalizeAppSettings,
  serializeAppSettings,
  type AppSettings,
} from '@/features/settings/model'
import { safeGetStorageItem, safeSetStorageItem } from '@/features/platform/runtime'

const SETTINGS_STORAGE_KEY = 'freshkeep.app.settings'

interface AppSettingsContextValue {
  initialized: boolean
  resetSettings: () => void
  settings: AppSettings
  setSettings: (nextSettings: AppSettings | ((current: AppSettings) => AppSettings)) => void
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null)

function loadAppSettings() {
  const stored = safeGetStorageItem(window.localStorage, SETTINGS_STORAGE_KEY)

  if (!stored) {
    return DEFAULT_APP_SETTINGS
  }

  try {
    return normalizeAppSettings(JSON.parse(stored))
  } catch {
    return DEFAULT_APP_SETTINGS
  }
}

function resolveThemeMode(settings: AppSettings) {
  if (settings.themeMode !== 'system') {
    return settings.themeMode
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(settings: AppSettings) {
  const resolvedTheme = resolveThemeMode(settings)
  document.documentElement.dataset.theme = resolvedTheme
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolvedTheme)
}

export function AppSettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_APP_SETTINGS)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const loadedSettings = loadAppSettings()
    setSettingsState(loadedSettings)
    applyTheme(loadedSettings)
    setInitialized(true)
  }, [])

  useEffect(() => {
    applyTheme(settings)

    if (settings.themeMode !== 'system') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme(settings)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings])

  const setSettings = (nextSettings: AppSettings | ((current: AppSettings) => AppSettings)) => {
    setSettingsState((current) => {
      const resolvedSettings = typeof nextSettings === 'function' ? nextSettings(current) : nextSettings
      const normalizedSettings = normalizeAppSettings(resolvedSettings)
      safeSetStorageItem(window.localStorage, SETTINGS_STORAGE_KEY, serializeAppSettings(normalizedSettings))
      return normalizedSettings
    })
  }

  const resetSettings = () => {
    safeSetStorageItem(window.localStorage, SETTINGS_STORAGE_KEY, serializeAppSettings(DEFAULT_APP_SETTINGS))
    setSettingsState(DEFAULT_APP_SETTINGS)
  }

  const value = useMemo(
    () => ({ initialized, resetSettings, settings, setSettings }),
    [initialized, settings],
  )

  return createElement(AppSettingsContext.Provider, { value }, children)
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext)

  if (!context) {
    throw new Error('useAppSettings 必须在 AppSettingsProvider 内使用')
  }

  return context
}
