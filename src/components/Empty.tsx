import { Link } from 'react-router-dom'

interface EmptyProps {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}

export default function Empty({ title, description, actionLabel, actionTo }: EmptyProps) {
  return (
    <section className="glass-panel rounded-[28px] px-5 py-6 text-center">
      <div className="mx-auto max-w-[260px]">
        <p className="text-lg font-bold text-[var(--text-primary)]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      </div>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="primary-chip mx-auto mt-5 inline-flex">
          {actionLabel}
        </Link>
      ) : null}
    </section>
  )
}
