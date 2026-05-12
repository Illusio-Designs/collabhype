'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient, apiError } from '@/lib/apiClient';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  Input,
  Modal,
  Select,
  Spinner,
  Textarea,
  useToast,
} from '@/components/ui';
import KpiStrip from '@/components/dashboard/KpiStrip';

const STATUS_META = {
  OPEN:           { variant: 'warning', label: 'Open' },
  IN_PROGRESS:    { variant: 'info',    label: 'In progress' },
  AWAITING_USER:  { variant: 'info',    label: 'Awaiting you' },
  RESOLVED:       { variant: 'success', label: 'Resolved' },
  CLOSED:         { variant: 'default', label: 'Closed' },
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

const CATEGORY_OPTIONS = Object.entries(CATEGORY_META).map(([value, m]) => ({ value, label: m.label }));
const PRIORITY_OPTIONS = Object.entries(PRIORITY_META).map(([value, m]) => ({ value, label: m.label }));

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SupportPage() {
  const { user, isLoading } = useAuth();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/support/tickets');
      setTickets(data.tickets ?? []);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load', body: apiError(e) });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function openTicket(id) {
    try {
      const { data } = await apiClient.get(`/api/v1/support/tickets/${id}`);
      setSelected(data.ticket);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Failed to load ticket', body: apiError(e) });
    }
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await apiClient.post(`/api/v1/support/tickets/${selected.id}/messages`, { body: reply.trim() });
      setReply('');
      await openTicket(selected.id);
      await load();
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Send failed', body: apiError(e) });
    } finally {
      setSending(false);
    }
  }

  const kpis = useMemo(() => {
    const open = tickets.filter((t) => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length;
    const awaiting = tickets.filter((t) => t.status === 'AWAITING_USER').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    return [
      { label: 'Total tickets', value: String(tickets.length) },
      { label: 'Open', value: String(open) },
      { label: 'Awaiting you', value: String(awaiting) },
      { label: 'Resolved', value: String(resolved) },
    ];
  }, [tickets]);

  if (isLoading || loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-700">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Support</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Help & disputes</h1>
          <p className="mt-2 text-zinc-600">Open a ticket when something needs the platform team to step in.</p>
        </div>
        <Button onClick={() => setShowNew(true)}>+ New ticket</Button>
      </header>

      <KpiStrip kpis={kpis} />

      {tickets.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No tickets yet"
            description="Use Help & disputes when a creator or campaign needs platform intervention."
            action={<Button onClick={() => setShowNew(true)}>Open a ticket</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {tickets.map((t) => (
            <TicketRow key={t.id} ticket={t} onClick={() => openTicket(t.id)} />
          ))}
        </div>
      )}

      <NewTicketModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={(ticket) => {
          setShowNew(false);
          load();
          openTicket(ticket.id);
        }}
      />

      <TicketDetailModal
        ticket={selected}
        reply={reply}
        setReply={setReply}
        sending={sending}
        onSend={sendReply}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function TicketRow({ ticket, onClick }) {
  const s = STATUS_META[ticket.status] ?? { variant: 'default', label: ticket.status };
  const c = CATEGORY_META[ticket.category] ?? { variant: 'default', label: ticket.category };
  const p = PRIORITY_META[ticket.priority] ?? { variant: 'default', label: ticket.priority };
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[11px] font-semibold text-brand-700">
            {ticket.ticketNumber}
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-zinc-900">{ticket.subject}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <Badge variant={c.variant} size="sm">{c.label}</Badge>
            <Badge variant={p.variant} size="sm">{p.label}</Badge>
            {ticket._count?.messages != null && (
              <span>{ticket._count.messages} message{ticket._count.messages === 1 ? '' : 's'}</span>
            )}
            <span>·</span>
            <span>Updated {timeAgo(ticket.updatedAt)}</span>
          </div>
        </div>
        <Badge variant={s.variant}>{s.label}</Badge>
      </div>
    </button>
  );
}

function NewTicketModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ subject: '', body: '', category: 'OTHER', priority: 'NORMAL' });
  const [busy, setBusy] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    if (form.subject.trim().length < 3 || form.body.trim().length < 10) {
      toast.push({ variant: 'warning', title: 'Add a subject + a few sentences' });
      return;
    }
    setBusy(true);
    try {
      const { data } = await apiClient.post('/api/v1/support/tickets', {
        subject: form.subject.trim(),
        body: form.body.trim(),
        category: form.category,
        priority: form.priority,
      });
      toast.push({ variant: 'success', title: 'Ticket opened', body: data.ticket?.ticketNumber });
      setForm({ subject: '', body: '', category: 'OTHER', priority: 'NORMAL' });
      onCreated?.(data.ticket);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Open failed', body: apiError(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Open a support ticket"
      description="Tell us what's going wrong. We reply within 1 business day."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy}>Open ticket</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Subject" required>
          <Input
            value={form.subject}
            onChange={(e) => set('subject', e.target.value)}
            placeholder="One-line summary of the issue"
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Category">
            <Select value={form.category} onChange={(v) => set('category', v)} options={CATEGORY_OPTIONS} />
          </FormField>
          <FormField label="Priority">
            <Select value={form.priority} onChange={(v) => set('priority', v)} options={PRIORITY_OPTIONS} />
          </FormField>
        </div>
        <FormField label="What happened?" required>
          <Textarea
            rows={6}
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Include relevant order / campaign IDs, what you expected, and what actually happened."
          />
        </FormField>
      </div>
    </Modal>
  );
}

