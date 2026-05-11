'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, apiError } from '@/lib/apiClient';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Spinner,
} from '@/components/ui';
import {
  DELIVERABLE_LABEL,
  PLATFORM_LABEL,
  TIER_LABEL,
  formatCount,
  formatINR,
} from '@/lib/format';

export default function CartPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // Auth gate
  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace('/login?next=/cart');
    else if (user.role !== 'BRAND') router.replace('/dashboard');
  }, [authLoading, user, router]);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/api/v1/cart');
      setCart(data.cart);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'BRAND') loadCart();
  }, [user, loadCart]);

  async function removeItem(itemId) {
    try {
      await apiClient.delete(`/api/v1/cart/items/${itemId}`);
      await loadCart();
    } catch (e) {
      setError(apiError(e));
    }
  }

  async function updateQty(itemId, qty) {
    if (qty < 1) return;
    try {
      await apiClient.patch(`/api/v1/cart/items/${itemId}`, { qty });
      await loadCart();
    } catch (e) {
      setError(apiError(e));
    }
  }

  async function checkout() {
    if (!cart?.items?.length) return;
    setCheckingOut(true);
    setError(null);
    try {
      const { data: order } = await apiClient.post('/api/v1/checkout/create-order');
      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.');
      }
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Collabhype',
        description: `Order ${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        prefill: { name: user.fullName, email: user.email, contact: user.phone || '' },
        theme: { color: '#6d28d9' },
        handler: async (response) => {
          try {
            await apiClient.post('/api/v1/checkout/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push(
              `/checkout/success?order=${order.orderId}&num=${encodeURIComponent(order.orderNumber)}`,
            );
          } catch (e) {
            setError(apiError(e));
            setCheckingOut(false);
          }
        },
        modal: { ondismiss: () => setCheckingOut(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(resp?.error?.description || 'Payment failed');
        setCheckingOut(false);
      });
      rzp.open();
    } catch (e) {
      setError(apiError(e));
      setCheckingOut(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="grid h-[40vh] place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Your cart</h1>
        <div className="mt-10">
          <EmptyState
            title="Your cart is empty"
            description="Add a package or pick a few creators to get started."
            action={
              <div className="flex gap-3">
                <Link href="/packages">
                  <Button>Browse packages</Button>
                </Link>
                <Link href="/influencers">
                  <Button variant="outline">Find influencers</Button>
                </Link>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Your cart</h1>
      <p className="mt-2 text-zinc-600">
        {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr,380px]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onRemove={() => removeItem(item.id)}
              onUpdateQty={(q) => updateQty(item.id, q)}
            />
          ))}
        </div>

        <Card padding="lg" as="aside" className="lg:sticky lg:top-20 lg:h-fit">
          <h2 className="text-lg font-semibold text-zinc-900">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-600">Subtotal</dt>
              <dd className="font-medium text-zinc-900">{formatINR(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-zinc-500">
              <dt>Taxes</dt>
              <dd>Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
            <span className="text-base font-semibold text-zinc-900">Total</span>
            <span className="text-2xl font-bold text-zinc-900">{formatINR(cart.subtotal)}</span>
          </div>

          <Button
            onClick={checkout}
            loading={checkingOut}
            fullWidth
            size="lg"
            className="mt-6"
          >
            Proceed to checkout
          </Button>

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          <p className="mt-3 text-center text-xs text-zinc-500">
            Funds held in escrow until creators deliver.
          </p>
        </Card>
      </div>
    </div>
  );
}

function CartItemRow({ item, onRemove, onUpdateQty }) {
  const lineTotal = Number(item.price) * item.qty;
  return (
    <Card className="flex gap-4">
      <div className="min-w-0 flex-1">
        {item.itemType === 'PACKAGE' ? <PackageRow item={item} /> : <InfluencerRow item={item} />}
      </div>
      <div className="flex flex-col items-end justify-between gap-3">
        <button
          onClick={onRemove}
          className="text-xs font-medium text-red-600 transition hover:text-red-700 hover:underline"
        >
          Remove
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdateQty(item.qty - 1)}
            disabled={item.qty <= 1}
            className="h-7 w-7 rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">{item.qty}</span>
          <button
            onClick={() => onUpdateQty(item.qty + 1)}
            className="h-7 w-7 rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <div className="text-lg font-bold text-zinc-900">{formatINR(lineTotal)}</div>
      </div>
    </Card>
  );
}

function PackageRow({ item }) {
  const pkg = item.package;
  const deliverables = Array.isArray(pkg?.deliverables) ? pkg.deliverables : [];
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">{TIER_LABEL[pkg?.tier] ?? pkg?.tier}</Badge>
        {pkg?.niche && <Badge>{pkg.niche.name}</Badge>}
      </div>
      <h3 className="mt-2 text-base font-semibold text-zinc-900">{pkg?.title ?? 'Package'}</h3>
      <div className="mt-1 text-xs text-zinc-500">
        {pkg?.influencerCount ?? 0} influencers per pack
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {deliverables.slice(0, 4).map((d, i) => (
          <Badge key={i}>
            {d.qty}× {DELIVERABLE_LABEL[d.type] ?? d.type}
          </Badge>
        ))}
      </div>
    </>
  );
}

function InfluencerRow({ item }) {
  const inf = item.influencer;
  const name = inf?.user?.fullName ?? 'Influencer';
  const deliverables = Array.isArray(item.deliverables) ? item.deliverables : [];
  const top = inf?.socialAccounts?.[0];
  return (
    <>
      <h3 className="text-base font-semibold text-zinc-900">{name}</h3>
      {top && (
        <div className="text-xs text-zinc-500">
          {PLATFORM_LABEL[top.platform] ?? top.platform} · {formatCount(top.followers)} followers
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {deliverables.map((d, i) => (
          <Badge key={i}>
            {d.qty}× {DELIVERABLE_LABEL[d.type] ?? d.type}
          </Badge>
        ))}
      </div>
    </>
  );
}
