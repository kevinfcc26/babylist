import Badge from '../shared/Badge'
import type { Priority } from '../../types/list'

interface PriorityBadgeProps {
  priority: Priority
}

const config: Record<Priority, { label: string; variant: 'error' | 'warning' | 'neutral' }> = {
  high: { label: 'Alta', variant: 'error' },
  medium: { label: 'Media', variant: 'warning' },
  low: { label: 'Baja', variant: 'neutral' },
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { label, variant } = config[priority]
  return <Badge variant={variant}>{label}</Badge>
}
