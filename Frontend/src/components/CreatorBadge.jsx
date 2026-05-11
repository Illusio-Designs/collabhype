import clsx from 'clsx';

// Upwork-style creator badges. Auto-derived from stats except EXPERT_VETTED
// which is admin-assigned.
const BADGE_META = {
  RISING_TALENT: {
    label: 'Rising Talent',
    tone: 'bg-sky-50 text-sky-700 ring-sky-200',
    icon: '🌱',
    tooltip: 'New on the platform with a strong start.',
  },
  TOP_RATED: {
    label: 'Top Rated',
    tone: 'bg-amber-50 text-amber-800 ring-amber-200',
    icon: '⭐',
    tooltip: 'Consistently high marks across deliverables.',
  },
  TOP_RATED_PLUS: {
    label: 'Top Rated Plus',
    tone: 'bg-purple-50 text-purple-800 ring-purple-200',
    icon: '⭐⭐',
    tooltip: 'Top of Top Rated with significant revenue.',
  },
  EXPERT_VETTED: {
    label: 'Expert Vetted',
    tone: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    icon: '✓',
    tooltip: 'Hand-picked by Collabhype.',
  },
};

export default function CreatorBadge({ badge, size = 'sm', className }) {
  if (!badge || badge === 'NONE') return null;
  const meta = BADGE_META[badge];
  if (!meta) return null;

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      title={meta.tooltip}
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
        meta.tone,
        sizes[size] ?? sizes.sm,
        className,
      )}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  );
}
