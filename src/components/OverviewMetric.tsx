import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type MetricTone = 'indigo' | 'orange' | 'mint'

interface OverviewMetricProps {
  label: string
  value: string
  helper: string
  tone: MetricTone
  to?: string
}

export function OverviewMetric({ label, value, helper, tone, to }: OverviewMetricProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-bold leading-tight text-[var(--text-primary)]">{label}</p>
        <span className="metric-arrow">
          <ArrowRight size={14} />
        </span>
      </div>
      <p className="mt-4 text-[30px] font-[800] leading-none text-[var(--text-primary)]">{value}</p>
      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[var(--text-secondary)]">{helper}</p>
    </>
  )

  if (!to) {
    return <article className={cn('metric-card min-h-[136px] min-w-[154px] shrink-0', 'metric-card-' + tone)}>{content}</article>
  }

  return (
    <Link to={to} className={cn('metric-card block min-h-[136px] min-w-[154px] shrink-0', 'metric-card-' + tone)}>
      {content}
    </Link>
  )
}
