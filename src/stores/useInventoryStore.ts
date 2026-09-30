import { createContext, createElement, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { InventoryFormValues, InventoryRecord, ItemResolution } from '@/features/inventory/model'
import {
  createInventoryRecord,
  getSampleInventory,
  isInventoryRecord,
  resolveInventoryRecord,
  restoreInventoryRecord,
  updateInventoryRecord,
} from '@/features/inventory/model'
import { safeGetStorageItem, safeSetStorageItem } from '@/features/platform/runtime'

const STORAGE_KEY = 'freshkeep.inventory.records'

interface InventoryState {
  initialized: boolean
  items: InventoryRecord[]
  clearItems: () => void
  removeItem: (itemId: string) => void
  renameCategory: (currentCategory: string, nextCategory: string) => void
  replaceItems: (items: InventoryRecord[]) => void
  resetSampleItems: () => void
  resolveItem: (itemId: string, resolution: ItemResolution, resolutionNote?: string) => void
  restoreItem: (itemId: string) => void
  upsertItem: (values: InventoryFormValues, itemId?: string) => string
}

function persistItems(items: InventoryRecord[]) {
  return safeSetStorageItem(window.localStorage, STORAGE_KEY, JSON.stringify(items))
}

function loadItems() {
  const stored = safeGetStorageItem(window.localStorage, STORAGE_KEY)

  if (!stored) {
    return getSampleInventory()
  }

  try {
    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return getSampleInventory()
    }

    const safeItems = parsed.filter(isInventoryRecord)

    if (safeItems.length > 0) {
      return safeItems
    }

    return parsed.length === 0 ? [] : getSampleInventory()
  } catch {
    return getSampleInventory()
  }
}

const InventoryStoreContext = createContext<InventoryState | null>(null)

export function InventoryProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false)
  const [items, setItems] = useState<InventoryRecord[]>([])

  useEffect(() => {
    const loadedItems = loadItems()
    persistItems(loadedItems)
    setItems(loadedItems)
    setInitialized(true)
  }, [])

  const commitItems = (updater: (currentItems: InventoryRecord[]) => InventoryRecord[]) => {
    setItems((currentItems) => {
      const nextItems = updater(currentItems)
      persistItems(nextItems)
      return nextItems
    })
  }

  const value = useMemo<InventoryState>(
    () => ({
      initialized,
      items,
      clearItems: () => {
        commitItems(() => [])
      },
      removeItem: (itemId) => {
        commitItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
      },
      renameCategory: (currentCategory, nextCategory) => {
        const trimmedNextCategory = nextCategory.trim()

        if (!trimmedNextCategory || trimmedNextCategory === currentCategory) {
          return
        }

        commitItems((currentItems) =>
          currentItems.map((item) =>
            item.category === currentCategory
              ? {
                  ...item,
                  category: trimmedNextCategory,
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        )
      },
      replaceItems: (nextItems) => {
        commitItems(() => nextItems)
      },
      resetSampleItems: () => {
        commitItems(() => getSampleInventory())
      },
      resolveItem: (itemId, resolution, resolutionNote = '') => {
        commitItems((currentItems) =>
          currentItems.map((item) => (item.id === itemId ? resolveInventoryRecord(item, resolution, resolutionNote) : item)),
        )
      },
      restoreItem: (itemId) => {
        commitItems((currentItems) =>
          currentItems.map((item) => (item.id === itemId ? restoreInventoryRecord(item) : item)),
        )
      },
      upsertItem: (values, itemId) => {
        let savedId = itemId ?? ''

        commitItems((currentItems) => {
          if (!itemId) {
            const created = createInventoryRecord(values)
            savedId = created.id
            return [created, ...currentItems]
          }

          const target = currentItems.find((item) => item.id === itemId)

          if (!target) {
            const created = createInventoryRecord(values, itemId)
            savedId = created.id
            return [created, ...currentItems]
          }

          const updated = updateInventoryRecord(target, values)
          savedId = updated.id
          return currentItems.map((item) => (item.id === itemId ? updated : item))
        })

        return savedId
      },
    }),
    [initialized, items],
  )

  return createElement(InventoryStoreContext.Provider, { value }, children)
}

export function useInventoryStore<T>(selector: (state: InventoryState) => T) {
  const store = useContext(InventoryStoreContext)

  if (!store) {
    throw new Error('useInventoryStore 必须在 InventoryProvider 内使用')
  }

  return selector(store)
}
