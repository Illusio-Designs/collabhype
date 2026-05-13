import { Badge } from '@/components/ui';

const MAP = {
  // Campaign status
  DRAFT:       { variant: 'default', label: 'Draft' },
  BRIEF_SENT:  { variant: 'info',    label: 'Brief sent' },
  IN_PROGRESS: { variant: 'warning', label: 'In progress' },
  REVIEW:      { variant: 'warning', label: 'In review' },
  COMPLETED:   { variant: 'success', label: 'Completed' },
  CANCELLED:   { variant: 'danger',  label: 'Cancelled' },
  // Order/payout status
  PENDING:     { variant: 'warning', label: 'Pending' },
  PAID:        { variant: 'success', label: 'Paid' },
  PROCESSING:  { variant: 'info',    label: 'Processing' },
  FAILED:      { variant: 'danger',  label: 'Failed' },
  REFUNDED:    { variant: 'default', label: 'Refunded' },
};

export default function StatusBadge({ status }) {
  const m = MAP[status] ?? { variant: 'default', label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
