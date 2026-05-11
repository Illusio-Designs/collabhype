import clsx from 'clsx';

const PADS = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-8' };

export default function Card({
  padding = 'md',
  hover = false,
  className,
  children,
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag
      className={clsx(
        'rounded-2xl border border-zinc-200 bg-white shadow-sm',
        PADS[padding],
        hover &&
          'transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
