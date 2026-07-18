'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert, Badge, Button, Card, Modal, Spinner, useToast } from '@/components/ui';
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

  // Instagram account picker (creator has 2+ linked accounts).
  const [pickToken, setPickToken] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [choosing, setChoosing] = useState(null);

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
    const select = sp.get('select');
    if (error) {
      toast.push({ variant: 'danger', title: 'Connection failed', body: error });
      router.replace('/dashboard/socials');
    } else if (select) {
      // Creator has multiple Instagram accounts — fetch them to choose.
      setPickToken(select);
      router.replace('/dashboard/socials');
      apiClient
        .get('/api/v1/oauth/facebook/candidates', { params: { token: select } })
        .then(({ data }) => setCandidates(data.candidates ?? []))
        .catch((e) => {
          toast.push({ variant: 'danger', title: 'Could not load accounts', body: apiError(e) });
          setPickToken(null);
        });
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

  async function choose(igUserId) {
    setChoosing(igUserId);
    try {
      const { data } = await apiClient.post('/api/v1/oauth/facebook/select', {
        token: pickToken,
        igUserId,
      });
      toast.push({
        variant: 'success',
        title: 'Instagram connected',
        body: `@${data.account?.handle ?? ''}`,
      });
      setPickToken(null);
      setCandidates([]);
      invalidate('/api/v1/influencers/me/socials');
      load({ force: true });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Connection failed', body: apiError(e) });
    } finally {
      setChoosing(null);
    }
  }

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
        {byPlatform('INSTAGRAM') ? (
          <ConnectCard
            brand="instagram"
            title="Instagram"
            account={byPlatform('INSTAGRAM')}
            onDisconnect={() => disconnect('INSTAGRAM')}
            busy={busy}
          />
        ) : (
          <ConnectCard
            brand="facebook"
            title="Connect Instagram"
            desc="Sign in with Facebook to link your Instagram Business or Creator account (via its connected Facebook Page)."
            account={null}
            onConnect={() => connect('facebook')}
            busy={busy}
          />
        )}
      </div>

      <Alert variant="info" title="Privacy" className="mt-8">
        Tokens are encrypted at rest with AES-256-GCM. We only read profile + recent post stats —
        we never post on your behalf.
      </Alert>

      <Modal
        open={!!pickToken}
        onClose={() => {
          if (!choosing) {
            setPickToken(null);
            setCandidates([]);
          }
        }}
        size="md"
        title="Choose an Instagram account"
        description="Your Facebook has more than one linked Instagram account. Pick the one to connect."
      >
        {candidates.length === 0 ? (
          <div className="grid place-items-center py-8 text-brand-700">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-2">
            {candidates.map((c) => (
              <button
                key={c.igUserId}
                type="button"
                onClick={() => choose(c.igUserId)}
                disabled={!!choosing}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40 disabled:opacity-60"
              >
                {c.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {(c.username || '?')[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-zinc-900">@{c.username}</div>
                  <div className="truncate text-xs text-zinc-500">
                    {formatCount(c.followers)} followers
                    {c.pageName ? ` · via ${c.pageName}` : ''}
                  </div>
                </div>
                {choosing === c.igUserId && <Spinner size="sm" className="text-brand-700" />}
              </button>
            ))}
          </div>
        )}
      </Modal>
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

const BRANDS = {
  instagram: {
    Icon: InstagramIcon,
    iconBox: 'bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]',
    button:
      'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95',
    key: 'instagram',
    cta: 'Connect with Instagram',
  },
  facebook: {
    Icon: FacebookIcon,
    iconBox: 'bg-[#1877F2]',
    button: 'bg-[#1877F2] hover:bg-[#1466d6]',
    key: 'facebook',
    cta: 'Connect with Facebook',
  },
};

function ConnectCard({ brand, title, desc, account, onConnect, onDisconnect, busy }) {
  const b = BRANDS[brand];
  const connected = !!account;
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start gap-4">
        <div
          className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-white shadow-md ${b.iconBox}`}
        >
          <b.Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
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
            <p className="mt-1 text-sm text-zinc-600">{desc}</p>
          )}
        </div>

        <div className="flex w-full flex-shrink-0 sm:w-auto">
          {connected ? (
            <Button
              variant="outline"
              onClick={onDisconnect}
              loading={busy === 'INSTAGRAM'}
              fullWidth
            >
              Disconnect
            </Button>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={!!busy}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 sm:w-auto ${b.button}`}
            >
              <b.Icon className="h-4 w-4" />
              {busy === b.key ? 'Connecting…' : b.cta}
            </button>
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
