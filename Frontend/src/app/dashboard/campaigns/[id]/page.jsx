'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import { dedupedGet, invalidate } from '@/lib/apiCache';
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  EmptyState,
  FormField,
  Input,
  Modal,
  Spinner,
  Tabs,
  Textarea,
  useToast,
} from '@/components/ui';
import Milestone, {
  DELIVERABLE_STEPS,
  deliverableActiveKey,
} from '@/components/dashboard/Milestone';
import MultiImageUpload from '@/components/dashboard/MultiImageUpload';
import { DELIVERABLE_LABEL, formatCount, formatINR, PLATFORM_LABEL } from '@/lib/format';

const CAMPAIGN_BADGE = {
  DRAFT: { variant: 'default', label: 'Draft' },
  BRIEF_SENT: { variant: 'info', label: 'Brief sent' },
  IN_PROGRESS: { variant: 'warning', label: 'In progress' },
  REVIEW: { variant: 'warning', label: 'In review' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
};

const DELIV_BADGE = {
  PENDING: { variant: 'default', label: 'Pending' },
  DRAFT_SUBMITTED: { variant: 'info', label: 'Awaiting approval' },
  REVISION_REQUESTED: { variant: 'warning', label: 'Revision requested' },
  APPROVED: { variant: 'success', label: 'Approved · post it' },
  POSTED: { variant: 'success', label: 'Posted · awaiting payout' },
  PAID: { variant: 'success', label: 'Paid' },
};

function dateStr(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CampaignDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params.id;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [briefOpen, setBriefOpen] = useState(false);
  const [actionDeliv, setActionDeliv] = useState(null); // { id, action: 'draft' | 'posted' | 'revise' }

  const load = useCallback(
    async ({ force = false } = {}) => {
      setLoading(true);
      try {
        const data = await dedupedGet(`/api/v1/campaigns/${id}`, { force });
        setCampaign(data.campaign);
      } catch (e) {
        toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
      } finally {
        setLoading(false);
      }
    },
    [id, toast],
  );

  // Any deliverable transition can move the campaign's own status, so the
  // cached detail AND the cached list both go stale.
  const reload = useCallback(async () => {
    invalidate('/api/v1/campaigns');
    await load({ force: true });
  }, [load]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function approve(deliv) {
    try {
      await apiClient.post(`/api/v1/deliverables/${deliv.id}/approve`);
      toast.push({ variant: 'success', title: 'Approved' });
      await reload();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    }
  }

  async function sendBrief() {
    try {
      await apiClient.post(`/api/v1/campaigns/${id}/send-brief`);
      toast.push({
        variant: 'success',
        title: 'Brief sent',
        body: 'Creators can see it and their delivery addresses are now visible.',
      });
      await reload();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    }
  }

  async function releasePayment(deliv) {
    try {
      await apiClient.post(`/api/v1/deliverables/${deliv.id}/release-payment`);
      toast.push({ variant: 'success', title: 'Payment released', body: 'Payout queued.' });
      // Releasing payment queues a payout, which the creator's payouts page
      // reads from its own cache key.
      invalidate('/api/v1/influencers/me/payouts');
      await reload();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    }
  }

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!campaign) return null;

  const isBrand = user?.role === 'BRAND';
  const meta = CAMPAIGN_BADGE[campaign.status] ?? { variant: 'default', label: campaign.status };
  const deliverables = campaign.deliverables ?? [];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaigns', href: '/dashboard/campaigns' },
          { label: campaign.title || 'Campaign' },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold tracking-tight text-zinc-900">
            {campaign.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            {campaign.order?.orderNumber && (
              <span className="font-mono text-zinc-700">{campaign.order.orderNumber}</span>
            )}
            {!isBrand && campaign.order?.brand?.brandProfile?.companyName && (
              <span>· {campaign.order.brand.brandProfile.companyName}</span>
            )}
            <span>·</span>
            <span>Created {dateStr(campaign.createdAt)}</span>
          </div>
        </div>
        <Badge variant={meta.variant} size="lg">
          {meta.label}
        </Badge>
      </div>

      <div className="mt-8">
        <Tabs
          tabs={[
            {
              label: 'Overview',
              content: (
                <OverviewTab
                  campaign={campaign}
                  isBrand={isBrand}
                  onEdit={() => setBriefOpen(true)}
                  onSendBrief={sendBrief}
                />
              ),
            },
            {
              label: `Deliverables (${deliverables.length})`,
              content: deliverables.length ? (
                <DeliverableList
                  deliverables={deliverables}
                  isBrand={isBrand}
                  onAction={(id, action) => setActionDeliv({ id, action })}
                  onApprove={approve}
                  onRelease={releasePayment}
                />
              ) : (
                <EmptyState
                  title="No deliverables yet"
                  description={
                    isBrand
                      ? 'Creators are being matched to this package — deliverables will appear here shortly.'
                      : 'Check back soon — the brand is still setting up.'
                  }
                />
              ),
            },
          ]}
        />
      </div>

      {/* Brand: edit brief modal */}
      <EditBriefModal
        open={briefOpen}
        campaign={campaign}
        onClose={() => setBriefOpen(false)}
        onSaved={() => {
          setBriefOpen(false);
          reload();
        }}
      />

      {/* Influencer/Brand action modals */}
      <DeliverableActionModal
        action={actionDeliv}
        onClose={() => setActionDeliv(null)}
        onDone={() => {
          setActionDeliv(null);
          reload();
        }}
      />
    </div>
  );
}

// ============================ overview ============================

// Aggregate roster stats for a campaign (used for auto-assigned Nano packs
// where listing every creator individually is overwhelming).
function rosterSummary(deliverables = []) {
  const byCreator = new Map();
  for (const d of deliverables) {
    if (!byCreator.has(d.influencerId)) byCreator.set(d.influencerId, d.influencer);
  }
  const creators = [...byCreator.values()];
  const reach = creators.reduce((sum, inf) => {
    const followers = (inf?.socialAccounts ?? []).map((a) => a.followers ?? 0);
    return sum + (followers.length ? Math.max(...followers) : 0);
  }, 0);
  const isDone = (s) => ['POSTED', 'PAID'].includes(s);
  const isApproved = (s) => ['APPROVED', 'POSTED', 'PAID'].includes(s);
  return {
    creatorCount: byCreator.size,
    total: deliverables.length,
    approved: deliverables.filter((d) => isApproved(d.status)).length,
    posted: deliverables.filter((d) => isDone(d.status)).length,
    reach,
  };
}

function OverviewTab({ campaign, isBrand, onEdit, onSendBrief }) {
  const roster = rosterSummary(campaign.deliverables ?? []);
  const refImages = Array.isArray(campaign.referenceImages) ? campaign.referenceImages : [];
  const briefSent = !!campaign.briefSentAt;
  // Unique creators on this campaign (for the delivery-address list).
  const creators = [];
  const seen = new Set();
  for (const d of campaign.deliverables ?? []) {
    if (d.influencer && !seen.has(d.influencerId)) {
      seen.add(d.influencerId);
      creators.push(d.influencer);
    }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {campaign.slotsTarget != null && (
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Creator recruiting</h2>
              <Badge variant={campaign.isRecruiting ? 'warning' : 'success'}>
                {campaign.isRecruiting ? 'Recruiting' : 'Filled'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {campaign.slotsFilled ?? 0} of {campaign.slotsTarget} creators have accepted this
              package. Matching creators are notified automatically.
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{
                  width: `${campaign.slotsTarget ? Math.round(((campaign.slotsFilled ?? 0) / campaign.slotsTarget) * 100) : 0}%`,
                }}
              />
            </div>
          </Card>
        )}
        {roster.creatorCount > 0 && (
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Assigned creators</h2>
              <Badge variant="brand">{roster.creatorCount} creators</Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              Creators were auto-matched to this package. Track their progress below.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <RosterStat label="Creators" value={formatCount(roster.creatorCount)} />
              <RosterStat label="Est. reach" value={formatCount(roster.reach)} />
              <RosterStat label="Deliverables" value={String(roster.total)} />
              <RosterStat
                label="Posted"
                value={`${roster.posted}/${roster.total}`}
              />
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{
                  width: `${roster.total ? Math.round((roster.posted / roster.total) * 100) : 0}%`,
                }}
              />
            </div>
          </Card>
        )}
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Brief</h2>
            {isBrand && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit brief
              </Button>
            )}
          </div>
          <div className="mt-4 space-y-4 text-sm">
            {campaign.brief ? (
              <p className="whitespace-pre-wrap leading-7 text-zinc-700">{campaign.brief}</p>
            ) : (
              <p className="italic text-zinc-400">
                {isBrand ? 'No brief yet — click "Edit brief" to add one.' : 'Brand hasn\'t added a brief yet.'}
              </p>
            )}
            {campaign.hashtags && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Hashtags</div>
                <div className="mt-1 text-zinc-700">{campaign.hashtags}</div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {campaign.doList && (
                <div className="rounded-lg bg-green-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-green-700">Do</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{campaign.doList}</div>
                </div>
              )}
              {campaign.dontList && (
                <div className="rounded-lg bg-red-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-red-700">Don't</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{campaign.dontList}</div>
                </div>
              )}
            </div>
            {(campaign.productLink || refImages.length > 0) && (
              <div className="space-y-3 border-t border-zinc-100 pt-4">
                {campaign.productLink && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Product link
                    </div>
                    <a
                      href={campaign.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-sm text-brand-700 hover:underline"
                    >
                      {campaign.productLink}
                    </a>
                  </div>
                )}
                {refImages.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Reference images
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {refImages.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="" className="h-20 w-20 rounded-lg border border-zinc-200 object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Brand: send the brief to unlock delivery addresses */}
        {isBrand && (
          <Card padding="lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Send brief to creators</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {briefSent
                    ? `Sent ${dateStr(campaign.briefSentAt)}. Delivery addresses are unlocked below.`
                    : 'Add your brief, product link and images, then send it to reveal delivery addresses for shipping.'}
                </p>
              </div>
              <Button onClick={onSendBrief} variant={briefSent ? 'outline' : 'primary'}>
                {briefSent ? 'Resend brief' : 'Send brief'}
              </Button>
            </div>
          </Card>
        )}

        {/* Delivery addresses — visible to the brand only after the brief is sent */}
        {isBrand && briefSent && creators.length > 0 && (
          <Card padding="lg">
            <h2 className="text-base font-semibold text-zinc-900">Delivery addresses</h2>
            <p className="mt-1 text-sm text-zinc-500">Ship products for the reel/UGC to these creators.</p>
            <div className="mt-4 space-y-3">
              {creators.map((c) => (
                <div key={c.id} className="rounded-xl border border-zinc-100 p-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={c.user?.avatarUrl} name={c.user?.fullName ?? 'Creator'} size="sm" />
                    <div className="text-sm font-semibold text-zinc-900">
                      {c.user?.fullName ?? 'Creator'}
                    </div>
                  </div>
                  {c.shippingAddress ? (
                    <div className="mt-2 text-sm text-zinc-700">
                      {c.shippingAddress}
                      {c.city ? `, ${c.city}` : ''}
                      {c.state ? `, ${c.state}` : ''}
                      {c.pincode ? ` — ${c.pincode}` : ''}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm italic text-zinc-400">
                      No delivery address on file yet.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <aside className="space-y-4">
        <Card padding="lg">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Timeline
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Start</dt>
              <dd className="font-medium text-zinc-900">{dateStr(campaign.startDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">End</dt>
              <dd className="font-medium text-zinc-900">{dateStr(campaign.endDate)}</dd>
            </div>
            {campaign.order?.paidAt && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Order paid</dt>
                <dd className="font-medium text-zinc-900">{dateStr(campaign.order.paidAt)}</dd>
              </div>
            )}
          </dl>
        </Card>

        {campaign.order?.total != null && (
          <Card padding="lg">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Budget
            </h3>
            <div className="mt-2 text-3xl font-bold text-zinc-900">
              {formatINR(campaign.order.total)}
            </div>
            <div className="mt-1 text-xs text-zinc-500">Held in escrow until delivery</div>
          </Card>
        )}
      </aside>
    </div>
  );
}

function RosterStat({ label, value }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-zinc-900">{value}</div>
    </div>
  );
}

// ============================ deliverables ============================

function DeliverableList({ deliverables, isBrand, onAction, onApprove, onRelease }) {
  // Group by influencer for clarity
  const groups = new Map();
  for (const d of deliverables) {
    const key = d.influencerId;
    if (!groups.has(key)) groups.set(key, { influencer: d.influencer, items: [] });
    groups.get(key).items.push(d);
  }

  return (
    <div className="space-y-5">
      {[...groups.values()].map((g) => (
        <Card padding="lg" key={g.influencer?.id ?? Math.random()}>
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <Avatar
              src={g.influencer?.user?.avatarUrl}
              name={g.influencer?.user?.fullName ?? 'Creator'}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-zinc-900">
                {g.influencer?.user?.fullName ?? 'Creator'}
              </div>
              <div className="truncate text-xs text-zinc-500">
                {(g.influencer?.socialAccounts ?? [])
                  .map((s) => `${PLATFORM_LABEL[s.platform] ?? s.platform} ${formatCount(s.followers)}`)
                  .join(' · ')}
              </div>
            </div>
            <Badge>{g.items.length} item{g.items.length === 1 ? '' : 's'}</Badge>
          </div>
          <ul className="mt-4 space-y-2">
            {g.items.map((d) => (
              <DeliverableRow
                key={d.id}
                deliverable={d}
                isBrand={isBrand}
                onAction={onAction}
                onApprove={onApprove}
                onRelease={onRelease}
              />
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function DeliverableRow({ deliverable: d, isBrand, onAction, onApprove, onRelease }) {
  const meta = DELIV_BADGE[d.status] ?? { variant: 'default', label: d.status };
  return (
    <li className="rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-900">
            {DELIVERABLE_LABEL[d.deliverable] ?? d.deliverable}
          </div>
          <div className="text-xs text-zinc-500">{formatINR(d.amountPayable)}</div>
          {d.feedback && (
            <div className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-900">
              Feedback: {d.feedback}
            </div>
          )}
          {(d.draftUrl || d.postedUrl) && (
            <div className="mt-2 flex gap-3 text-xs">
              {d.draftUrl && (
                <a
                  href={d.draftUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 hover:underline"
                >
                  View draft →
                </a>
              )}
              {d.postedUrl && (
                <a
                  href={d.postedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 hover:underline"
                >
                  View live post →
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {!isBrand && (d.status === 'PENDING' || d.status === 'REVISION_REQUESTED') && (
            <Button size="sm" onClick={() => onAction(d.id, 'draft')}>
              Submit draft
            </Button>
          )}
          {!isBrand && d.status === 'APPROVED' && (
            <Button size="sm" onClick={() => onAction(d.id, 'posted')}>
              Mark posted
            </Button>
          )}
          {isBrand && d.status === 'DRAFT_SUBMITTED' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onAction(d.id, 'revise')}>
                Request revision
              </Button>
              <Button size="sm" onClick={() => onApprove(d)}>
                Approve
              </Button>
            </>
          )}
          {isBrand && d.status === 'POSTED' && (
            <Button size="sm" onClick={() => onRelease(d)}>
              Release payment
            </Button>
          )}
        </div>
      </div>

      {/* Milestone tracker — visualises where this deliverable sits in its lifecycle */}
      <div className="mt-4 rounded-md bg-white px-3 py-3">
        <Milestone steps={DELIVERABLE_STEPS} activeKey={deliverableActiveKey(d)} />
      </div>
    </li>
  );
}

// ============================ modals ============================

function EditBriefModal({ open, campaign, onClose, onSaved }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    brief: '',
    hashtags: '',
    doList: '',
    dontList: '',
    productLink: '',
    referenceImages: [],
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (campaign && open) {
      setForm({
        title: campaign.title ?? '',
        brief: campaign.brief ?? '',
        hashtags: campaign.hashtags ?? '',
        doList: campaign.doList ?? '',
        dontList: campaign.dontList ?? '',
        productLink: campaign.productLink ?? '',
        referenceImages: campaign.referenceImages ?? [],
        startDate: campaign.startDate ? campaign.startDate.slice(0, 10) : '',
        endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : '',
      });
    }
  }, [campaign, open]);

  async function save() {
    setSaving(true);
    try {
      await apiClient.patch(`/api/v1/campaigns/${campaign.id}`, {
        title: form.title || undefined,
        brief: form.brief || undefined,
        hashtags: form.hashtags || undefined,
        doList: form.doList || undefined,
        dontList: form.dontList || undefined,
        productLink: form.productLink || '',
        referenceImages: form.referenceImages,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      });
      toast.push({ variant: 'success', title: 'Brief saved' });
      onSaved?.();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Save failed', body: apiError(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Edit campaign brief"
      description="Creators see this when working on their drafts."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save brief
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Campaign title">
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </FormField>
        <FormField label="Brief" hint="Goals, tone, target audience.">
          <Textarea
            rows={5}
            value={form.brief}
            onChange={(e) => setForm((f) => ({ ...f, brief: e.target.value }))}
          />
        </FormField>
        <FormField label="Hashtags" hint="Comma or space separated">
          <Input
            value={form.hashtags}
            onChange={(e) => setForm((f) => ({ ...f, hashtags: e.target.value }))}
            placeholder="#brandname #campaign2026"
          />
        </FormField>
        <FormField label="Product link" hint="Link to the product for the reel/post.">
          <Input
            type="url"
            value={form.productLink}
            onChange={(e) => setForm((f) => ({ ...f, productLink: e.target.value }))}
            placeholder="https://yourbrand.com/product"
          />
        </FormField>
        <FormField label="Reference images" hint="Product photos / examples for the creator.">
          <MultiImageUpload
            value={form.referenceImages}
            onChange={(urls) => setForm((f) => ({ ...f, referenceImages: urls }))}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Do">
            <Textarea
              rows={3}
              value={form.doList}
              onChange={(e) => setForm((f) => ({ ...f, doList: e.target.value }))}
            />
          </FormField>
          <FormField label="Don't">
            <Textarea
              rows={3}
              value={form.dontList}
              onChange={(e) => setForm((f) => ({ ...f, dontList: e.target.value }))}
            />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Start date">
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </FormField>
          <FormField label="End date">
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </FormField>
        </div>
      </div>
    </Modal>
  );
}

function DeliverableActionModal({ action, onClose, onDone }) {
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!action) {
      setUrl('');
      setFeedback('');
    }
  }, [action]);

  if (!action) return null;

  const isDraft = action.action === 'draft';
  const isPosted = action.action === 'posted';
  const isRevise = action.action === 'revise';

  async function submit() {
    setBusy(true);
    try {
      if (isDraft) {
        await apiClient.post(`/api/v1/deliverables/${action.id}/draft`, { draftUrl: url });
        toast.push({ variant: 'success', title: 'Draft submitted' });
      } else if (isPosted) {
        await apiClient.post(`/api/v1/deliverables/${action.id}/posted`, { postedUrl: url });
        toast.push({ variant: 'success', title: 'Marked posted' });
      } else if (isRevise) {
        await apiClient.post(`/api/v1/deliverables/${action.id}/revise`, { feedback });
        toast.push({ variant: 'success', title: 'Revision requested' });
      }
      onDone?.();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed', body: apiError(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!action}
      onClose={onClose}
      size="md"
      title={
        isDraft
          ? 'Submit your draft'
          : isPosted
            ? 'Mark as posted'
            : 'Request revision'
      }
      description={
        isDraft
          ? 'Share a link to your draft (Google Drive, Dropbox, Notion, etc.)'
          : isPosted
            ? 'Paste the live post URL.'
            : 'Tell the creator what to change.'
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            loading={busy}
            disabled={(isRevise && !feedback.trim()) || ((isDraft || isPosted) && !url.trim())}
          >
            {isDraft ? 'Submit draft' : isPosted ? 'Mark posted' : 'Send'}
          </Button>
        </>
      }
    >
      {(isDraft || isPosted) && (
        <FormField label={isDraft ? 'Draft URL' : 'Posted URL'} required>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </FormField>
      )}
      {isRevise && (
        <FormField label="Feedback" required>
          <Textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Be specific so the creator can act on it."
          />
        </FormField>
      )}
    </Modal>
  );
}
