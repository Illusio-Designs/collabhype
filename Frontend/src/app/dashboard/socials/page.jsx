'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert, Badge, Button, Card, Spinner, useToast } from '@/components/ui';
import PageHeader from '@/components/dashboard/PageHeader';
import { formatCount, PLATFORM_LABEL } from '@/lib/format';

function SocialsInner() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();

  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  // role gate
  useEffect(() => {
    if (!isLoading && user && user.role !== 'INFLUENCER') {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  const load = useCallback(
    async ({ force = false } = {}) => {
      setLoading(true);
      try {
        const data = await dedupedGet('/api/v1/influencers/me/socials', { force });
        setSocials(data.socials ?? []);
      } catch (e) {
        toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (user?.role === 'INFLUENCER') load();
  }, [user, load]);

  // Surface OAuth callback redirects
  useEffect(() => {
    const error = sp.get('error');
    const platform = sp.get('platform');
    const handle = sp.get('handle');
    if (error) {
      toast.push({ variant: 'danger', title: 'Connection failed', body: error });
      router.replace('/dashboard/socials');
    } else if (platform && handle) {
      toast.push({
        variant: 'success',
        title: `${PLATFORM_LABEL[platform.toUpperCase()] ?? platform} connected`,
        body: `@${handle}`,
      });
      router.replace('/dashboard/socials');
      // We just came back from a successful OAuth connect — the cached socials
      // list predates the new account.
      invalidate('/api/v1/influencers/me/socials');
      load({ force: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  async function connect(platform) {
    setBusy(platform);
    try {
      const { data } = await apiClient.get(`/api/v1/oauth/${platform}/start`);
      window.location.href = data.authUrl;
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Connection failed', body: apiError(e) });
      setBusy(null);
    }
  }

  async function disconnect(platform) {
    setBusy(platform);
    try {
      await apiClient.delete(`/api/v1/influencers/me/socials/${platform}`);
      toast.push({ variant: 'success', title: 'Disconnected' });
      invalidate('/api/v1/influencers/me/socials');
      await load({ force: true });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Disconnect failed', body: apiError(e) });
    } finally {
      setBusy(null);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  const byPlatform = (p) => socials.find((s) => s.platform === p);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Connect socials' },
        ]}
        eyebrow="Settings"
        title="Connect socials"
        subtitle="We pull real follower counts and engagement from your accounts — never self-reported."
      />

      <div className="mt-8 space-y-4">
        <InstagramCard
          account={byPlatform('INSTAGRAM')}
          onConnectInstagram={() => connect('instagram')}
          onConnectFacebook={() => connect('facebook')}
          onDisconnect={() => disconnect('INSTAGRAM')}
          busy={busy}
        />
      </div>

      <Alert variant="info" title="Privacy" className="mt-8">
        Tokens are encrypted at rest with AES-256-GCM. We only read profile + recent post stats —
        we never post on your behalf.
      </Alert>
    </div>
  );
}

// Official-style brand marks (inline SVG — CSP-safe, no external favicons).
function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17.3" cy="6.7" r="1.25" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22C18.34 21.2 22 17.06 22 12.06Z" />
    </svg>
  );
}

function InstagramCard({ account, onConnectInstagram, onConnectFacebook, onDisconnect, busy }) {
  const connected = !!account;
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start gap-4">
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md">
          <InstagramIcon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-900">Instagram</h3>
            {connected ? (
              <Badge variant="success" dot>
                Connected
              </Badge>
            ) : (
              <Badge>Not connected</Badge>
            )}
          </div>
          {connected ? (
            <div className="mt-2 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500">Handle</div>
                <div className="truncate font-medium text-zinc-900">@{account.handle}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500">Followers</div>
                <div className="font-medium text-zinc-900">{formatCount(account.followers)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500">Engagement</div>
                <div className="font-medium text-zinc-900">
                  {Number(account.engagementRate).toFixed(2)}%
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-zinc-600">
              Connect with Instagram directly, or via Facebook if your account is linked to a Page.
              Business or Creator account required.
            </p>
          )}
        </div>

        <div className="flex w-full flex-shrink-0 flex-col gap-2 sm:w-auto">
          {connected ? (
            <Button variant="outline" onClick={onDisconnect} loading={busy === 'INSTAGRAM'} fullWidth>
              Disconnect
            </Button>
          ) : (
            <>
              <button
                type="button"
                onClick={onConnectInstagram}
                disabled={!!busy}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
              >
                <InstagramIcon className="h-4 w-4" />
                {busy === 'instagram' ? 'Connecting…' : 'Instagram'}
              </button>
              <button
                type="button"
                onClick={onConnectFacebook}
                disabled={!!busy}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1466d6] disabled:opacity-60"
              >
                <FacebookIcon className="h-4 w-4" />
                {busy === 'facebook' ? 'Connecting…' : 'Facebook'}
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function SocialsPage() {
  return (
    <Suspense fallback={<Spinner size="lg" className="mx-auto my-16 text-brand-700" />}>
      <SocialsInner />
    </Suspense>
  );
}
