export type PortableDataKind = 'backup' | 'spreadsheet'

function formatDatePart(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateTimeText(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hour}:${minute}`
}

export function buildPortableFileName(kind: PortableDataKind, now: Date = new Date()) {
  const datePart = formatDatePart(now)
  return kind === 'backup' ? `freshkeep-backup-${datePart}.json` : `freshkeep-table-${datePart}.csv`
}

export function getBackupStatusText(lastBackupAt?: string) {
  if (!lastBackupAt) {
    return '尚未备份'
  }

  const date = new Date(lastBackupAt)

  if (Number.isNaN(date.getTime())) {
    return '尚未备份'
  }

  return `上次备份：${formatDateTimeText(date)}`
}
