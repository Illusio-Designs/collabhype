'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  Modal,
  Select,
  Spinner,
  Textarea,
  useToast,
} from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';
import ScrollTable from '@/components/dashboard/ScrollTable';

const STATUS_META = {
  OPEN:          { variant: 'warning', label: 'Open' },
  IN_PROGRESS:   { variant: 'info',    label: 'In progress' },
  AWAITING_USER: { variant: 'info',    label: 'Awaiting user' },
  RESOLVED:      { variant: 'success', label: 'Resolved' },
  CLOSED:        { variant: 'default', label: 'Closed' },
};
const CATEGORY_META = {
  DISPUTE:   { variant: 'danger',  label: 'Dispute' },
  PAYOUT:    { variant: 'warning', label: 'Payout' },
  BILLING:   { variant: 'brand',   label: 'Billing' },
  CAMPAIGN:  { variant: 'info',    label: 'Campaign' },
  TECHNICAL: { variant: 'default', label: 'Technical' },
  OTHER:     { variant: 'default', label: 'Other' },
};
const PRIORITY_META = {
  URGENT: { variant: 'danger',  label: 'Urgent' },
  HIGH:   { variant: 'warning', label: 'High' },
  NORMAL: { variant: 'default', label: 'Normal' },
  LOW:    { variant: 'default', label: 'Low' },
};

