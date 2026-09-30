import { Monitor, Moon, Sun } from 'lucide-react'
import type { ThemeMode } from '@/features/settings/model'
import { useAppSettings } from '@/hooks/useAppSettings'

const themeOptions: Array<{ description: string; icon: typeof Monitor; label: string; value: ThemeMode }> = [
  { label: '跟随系统', value: 'system', description: '根据设备外观自动切换。', icon: Monitor },
  { label: '浅色', value: 'light', description: '保持明亮的清单界面。', icon: Sun },
  { label: '深色', value: 'dark', description: '夜间巡检更柔和。', icon: Moon },
]

export default function AppearanceSettings() {
  const { initialized, settings, setSettings } = useAppSettings()

  if (!initialized) {
    return <p className="text-sm font-semibold text-[var(--text-secondary)]">正在读取外观设置...</p>
  }

  return (
    <div className="space-y-4">
      <section className="plan-card plan-card-mint px-4 py-4">
        <p className="text-lg font-[800] text-[var(--text-primary)]">外观偏好</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
          选择 FreshKeep 在这台设备上的显示方式。设置会立即应用，并保存在本机。
        </p>
      </section>

      <section className="space-y-3">
        {themeOptions.map(({ description, icon: Icon, label, value }) => {
          const active = settings.themeMode === value

          return (
            <button
              key={value}
              type="button"
              className={active ? 'preference-row preference-row-active' : 'preference-row'}
              onClick={() => setSettings((current) => ({ ...current, themeMode: value }))}
            >
              <span className="icon-badge bg-[var(--surface-subtle)]">
                <Icon size={17} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-bold text-[var(--text-primary)]">{label}</span>
                <span className="mt-1 block text-sm leading-5 text-[var(--text-secondary)]">{description}</span>
              </span>
              <span className={active ? 'selection-dot selection-dot-active' : 'selection-dot'} aria-hidden="true" />
            </button>
          )
        })}
      </section>
    </div>
  )
}