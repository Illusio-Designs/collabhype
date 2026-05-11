'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, apiError } from '@/lib/apiClient';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert, Button, Spinner } from '@/components/ui';

export default function AddPackageButton({ packageId, slug }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <Button fullWidth disabled>
        <Spinner size="sm" /> Loading…
      </Button>
    );
  }

  if (!user) {
    return (
      <Link href={`/login?next=/packages/${slug}`} className="block">
        <Button fullWidth>Sign in to add to cart</Button>
      </Link>
    );
  }

  if (user.role !== 'BRAND') {
    return (
      <Alert variant="info">Only brand accounts can purchase packages.</Alert>
    );
  }

  async function add() {
    setBusy(true);
    setErr(null);
    try {
      await apiClient.post('/api/v1/cart/items', {
        itemType: 'PACKAGE',
        packageId,
        qty: 1,
      });
      setAdded(true);
    } catch (e) {
      setErr(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  if (added) {
    return (
      <>
        <Button fullWidth onClick={() => router.push('/cart')}>
          View cart →
        </Button>
        <Button variant="ghost" fullWidth size="sm" onClick={() => setAdded(false)} className="mt-2">
          Add another
        </Button>
      </>
    );
  }

  return (
    <>
      <Button fullWidth onClick={add} loading={busy}>
        Add to cart
      </Button>
      {err && (
        <Alert variant="danger" className="mt-2">
          {err}
        </Alert>
      )}
    </>
  );
}
