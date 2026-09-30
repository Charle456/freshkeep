export interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export function createMemoryStorage(initialEntries: Record<string, string> = {}): StorageLike {
  const entries = new Map(Object.entries(initialEntries))

  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value)
    },
    removeItem: (key) => {
      entries.delete(key)
    },
  }
}

export function safeGetStorageItem(storage: StorageLike | undefined, key: string) {
  if (!storage) {
    return null
  }

  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export function safeSetStorageItem(storage: StorageLike | undefined, key: string, value: string) {
  if (!storage) {
    return false
  }

  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function safeRemoveStorageItem(storage: StorageLike | undefined, key: string) {
  if (!storage) {
    return false
  }

  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}
