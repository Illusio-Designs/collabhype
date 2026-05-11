import clsx from 'clsx';

export default function Skeleton({ variant = 'rect', className, ...rest }) {
  const shape =
    variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'h-4 rounded' : 'rounded-lg';
  return (
    <div
      className={clsx('animate-pulse bg-zinc-200', shape, className)}
      aria-hidden
      {...rest}
    />
  );
}
