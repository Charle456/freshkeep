import { Database, FileSpreadsheet, FileUp, RotateCcw, Share2, ShieldCheck, Smartphone, Trash2 } from 'lucide-react'
import { ChangeEvent, useRef, useState } from 'react'
import {
  exportInventoryToCsv,
  exportInventoryToJson,
  previewInventoryImport,
  type InventoryImportPreview,
} from '@/features/inventory/data-portability'
import { buildPortableFileName, getBackupStatusText } from '@/features/inventory/mobile-data-actions'
import { safeGetStorageItem, safeSetStorageItem } from '@/features/platform/runtime'
import { useInventoryStore } from '@/stores/useInventoryStore'

const LAST_BACKUP_STORAGE_KEY = 'freshkeep.data.lastBackupAt'

type PendingConfirmation = 'clear' | 'reset'
type PendingImportPreview = InventoryImportPreview & { fileName: string }

const confirmationCopy: Record<PendingConfirmation, { body: string; confirmLabel: string; title: string }> = {
  clear: {
    title: '清空本机数据？',
    body: '这会删除当前设备上的 FreshKeep 记录。已经保存或发送出去的备份文件不会被删除，建议先备份到手机。',
    confirmLabel: '清空数据',
  },
  reset: {
    title: '恢复示例数据？',
    body: '这会用示例记录替换当前本机记录，适合重新体验 FreshKeep 的完整流程。',
    confirmLabel: '恢复示例',
  },
}

function downloadText(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

async function shareOrDownloadFile(filename: string, contents: string, type: string, title: string) {
  const file = new File([contents], filename, { type })
  const navigatorWithShare = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean
    share?: (data: ShareData) => Promise<void>
  }
  const shareData: ShareData = {
    files: [file],
    title,
    text: 'FreshKeep 本机数据文件',
  }

  if (navigatorWithShare.share && (!navigatorWithShare.canShare || navigatorWithShare.canShare(shareData))) {
    await navigatorWithShare.share(shareData)
    return 'shared'
  }

  downloadText(filename, contents, type)
  return 'downloaded'
}

