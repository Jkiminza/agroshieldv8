interface StatusBadgeProps {
  status: 'funded' | 'pending' | 'overdue' | 'review' | 'closed'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const badgeStyles = {
    funded: 'badge-funded',
    pending: 'badge-pending',
    overdue: 'badge-overdue',
    review: 'badge-review',
    closed: 'badge-closed',
  }

  const labels = {
    funded: 'Funded ✓',
    pending: 'Pending Funding',
    overdue: 'Overdue ⚠',
    review: 'Under Review',
    closed: 'Closed',
  }

  return <span className={badgeStyles[status]}>{labels[status]}</span>
}
