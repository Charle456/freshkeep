import { Database, ShieldCheck, WifiOff } from 'lucide-react'
import { APP_METADATA } from '@/data/app-metadata'

const facts = [
  {
    icon: WifiOff,
    title: '单机离线',
    description: '库存、设置和备份状态保存在当前设备，不需要账号登录。',
  },
  {
    icon: ShieldCheck,
    title: '隐私优先',
    description: APP_METADATA.dataStorageSummary + ' 未接入广告追踪或第三方分析。',
  },
  {
    icon: Database,
    title: '数据可控',
    description: '你可以随时备份、恢复、分享表格或清空这台设备上的 FreshKeep 数据。',
  },
]

export default function About() {
  return (
    <div className="space-y-4">
      <section className="challenge-card px-4 py-4">
        <p className="relative z-[1] max-w-[230px] text-[30px] font-[800] leading-[1.02] text-[var(--text-primary)]">FreshKeep</p>
        <p className="relative z-[1] mt-3 max-w-[260px] text-sm font-semibold leading-6 text-[var(--text-secondary)]">
          一个面向食品、零食、药品、保健品和日化用品的本地保质期管理工具。
        </p>
      </section>

      <section className="space-y-3">
        {facts.map(({ description, icon: Icon, title }) => (
          <article key={title} className="grid grid-cols-[36px_1fr] gap-3 rounded-[22px] bg-white px-4 py-4 shadow-[var(--shadow-card)]">
            <span className="icon-badge bg-[var(--surface-subtle)]">
              <Icon size={17} />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">{title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <p className="text-sm font-bold text-[var(--text-primary)]">隐私政策</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          FreshKeep 不会主动上传你的库存名称、图片、备注或设置。物品记录、提醒偏好、外观偏好和备份时间保存在当前设备；你主动导出的备份文件或表格由你自行保存、分享或删除。
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          清理应用数据、卸载 App 或更换设备可能导致本地记录丢失。你可以在“数据管理”里备份到手机、从备份恢复，或清空本机记录。
        </p>
      </section>

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <p className="text-sm font-bold text-[var(--text-primary)]">版本与支持</p>
        <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
          <p>版本：{APP_METADATA.version}</p>
          <p>Bundle ID：{APP_METADATA.bundleId}</p>
          <p>
            支持邮箱：
            <a className="font-bold text-[var(--text-primary)]" href={`mailto:${APP_METADATA.supportEmail}`}>
              {APP_METADATA.supportEmail}
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}