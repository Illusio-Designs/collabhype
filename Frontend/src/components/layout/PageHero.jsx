import { Breadcrumb } from '@/components/ui';

// Standard hero strip for marketing / public pages. Centers a breadcrumb
// above an eyebrow + title + subtitle. Used at the top of pages like
// /packages, /influencers, /about, /contact so the user always knows
// where they are.

export default function PageHero({
  breadcrumbs,
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}) {
  const alignCls = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  return (
    <div className="border-b border-zinc-200 bg-white">
      <div
        className={`mx-auto flex max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8 ${alignCls} ${className ?? ''}`}
      >
        {breadcrumbs?.length > 0 && (
          <div className="mb-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-zinc-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
