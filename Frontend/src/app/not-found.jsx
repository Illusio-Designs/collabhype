import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="text-sm font-semibold uppercase tracking-wider text-brand-600">404</div>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900">Page not found</h1>
      <p className="mt-4 text-zinc-600">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
