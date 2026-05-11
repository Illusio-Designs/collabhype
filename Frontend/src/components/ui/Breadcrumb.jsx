import Link from 'next/link';

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-zinc-500">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg
                className="h-3 w-3 text-zinc-300"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {item.href ? (
              <Link href={item.href} className="transition hover:text-brand-700">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-zinc-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