const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label }));
const PRIORITY_OPTIONS = Object.entries(PRIORITY_META).map(([value, m]) => ({ value, label: m.label }));

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminSupportPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [isLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        apiClient.get('/api/v1/support/admin/tickets'),
        apiClient.get('/api/v1/support/admin/stats'),
      ]);
      setTickets(t.data.tickets ?? []);
      setStats(s.data);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  async function openTicket(id) {
    try {
      const { data } = await apiClient.get(`/api/v1/support/tickets/${id}`);
      setSelected(data.ticket);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    }
  }

  if (isLoading || !user || user.role !== 'ADMIN' || loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  const kpis = [
    { label: 'Open', value: String(stats?.open ?? 0) },
    { label: 'In progress', value: String(stats?.inProgress ?? 0) },
    { label: 'Awaiting user', value: String(stats?.awaitingUser ?? 0) },
    { label: 'Open disputes', value: String(stats?.openDisputes ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Platform admin</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Support queue</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Every open ticket sorted by priority. Disputes show up first.
        </p>
      </header>

      <KpiStrip kpis={kpis} />

      {tickets.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="Inbox zero"
            description="No support tickets right now — go take a walk."
          />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <ScrollTable>
            <table className="min-w-full">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold sm:px-6">Ticket</th>
                  <th className="px-3 py-3 text-left font-semibold sm:px-6">User</th>
                  <th className="px-3 py-3 text-left font-semibold sm:px-6">Category</th>
                  <th className="px-3 py-3 text-left font-semibold sm:px-6">Priority</th>
                  <th className="px-3 py-3 text-left font-semibold sm:px-6">Status</th>
                  <th className="px-3 py-3 text-left font-semibold sm:px-6">Updated</th>
                  <th className="px-3 py-3 sm:px-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {tickets.map((t) => {
                  const s = STATUS_META[t.status] ?? { variant: 'default', label: t.status };
                  const c = CATEGORY_META[t.category] ?? { variant: 'default', label: t.category };
                  const p = PRIORITY_META[t.priority] ?? { variant: 'default', label: t.priority };
                  return (
                    <tr
                      key={t.id}
                      className="cursor-pointer transition hover:bg-zinc-50"
                      onClick={() => openTicket(t.id)}
                    >
                      <td className="whitespace-nowrap px-3 py-3 sm:px-6">
                        <div className="font-mono text-xs font-semibold text-brand-700">
                          {t.ticketNumber}
                        </div>
                        <div className="truncate text-xs text-zinc-700">{t.subject}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-700 sm:px-6">
                        <div className="font-medium">{t.user?.fullName ?? '—'}</div>
                        <div className="text-xs text-zinc-500">{t.user?.role}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-6">
                        <Badge variant={c.variant}>{c.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-6">
                        <Badge variant={p.variant}>{p.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-6">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-500 sm:px-6">
                        {timeAgo(t.updatedAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right sm:px-6">
                        <Button size="sm" variant="outline">
                          Open
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollTable>
        </Card>
      )}

      <AdminTicketModal
        ticket={selected}
        onClose={() => setSelected(null)}
        onChanged={async () => {
          if (selected) await openTicket(selected.id);
          await load();
        }}
      />
    </div>
  );
}

function AdminTicketModal({ ticket, onClose, onChanged }) {
  const toast = useToast();
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState(ticket?.status ?? 'OPEN');
  const [priority, setPriority] = useState(ticket?.priority ?? 'NORMAL');
  const [resolution, setResolution] = useState(ticket?.resolution ?? '');
  const [busy, setBusy] = useState(false);

  // Sync local form to selected ticket
  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setResolution(ticket.resolution ?? '');
      setReply('');
    }
  }, [ticket]);

  if (!ticket) return null;
  const s = STATUS_META[ticket.status] ?? { variant: 'default', label: ticket.status };
  const c = CATEGORY_META[ticket.category] ?? { variant: 'default', label: ticket.category };
  const messages = ticket.messages ?? [];

  async function patch() {
    setBusy(true);
    try {
      await apiClient.patch(`/api/v1/support/admin/tickets/${ticket.id}`, {
        status,
        priority,
        resolution,
      });
      toast.push({ variant: 'success', title: 'Ticket updated' });
      onChanged?.();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Update failed', body: apiError(e) });
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!reply.trim()) return;
    setBusy(true);
    try {
      await apiClient.post(`/api/v1/support/tickets/${ticket.id}/messages`, { body: reply.trim() });
      setReply('');
      onChanged?.();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Send failed', body: apiError(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!ticket}
      onClose={onClose}
      size="xl"
      title={ticket.subject}
      description={`${ticket.ticketNumber} · ${c.label}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={patch} loading={busy}>Save changes</Button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-[1fr_240px]">
        {/* Conversation */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant={s.variant}>{s.label}</Badge>
            <span className="text-zinc-500">From</span>
            <span className="font-medium text-zinc-800">
              {ticket.user?.fullName} ({ticket.user?.role})
            </span>
          </div>

          <div className="mt-3 max-h-[40vh] space-y-3 overflow-y-auto rounded-lg border border-zinc-100 bg-white p-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-zinc-500">No messages yet.</div>
            )}
            {messages.map((m) => {
              const isAdmin = m.authorRole === 'ADMIN';
              return (
                <div
                  key={m.id}
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    isAdmin
                      ? 'ml-auto bg-brand-50 text-brand-900 ring-1 ring-brand-100'
                      : 'mr-auto bg-zinc-100 text-zinc-900'
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                    {isAdmin ? 'You (admin)' : m.author?.fullName ?? m.authorRole}
                    <span className="ml-2 font-normal text-zinc-500">{timeAgo(m.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">{m.body}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <Textarea
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply as Collabhype support…"
            />
            <Button onClick={sendReply} loading={busy} disabled={!reply.trim()}>
              Reply
            </Button>
          </div>
        </div>

        {/* Admin controls */}
        <aside className="space-y-4">
          <FormField label="Status">
            <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} />
          </FormField>
          <FormField label="Priority">
            <Select value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} />
          </FormField>
          <FormField label="Resolution note" hint="Shown to the user on RESOLVED.">
            <Textarea
              rows={3}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="What did we do?"
            />
          </FormField>

          {/* Context links */}
          <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 text-xs">
            <div className="font-semibold uppercase tracking-wider text-zinc-500">Context</div>
            <ul className="mt-2 space-y-1 text-zinc-700">
              {ticket.order && (
                <li>
                  <strong>Order:</strong> {ticket.order.orderNumber}
                </li>
              )}
              {ticket.campaign && (
                <li>
                  <strong>Campaign:</strong> {ticket.campaign.title}
                </li>
              )}
              {ticket.deliverable && (
                <li>
                  <strong>Deliverable:</strong> {ticket.deliverable.deliverable} ·{' '}
                  {ticket.deliverable.status}
                </li>
              )}
              {!ticket.order && !ticket.campaign && !ticket.deliverable && (
                <li className="italic text-zinc-500">No linked entity</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
