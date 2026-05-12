'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, apiError } from '@/lib/apiClient';
import { isDemoMode } from '@/lib/auth';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert, Badge, Button, Card, Spinner, useToast } from '@/components/ui';
import { formatCount, PLATFORM_LABEL } from '@/lib/format';

// Demo follower presets used when "Connect" is clicked in demo mode (no
// real OAuth round-trip available).
const DEMO_CONNECT_PRESET = {
  INSTAGRAM: { handle: 'creator.demo', followers: 24800, engagementRate: 4.3 },
  YOUTUBE: { handle: 'CreatorDemo', followers: 6400, engagementRate: 2.7 },
};

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/influencers/me/socials');
      setSocials(data.socials ?? []);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  async function connect(platform) {
    setBusy(platform);
    const upper = platform.toUpperCase();

    // Demo mode: skip the OAuth round-trip and locally simulate a connection
    // so the UI updates immediately. Real backend still uses the proper
    // OAuth redirect flow.
    if (isDemoMode()) {
      const preset = DEMO_CONNECT_PRESET[upper] ?? DEMO_CONNECT_PRESET.INSTAGRAM;
      setSocials((prev) => {
        const without = prev.filter((s) => s.platform !== upper);
        return [
          ...without,
          {
            id: `demo-${upper.toLowerCase()}`,
            platform: upper,
            handle: preset.handle,
            profileUrl: `#demo-${upper.toLowerCase()}`,
            followers: preset.followers,
            engagementRate: preset.engagementRate,
            isVerified: false,
            lastSyncedAt: new Date().toISOString(),
          },
        ];
      });
      toast.push({
        variant: 'success',
        title: `${PLATFORM_LABEL[upper] ?? upper} connected`,
        body: `Demo: @${preset.handle}`,
      });
      setBusy(null);
      return;
    }

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
    if (isDemoMode()) {
      setSocials((prev) => prev.filter((s) => s.platform !== platform));
      toast.push({ variant: 'success', title: 'Disconnected', body: 'Demo' });
      setBusy(null);
      return;
    }
    try {
      await apiClient.delete(`/api/v1/influencers/me/socials/${platform}`);
      toast.push({ variant: 'success', title: 'Disconnected' });
      await load();
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
      <span className="eyebrow">Settings</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Connect socials</h1>
      <p className="mt-2 text-zinc-600">
        We pull real follower counts and engagement from your accounts — never self-reported.
      </p>

      <div className="mt-8 space-y-4">
        <PlatformCard
          platform="instagram"
          name="Instagram"
          desc="Requires a Business or Creator account linked to a Facebook Page."
          gradient="from-accent-500 via-brand-500 to-brand-800"
          account={byPlatform('INSTAGRAM')}
          onConnect={() => connect('instagram')}
          onDisconnect={() => disconnect('INSTAGRAM')}
          busy={busy === 'instagram' || busy === 'INSTAGRAM'}
        />
        <PlatformCard
          platform="youtube"
          name="YouTube"
          desc="Any Google account with an active channel."
          gradient="from-red-500 to-red-700"
          account={byPlatform('YOUTUBE')}
          onConnect={() => connect('youtube')}
          onDisconnect={() => disconnect('YOUTUBE')}
          busy={busy === 'youtube' || busy === 'YOUTUBE'}
        />
        <PlatformCard
          platform="tiktok"
          name="TikTok"
          desc="Coming soon — TikTok for Creators API access pending."
          gradient="from-zinc-800 via-zinc-900 to-black"
          account={byPlatform('TIKTOK')}
          onConnect={() => connect('tiktok')}
          onDisconnect={() => disconnect('TIKTOK')}
          busy={busy === 'tiktok' || busy === 'TIKTOK'}
          disabled
        />
      </div>

      <Alert variant="info" title="Privacy" className="mt-8">
        Tokens are encrypted at rest with AES-256-GCM. We only read profile + recent post stats —
        we never post on your behalf.
      </Alert>
    </div>
  );
}

function PlatformCard({ name, desc, gradient, account, onConnect, onDisconnect, busy, disabled }) {
  const connected = !!account;
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start gap-4">
        <div
          className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
        >
          {name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-900">{name}</h3>
            {disabled ? (
              <Badge variant="warning">Coming soon</Badge>
            ) : connected ? (
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
        <div className="flex w-full flex-shrink-0 gap-2 sm:w-auto">
          {disabled ? (
            <Button variant="outline" disabled fullWidth>
              Coming soon
            </Button>
          ) : connected ? (
            <Button variant="outline" onClick={onDisconnect} loading={busy} fullWidth>
              Disconnect
            </Button>
          ) : (
            <Button onClick={onConnect} loading={busy} fullWidth>
              Connect
            </Button>
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
