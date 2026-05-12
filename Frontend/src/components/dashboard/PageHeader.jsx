'use client';

import { Breadcrumb } from '@/components/ui';

// Standard dashboard page header. Renders a breadcrumb trail, eyebrow,
// title, optional subtitle, and a primary action slot — the layout every
// dashboard page should use so navigation feels consistent.
//
// Usage:
//   <PageHeader
//     breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Campaigns' }]}
//     eyebrow="Brand"
//     title="Campaigns"
//     subtitle="Track briefs and approvals."
//     action={<Button>Start campaign</Button>}
//   />

export default function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  subtitle,
  action,
  className,
}) {
  return (
    <div className={className}>
      {breadcrumbs?.length > 0 && (
        <div className="mb-4">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
