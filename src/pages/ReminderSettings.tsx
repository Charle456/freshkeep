import { BellRing, RotateCcw, Save } from 'lucide-react'
import { useState } from 'react'
import { syncFreshKeepReminders } from '@/features/notifications/reminders'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useInventoryStore } from '@/stores/useInventoryStore'

export default function ReminderSettings() {
  const { initialized, resetSettings, settings, setSettings } = useAppSettings()
  const items = useInventoryStore((state) => state.items)
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)

  if (!initialized) {
    return <p className="text-sm font-semibold text-[var(--text-secondary)]">正在读取提醒设置...</p>
  }

  const updateSetting = <K extends keyof typeof settings>(field: K, value: (typeof settings)[K]) => {
    setMessage('')
    setSaved(false)
    setSettings((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async () => {
    setSettings(settings)
    setMessage('正在同步提醒设置...')

    try {
      const result = await syncFreshKeepReminders(items, settings)
      setSaved(true)
      setMessage(
        result.status === 'permission-denied'
          ? '系统通知未授权，库存页仍会显示临期提醒。'
          : `已保存提醒设置，当前匹配 ${result.scheduledCount} 条临期任务。`,
      )
    } catch {
      setSaved(false)
      setMessage('提醒设置已保存，但同步系统通知失败。请稍后重试。')
    }
  }

  return (
    <div className="space-y-4">
      <section className="plan-card plan-card-orange px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="icon-badge bg-white/60">
            <BellRing size={17} />
          </span>
          <div>
            <p className="text-lg font-[800] text-[var(--text-primary)]">临期提醒窗口</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
              FreshKeep 会按照这里的天数把物品放入风险队列，并在支持系统通知的平台同步本地提醒。
            </p>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <label>
          <span className="form-label">提前提醒天数</span>
          <input
            className="form-input"
            type="number"
            min="1"
            max="30"
            value={settings.reminderDays}
            onChange={(event) => updateSetting('reminderDays', Number(event.target.value))}
          />
        </label>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          当前会在到期前 {settings.reminderDays} 天进入提醒窗口。库存页仍会显示原始到期日期，方便复核。
        </p>
      </section>

      <section className="glass-panel rounded-[28px] px-4 py-2">
        <label className="toggle-row">
          <span>
            <span className="block text-sm font-bold text-[var(--text-primary)]">本地提醒</span>
            <span className="block text-sm text-[var(--text-secondary)]">开启后会请求系统通知权限。未授权时，库存页仍会显示临期提醒。</span>
          </span>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(event) => updateSetting('notificationsEnabled', event.target.checked)}
          />
        </label>
        <label className="toggle-row">
          <span>
            <span className="block text-sm font-bold text-[var(--text-primary)]">每日巡检摘要</span>
            <span className="block text-sm text-[var(--text-secondary)]">首页显示今日优先处理任务。</span>
          </span>
          <input
            type="checkbox"
            checked={settings.dailyDigestEnabled}
            onChange={(event) => updateSetting('dailyDigestEnabled', event.target.checked)}
          />
        </label>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button type="button" className="secondary-chip justify-center" onClick={resetSettings}>
          <RotateCcw size={16} />
          重置
        </button>
        <button type="button" className="primary-chip justify-center" onClick={handleSave}>
          <Save size={16} />
          {saved ? '已保存' : '保存'}
        </button>
      </section>
      {message ? <p className="rounded-[18px] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[var(--text-primary)] shadow-[var(--shadow-card)]">{message}</p> : null}
    </div>
  )
}
