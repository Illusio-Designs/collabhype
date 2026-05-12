'use client';

import clsx from 'clsx';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

// Generic data table. Columns are declared with `accessor` (string key or
// function) and an optional custom `cell` renderer. Empty + loading states
// are baked in so list pages don't have to reimplement them.
//
// Usage:
//   <Table
//     columns={[
//       { header: 'Campaign', accessor: 'name' },
//       { header: 'Status', accessor: 'status', cell: (row) => <Badge>{row.status}</Badge> },
//       { header: 'Budget', accessor: 'budget', align: 'right',
//         cell: (row) => `₹${row.budget.toLocaleString('en-IN')}` },
//     ]}
//     data={rows}
//     onRowClick={(row) => …}
//   />

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'When data is available it will show up here.',
  emptyIcon,
  onRowClick,
  rowKey = (row, i) => row.id ?? i,
  className,
  size = 'md',
}) {
  const pad = size === 'sm' ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className={clsx('overflow-hidden rounded-2xl border border-zinc-200 bg-white', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key ?? col.header ?? i}
                  scope="col"
                  className={clsx(
                    'text-[11px] font-semibold uppercase tracking-wider text-zinc-500',
                    pad,
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.align !== 'right' && col.align !== 'center' && 'text-left',
                    col.width,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-zinc-500">
                    <Spinner size="sm" />
                    Loading…
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={rowKey(row, i)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={clsx(
                    onRowClick && 'cursor-pointer transition hover:bg-zinc-50',
                  )}
                >
                  {columns.map((col, j) => {
                    const value =
                      typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                          ? row[col.accessor]
                          : null;
                    const content = col.cell ? col.cell(row, i) : value;
                    return (
                      <td
                        key={col.key ?? col.header ?? j}
                        className={clsx(
                          'text-sm text-zinc-700',
                          pad,
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          col.mono && 'font-mono text-[13px]',
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
