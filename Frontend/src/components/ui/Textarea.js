import { forwardRef } from 'react';
import clsx from 'clsx';

const Textarea = forwardRef(function Textarea(
  { error, rows = 4, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        'block w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-1',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-zinc-300 focus:border-brand-500 focus:ring-brand-500',
        className,
      )}
      {...rest}
    />
  );
});

export default Textarea;
