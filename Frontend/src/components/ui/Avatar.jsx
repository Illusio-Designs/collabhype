import clsx from 'clsx';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl',
};

function initialsOf(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ src, name = '?', size = 'md', className, ring = false }) {
  const inner = (
    <div
      className={clsx(
        'grid place-items-center rounded-full bg-brand-100 font-bold text-brand-700',
        SIZES[size],
      )}
    >
      {initialsOf(name)}
    </div>
  );
  const wrap = clsx(ring && 'ring-2 ring-white');
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={clsx('rounded-full object-cover', SIZES[size], wrap, className)}
      />
    );
  }
  return <div className={clsx(wrap, className)}>{inner}</div>;
}

export function AvatarGroup({ avatars = [], max = 4, size = 'md' }) {
  const shown = avatars.slice(0, max);
  const overflow = avatars.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((a, i) => (
        <Avatar key={i} {...a} size={size} ring />
      ))}
      {overflow > 0 && (
        <div
          className={clsx(
            'grid place-items-center rounded-full bg-zinc-200 font-semibold text-zinc-700 ring-2 ring-white',
            SIZES[size],
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