export default function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const items = useInventoryStore((state) => state.items)
  const clearItems = useInventoryStore((state) => state.clearItems)
  const replaceItems = useInventoryStore((state) => state.replaceItems)
  const resetSampleItems = useInventoryStore((state) => state.resetSampleItems)
  const [message, setMessage] = useState('')
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation>()
  const [pendingImportPreview, setPendingImportPreview] = useState<PendingImportPreview>()
  const [lastBackupAt, setLastBackupAt] = useState(() => safeGetStorageItem(window.localStorage, LAST_BACKUP_STORAGE_KEY) ?? undefined)

  const handledCount = items.filter((item) => item.resolvedAt).length
  const activeCount = items.length - handledCount
  const confirmation = pendingConfirmation ? confirmationCopy[pendingConfirmation] : undefined

  const backupToPhone = async () => {
    const now = new Date()
    const backupAt = now.toISOString()
    const filename = buildPortableFileName('backup', now)
    safeSetStorageItem(window.localStorage, LAST_BACKUP_STORAGE_KEY, backupAt)
    setLastBackupAt(backupAt)
    setMessage('正在准备备份文件...')

    try {
      const result = await shareOrDownloadFile(
        filename,
        exportInventoryToJson(items, now),
        'application/json;charset=utf-8',
        'FreshKeep 备份',
      )
      setMessage(result === 'shared' ? '已打开系统分享面板，可保存到“文件”或发送给自己。' : '已生成备份文件。')
    } catch {
      setMessage('备份分享失败，请稍后重试。')
    }
  }

  const shareSpreadsheet = async () => {
    const now = new Date()
    const filename = buildPortableFileName('spreadsheet', now)

    try {
      const result = await shareOrDownloadFile(
        filename,
        exportInventoryToCsv(items),
        'text/csv;charset=utf-8',
        'FreshKeep 表格',
      )
      setMessage(result === 'shared' ? '已打开系统分享面板，可发送到 Numbers、Excel 或聊天应用。' : '已生成 CSV 表格文件。')
    } catch {
      setMessage('表格分享失败，请稍后重试。')
    }
  }

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const preview = previewInventoryImport(String(reader.result ?? ''), items.length)
        setPendingImportPreview({ ...preview, fileName: file.name })
        setPendingConfirmation(undefined)
        setMessage('')
      } catch (error) {
        setPendingImportPreview(undefined)
        setMessage(error instanceof Error ? error.message : '恢复失败')
      } finally {
        event.target.value = ''
      }
    }
    reader.onerror = () => {
      setPendingImportPreview(undefined)
      setMessage('备份文件读取失败，请重新选择。')
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  const openConfirmation = (nextConfirmation: PendingConfirmation) => {
    setMessage('')
    setPendingImportPreview(undefined)
    setPendingConfirmation(nextConfirmation)
  }

  const confirmImportPreview = () => {
    if (!pendingImportPreview) {
      return
    }

    replaceItems(pendingImportPreview.records)
    setMessage(`已从备份恢复 ${pendingImportPreview.incomingCount} 条记录。`)
    setPendingImportPreview(undefined)
  }

  const confirmPendingAction = () => {
    if (pendingConfirmation === 'clear') {
      clearItems()
      setMessage('本机记录已清空。')
    }

    if (pendingConfirmation === 'reset') {
      resetSampleItems()
      setMessage('已恢复示例数据。')
    }

    setPendingConfirmation(undefined)
  }

  return (
    <div className="space-y-4">
      <section className="plan-card plan-card-blue px-4 py-4">
        <div className="grid grid-cols-[1fr_42px] items-start gap-3">
          <div>
            <p className="text-lg font-[800] text-[var(--text-primary)]">本机数据</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
              FreshKeep 以单机 App 方式保存数据。备份会通过系统分享面板保存到手机文件、iCloud、微信或邮箱。
            </p>
          </div>
          <span className="icon-badge bg-white/60">
            <Smartphone size={18} />
          </span>
        </div>
      </section>

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          <article className="mobile-data-stat bg-[var(--surface-mint)]">
            <span>全部记录</span>
            <strong>{items.length}</strong>
          </article>
          <article className="mobile-data-stat bg-[var(--surface-aqua)]">
            <span>追踪中</span>
            <strong>{activeCount}</strong>
          </article>
          <article className="mobile-data-stat bg-[var(--surface-orange)]">
            <span>已处理</span>
            <strong>{handledCount}</strong>
          </article>
        </div>
        <div className="mt-4 grid grid-cols-[32px_1fr] gap-3 rounded-[20px] bg-[var(--surface-subtle)] px-3 py-3">
          <span className="icon-badge bg-white">
            <Database size={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">{getBackupStatusText(lastBackupAt)}</p>
            <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">换手机、卸载 App 或清理应用数据前，建议先备份。</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button type="button" className="data-action data-action-primary" onClick={backupToPhone}>
          <Share2 size={19} />
          <span>备份到手机</span>
          <small>保存或发送备份</small>
        </button>
        <button type="button" className="data-action" onClick={() => fileInputRef.current?.click()}>
          <FileUp size={19} />
          <span>从备份恢复</span>
          <small>选择备份文件</small>
        </button>
        <button type="button" className="data-action" onClick={shareSpreadsheet}>
          <FileSpreadsheet size={19} />
          <span>分享表格</span>
          <small>给 Excel / Numbers</small>
        </button>
        <button type="button" className="data-action" onClick={() => openConfirmation('reset')}>
          <RotateCcw size={19} />
          <span>示例数据</span>
          <small>恢复示例记录</small>
        </button>
      </section>

      <input ref={fileInputRef} className="hidden" type="file" accept="application/json,.json" onChange={handleImport} />

      {pendingImportPreview ? (
        <section className="glass-panel rounded-[28px] px-4 py-4">
          <p className="text-sm font-bold text-[var(--text-primary)]">确认恢复备份？</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{pendingImportPreview.summaryText}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{pendingImportPreview.warningText}</p>
          <p className="mt-1 truncate text-xs font-semibold text-[var(--text-muted)]">文件：{pendingImportPreview.fileName}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="secondary-chip justify-center" onClick={() => setPendingImportPreview(undefined)}>
              取消
            </button>
            <button type="button" className="primary-chip justify-center" onClick={confirmImportPreview}>
              确认恢复
            </button>
          </div>
        </section>
      ) : null}

      {message ? <p className="rounded-[18px] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[var(--text-primary)] shadow-[var(--shadow-card)]">{message}</p> : null}

      {confirmation ? (
        <section className="glass-panel rounded-[28px] px-4 py-4">
          <p className="text-sm font-bold text-[var(--text-primary)]">{confirmation.title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{confirmation.body}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="secondary-chip justify-center" onClick={() => setPendingConfirmation(undefined)}>
              取消
            </button>
            <button type="button" className="danger-chip justify-center" onClick={confirmPendingAction}>
              {confirmation.confirmLabel}
            </button>
          </div>
        </section>
      ) : null}

      <section className="glass-panel rounded-[28px] px-4 py-4">
        <div className="grid grid-cols-[32px_1fr] gap-3">
          <span className="icon-badge bg-[rgba(227,77,69,0.12)] text-[var(--danger)]">
            <ShieldCheck size={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--danger)]">清空本机数据</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">只会清空这台设备上的 FreshKeep 记录，不会删除你已经保存或发送出去的备份文件。</p>
            <button type="button" className="danger-chip mt-4" onClick={() => openConfirmation('clear')}>
              <Trash2 size={16} />
              清空本机数据
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}