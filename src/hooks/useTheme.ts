import { useEffect, useState } from 'react'
import { safeGetStorageItem, safeSetStorageItem, type StorageLike } from '../features/platform/runtime.ts'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

export function resolveInitialTheme(storage: StorageLike | undefined, prefersDark: boolean): Theme {
  const savedTheme = safeGetStorageItem(storage, THEME_STORAGE_KEY)

  if (isTheme(savedTheme)) {
    return savedTheme
  }

  return prefersDark ? 'dark' : 'light'
}

export function persistTheme(storage: StorageLike | undefined, theme: Theme) {
  return safeSetStorageItem(storage, THEME_STORAGE_KEY, theme)
}

function getBrowserStorage() {
  return typeof window === 'undefined' ? undefined : window.localStorage
}

function getPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => resolveInitialTheme(getBrowserStorage(), getPrefersDark()))

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    persistTheme(getBrowserStorage(), theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  }
}