function TicketDetailModal({ ticket, reply, setReply, sending, onSend, onClose }) {
  if (!ticket) return null;
  const s = STATUS_META[ticket.status] ?? { variant: 'default', label: ticket.status };
  const c = CATEGORY_META[ticket.category] ?? { variant: 'default', label: ticket.category };
  const p = PRIORITY_META[ticket.priority] ?? { variant: 'default', label: ticket.priority };
  const messages = ticket.messages ?? [];
  const closed = ['RESOLVED', 'CLOSED'].includes(ticket.status);

  return (
    <Modal
      open={!!ticket}
      onClose={onClose}
      size="xl"
      title={ticket.subject}
      description={`${ticket.ticketNumber} · ${c.label}`}
      footer={
        closed ? (
          <Button variant="outline" onClick={onClose} fullWidth>
            Close
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={onSend} loading={sending} disabled={!reply.trim()}>Send reply</Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        {/* Meta */}
        <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2.5 text-xs">
          <Badge variant={s.variant}>{s.label}</Badge>
          <Badge variant={c.variant}>{c.label}</Badge>
          <Badge variant={p.variant}>{p.label}</Badge>
          {ticket.order && (
            <Link href={`/dashboard/orders/${ticket.order.id}`} className="rounded-full bg-white px-2.5 py-0.5 font-medium text-brand-700 hover:underline">
              Order {ticket.order.orderNumber}
            </Link>
          )}
          {ticket.campaign && (
            <Link href={`/dashboard/campaigns/${ticket.campaign.id}`} className="rounded-full bg-white px-2.5 py-0.5 font-medium text-brand-700 hover:underline">
              Campaign
            </Link>
          )}
        </div>

        {/* Resolution banner */}
        {ticket.resolution && (
          <Alert variant="success" title="Resolved">
            {ticket.resolution}
          </Alert>
        )}

        {/* Messages */}
        <div className="max-h-[40vh] space-y-3 overflow-y-auto rounded-lg border border-zinc-100 bg-white p-3">
          {messages.length === 0 && (
            <div className="text-center text-sm text-zinc-500">Open a thread by replying below.</div>
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
                  {isAdmin ? 'Collabhype support' : m.author?.fullName ?? m.authorRole}
                  <span className="ml-2 font-normal text-zinc-500">{timeAgo(m.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed">{m.body}</p>
              </div>
            );
          })}
        </div>

        {/* Reply composer */}
        {!closed && (
          <Textarea
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply…"
          />
        )}
      </div>
    </Modal>
  );
}

