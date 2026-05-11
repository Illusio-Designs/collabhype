'use client';

import { useState } from 'react';
import {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Divider,
  EmptyState,
  FileUpload,
  FormField,
  Input,
  Modal,
  PasswordInput,
  Progress,
  Radio,
  Select,
  Skeleton,
  Spinner,
  Stat,
  Switch,
  Tabs,
  Tag,
  Textarea,
  useToast,
} from '@/components/ui';

const SECTIONS = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'badges', label: 'Badges & Tags' },
  { id: 'forms', label: 'Forms' },
  { id: 'avatars', label: 'Avatars' },
  { id: 'cards', label: 'Cards' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'loaders', label: 'Loaders' },
  { id: 'data', label: 'Data display' },
  { id: 'nav', label: 'Navigation' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'misc', label: 'Misc' },
];

export default function UIKitPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tagItems, setTagItems] = useState(['Beauty', 'Lifestyle', 'Fashion', 'Food']);
  const [tier, setTier] = useState('MICRO');
  const [niche, setNiche] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);

  return (
    <div className="bg-zinc-50">
      {/* Hero */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <span className="eyebrow">Design system</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Collabhype UI Kit
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-600">
            Every reusable component in one place. Built with Tailwind + Framer Motion. Import from
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono text-zinc-900">
              @/components/ui
            </code>
            .
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[200px,1fr]">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-1 py-12">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-white hover:text-brand-700"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>

          <main className="py-12 space-y-16">
            {/* ===== Foundations ===== */}
            <Section id="foundations" title="Foundations" desc="Colors and typography tokens.">
              <Block label="Brand palette">
                <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
                  {[
                    { shade: 50, cls: 'bg-brand-50' },
                    { shade: 100, cls: 'bg-brand-100' },
                    { shade: 200, cls: 'bg-brand-200' },
                    { shade: 300, cls: 'bg-brand-300' },
                    { shade: 400, cls: 'bg-brand-400' },
                    { shade: 500, cls: 'bg-brand-500' },
                    { shade: 600, cls: 'bg-brand-600' },
                    { shade: 700, cls: 'bg-brand-700' },
                    { shade: 800, cls: 'bg-brand-800' },
                    { shade: 900, cls: 'bg-brand-900' },
                  ].map(({ shade, cls }) => (
                    <div key={shade} className="text-center">
                      <div className={`h-12 rounded-lg shadow-sm ${cls}`} />
                      <div className="mt-1.5 text-xs text-zinc-500">{shade}</div>
                    </div>
                  ))}
                </div>
              </Block>
              <Block label="Typography">
                <div className="space-y-3">
                  <div className="text-4xl font-bold tracking-tight text-zinc-900">Display · 4xl</div>
                  <div className="text-3xl font-bold tracking-tight text-zinc-900">Heading · 3xl</div>
                  <div className="text-2xl font-bold text-zinc-900">Heading · 2xl</div>
                  <div className="text-xl font-semibold text-zinc-900">Subheading · xl</div>
                  <div className="text-base text-zinc-700">Body · base</div>
                  <div className="text-sm text-zinc-600">Caption · sm</div>
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Eyebrow · xs</div>
                </div>
              </Block>
            </Section>

            {/* ===== Buttons ===== */}
            <Section id="buttons" title="Buttons" desc="6 variants × 4 sizes, plus loading/icon states.">
              <Block label="Variants">
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="accent">Accent</Button>
                </div>
              </Block>
              <Block label="Sizes">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra large</Button>
                </div>
              </Block>
              <Block label="States">
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button disabled>Disabled</Button>
                  <Button loading>Loading</Button>
                  <Button icon={<IconStar />}>With icon</Button>
                  <Button iconRight={<IconArrow />} variant="outline">
                    Continue
                  </Button>
                  <Button fullWidth className="!w-64">
                    Full width
                  </Button>
                </div>
              </Block>
            </Section>

            {/* ===== Badges & Tags ===== */}
            <Section id="badges" title="Badges & Tags" desc="Inline status, labels, and removable chips.">
              <Block label="Badge variants">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="brand">Brand</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="dark">Dark</Badge>
                  <Badge variant="success" dot>
                    Live
                  </Badge>
                </div>
              </Block>
              <Block label="Sizes">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" variant="brand">Small</Badge>
                  <Badge size="md" variant="brand">Medium</Badge>
                  <Badge size="lg" variant="brand">Large</Badge>
                </div>
              </Block>
              <Block label="Tag (removable)">
                <div className="flex flex-wrap gap-2">
                  {tagItems.map((t) => (
                    <Tag
                      key={t}
                      variant="brand"
                      onClose={() => setTagItems(tagItems.filter((x) => x !== t))}
                    >
                      {t}
                    </Tag>
                  ))}
                  {!tagItems.length && (
                    <button
                      onClick={() => setTagItems(['Beauty', 'Lifestyle', 'Fashion', 'Food'])}
                      className="text-xs font-medium text-brand-700 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </Block>
            </Section>

            {/* ===== Forms ===== */}
            <Section id="forms" title="Forms" desc="Inputs, textarea, select, checkbox, radio, switch.">
              <Block label="Input · text, password (eye toggle), search">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Email" required hint="We'll never share it.">
                    <Input type="email" placeholder="you@brand.com" />
                  </FormField>
                  <FormField label="Password" hint="Click the eye to toggle visibility.">
                    <PasswordInput placeholder="••••••••" autoComplete="new-password" />
                  </FormField>
                  <FormField label="Search">
                    <Input placeholder="Search creators…" icon={<IconSearch />} />
                  </FormField>
                  <FormField label="Disabled">
                    <Input disabled defaultValue="Locked field" />
                  </FormField>
                </div>
              </Block>
              <Block label="Custom Select · keyboard, click-outside, animated">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Tier" hint={`Selected: ${tier}`}>
                    <Select
                      value={tier}
                      onChange={setTier}
                      placeholder="Pick a tier"
                      options={[
                        { value: 'NANO', label: 'Nano', description: '1K–10K' },
                        { value: 'MICRO', label: 'Micro', description: '10K–100K' },
                        { value: 'MACRO', label: 'Macro', description: '100K–1M' },
                        { value: 'MEGA', label: 'Mega', description: '1M+' },
                      ]}
                    />
                  </FormField>
                  <FormField label="Niche (with descriptions)" hint={niche ? `Selected: ${niche}` : 'Try the search via arrow keys'}>
                    <Select
                      value={niche}
                      onChange={setNiche}
                      placeholder="Choose a niche"
                      options={[
                        { value: 'beauty', label: 'Beauty & Skincare' },
                        { value: 'fitness', label: 'Fitness & Wellness' },
                        { value: 'food', label: 'Food & Beverage' },
                        { value: 'tech', label: 'Tech & Gadgets', disabled: true },
                        { value: 'travel', label: 'Travel' },
                      ]}
                    />
                  </FormField>
                  <FormField label="Disabled select">
                    <Select disabled options={[{ value: 'a', label: 'A' }]} placeholder="Locked" />
                  </FormField>
                  <FormField label="Error state" error="Pick a tier to continue.">
                    <Select error options={[{ value: 'a', label: 'A' }]} placeholder="—" />
                  </FormField>
                </div>
              </Block>
              <Block label="Textarea">
                <FormField label="Brief">
                  <Textarea placeholder="Share campaign goals, do's and don'ts…" rows={4} />
                </FormField>
              </Block>
              <Block label="Checkbox & Radio">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Checkbox
                      label="Email me about new campaigns"
                      description="Roughly twice a month, never spam."
                    />
                    <Checkbox label="Show only verified creators" defaultChecked />
                    <Checkbox label="Disabled option" disabled />
                  </div>
                  <div className="space-y-3">
                    <Radio name="cadence" label="Weekly digest" defaultChecked />
                    <Radio name="cadence" label="Monthly digest" />
                    <Radio name="cadence" label="No emails" />
                  </div>
                </div>
              </Block>
              <Block label="Switch">
                <div className="space-y-3">
                  <Switch label="Available for bookings" defaultChecked />
                  <Switch
                    label="Push notifications"
                    description="Get notified when a creator submits a draft."
                  />
                  <Switch label="Maintenance mode" disabled />
                </div>
              </Block>
              <Block label="File upload · drag, drop, or click">
                <div className="grid gap-6 lg:grid-cols-2">
                  <FormField label="Single avatar" hint="JPG / PNG · max 2 MB">
                    <FileUpload
                      accept="image/png,image/jpeg"
                      maxSize={2 * 1024 * 1024}
                      label="Drop avatar or click to browse"
                      hint="Square image looks best"
                      value={avatarFile}
                      onChange={setAvatarFile}
                    />
                  </FormField>
                  <FormField label="Multiple files" hint="Any file · up to 5">
                    <FileUpload
                      multiple
                      maxFiles={5}
                      label="Drop files or click to browse"
                      hint="Add up to 5 attachments"
                      value={uploadFiles}
                      onChange={setUploadFiles}
                    />
                  </FormField>
                </div>
              </Block>
            </Section>

            {/* ===== Avatars ===== */}
            <Section id="avatars" title="Avatars" desc="With image, with initials, sizes & groups.">
              <Block label="Sizes">
                <div className="flex items-end gap-4">
                  <Avatar name="Priya Shah" size="xs" />
                  <Avatar name="Priya Shah" size="sm" />
                  <Avatar name="Priya Shah" size="md" />
                  <Avatar name="Priya Shah" size="lg" />
                  <Avatar name="Priya Shah" size="xl" />
                  <Avatar name="Priya Shah" size="2xl" />
                </div>
              </Block>
              <Block label="Group">
                <AvatarGroup
                  size="md"
                  avatars={[
                    { name: 'Aanya M' },
                    { name: 'Rohan I' },
                    { name: 'Vikram S' },
                    { name: 'Priya S' },
                    { name: 'Naina K' },
                    { name: 'Karan D' },
                  ]}
                  max={4}
                />
              </Block>
            </Section>

            {/* ===== Cards ===== */}
            <Section id="cards" title="Cards" desc="Container with optional hover lift.">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <h3 className="text-base font-semibold text-zinc-900">Static card</h3>
                  <p className="mt-2 text-sm text-zinc-600">No hover behavior.</p>
                </Card>
                <Card hover>
                  <h3 className="text-base font-semibold text-zinc-900">Hover card</h3>
                  <p className="mt-2 text-sm text-zinc-600">Lifts on hover.</p>
                </Card>
                <Card padding="lg">
                  <h3 className="text-base font-semibold text-zinc-900">Large padding</h3>
                  <p className="mt-2 text-sm text-zinc-600">More breathing room.</p>
                </Card>
              </div>
            </Section>

            {/* ===== Alerts ===== */}
            <Section id="alerts" title="Alerts" desc="Inline messaging with 4 severities.">
              <div className="space-y-3">
                <Alert variant="info" title="Heads up" onClose={() => {}}>
                  Razorpay test mode is enabled. Use card 4111 1111 1111 1111 to test payments.
                </Alert>
                <Alert variant="success" title="Payment verified">
                  Order CH-XXXX confirmed. Campaign briefs dispatched.
                </Alert>
                <Alert variant="warning" title="Profile incomplete">
                  Connect Instagram or YouTube to be listed in brand searches.
                </Alert>
                <Alert variant="danger" title="Payout failed">
                  UPI ID was rejected. Please update your bank details and retry.
                </Alert>
              </div>
            </Section>

            {/* ===== Loaders ===== */}
            <Section id="loaders" title="Loaders" desc="Spinners, progress, skeletons.">
              <Block label="Spinner">
                <div className="flex items-center gap-4 text-brand-700">
                  <Spinner size="xs" />
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <Spinner size="xl" />
                </div>
              </Block>
              <Block label="Progress">
                <div className="space-y-4">
                  <Progress label="Campaign completion" value={62} />
                  <Progress label="Deliverables approved" value={4} max={5} color="success" />
                  <Progress label="Budget used" value={88} color="warning" />
                  <Progress label="Failure threshold" value={95} color="danger" />
                </div>
              </Block>
              <Block label="Skeleton">
                <div className="flex gap-4">
                  <Skeleton variant="circle" className="h-12 w-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </Block>
            </Section>

            {/* ===== Data display ===== */}
            <Section id="data" title="Data display" desc="Stats and metrics.">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Live campaigns" value="24" change={12} />
                <Stat label="Total reach" value="2.4M" change={8} />
                <Stat label="Avg engagement" value="4.7%" change={-2} />
                <Stat label="Payouts (30d)" prefix="₹" value="3,42,500" change={18} />
              </div>
            </Section>

            {/* ===== Navigation ===== */}
            <Section id="nav" title="Navigation" desc="Breadcrumb, tabs.">
              <Block label="Breadcrumb">
                <Breadcrumb
                  items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Campaigns', href: '/dashboard/campaigns' },
                    { label: 'Bloom Skincare Q1' },
                  ]}
                />
              </Block>
              <Block label="Tabs · underline">
                <Tabs
                  tabs={[
                    {
                      label: 'Overview',
                      content: <p className="text-sm text-zinc-600">Campaign overview goes here.</p>,
                    },
                    {
                      label: 'Deliverables',
                      content: <p className="text-sm text-zinc-600">Deliverables table.</p>,
                    },
                    {
                      label: 'Payouts',
                      content: <p className="text-sm text-zinc-600">Payout history.</p>,
                    },
                  ]}
                />
              </Block>
              <Block label="Tabs · pills">
                <Tabs
                  variant="pills"
                  tabs={[
                    { label: 'All', content: <p className="text-sm text-zinc-600">All items</p> },
                    { label: 'Pending', content: <p className="text-sm text-zinc-600">Pending items</p> },
                    { label: 'Approved', content: <p className="text-sm text-zinc-600">Approved items</p> },
                  ]}
                />
              </Block>
            </Section>

            {/* ===== Overlays ===== */}
            <Section id="overlays" title="Overlays" desc="Modals and toasts.">
              <Block label="Modal">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setModalOpen(true)}>Open modal</Button>
                  <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                    Open confirm dialog
                  </Button>
                </div>
                <Modal
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  title="Update campaign brief"
                  description="Changes apply to all assigned creators."
                  footer={
                    <>
                      <Button variant="outline" onClick={() => setModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setModalOpen(false)}>Save changes</Button>
                    </>
                  }
                >
                  <FormField label="Brief" hint="Markdown supported.">
                    <Textarea rows={5} placeholder="Tell creators what to post about…" />
                  </FormField>
                </Modal>
                <Modal
                  open={confirmOpen}
                  onClose={() => setConfirmOpen(false)}
                  size="sm"
                  title="Cancel campaign?"
                  footer={
                    <>
                      <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                        Keep it
                      </Button>
                      <Button variant="danger" onClick={() => setConfirmOpen(false)}>
                        Yes, cancel
                      </Button>
                    </>
                  }
                >
                  <p className="text-sm text-zinc-600">
                    This will refund unpaid deliverables and notify all assigned creators. This
                    action cannot be undone.
                  </p>
                </Modal>
              </Block>
              <Block label="Toast">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.push({
                        variant: 'info',
                        title: 'Heads up',
                        body: 'A draft is awaiting your review.',
                      })
                    }
                  >
                    Info toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.push({
                        variant: 'success',
                        title: 'Saved',
                        body: 'Your changes are live.',
                      })
                    }
                  >
                    Success toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.push({
                        variant: 'warning',
                        title: 'Almost there',
                        body: 'Connect a social account to be listed.',
                      })
                    }
                  >
                    Warning toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.push({
                        variant: 'danger',
                        title: 'Failed',
                        body: 'Could not reach the payment provider.',
                      })
                    }
                  >
                    Danger toast
                  </Button>
                </div>
              </Block>
            </Section>

            {/* ===== Misc ===== */}
            <Section id="misc" title="Misc" desc="Divider, accordion, empty state.">
              <Block label="Divider">
                <div>
                  <p className="text-sm text-zinc-600">Content above</p>
                  <Divider />
                  <p className="text-sm text-zinc-600">Content below</p>
                  <Divider>or</Divider>
                  <p className="text-sm text-zinc-600">After labeled divider</p>
                </div>
              </Block>
              <Block label="Accordion">
                <Accordion
                  defaultOpen={0}
                  items={[
                    {
                      title: 'How does pricing work?',
                      content:
                        'Packages have a single all-in price. Custom mixes total up the deliverables you pick at each creator\'s rate card.',
                    },
                    {
                      title: 'When do creators get paid?',
                      content:
                        'After you approve a deliverable as POSTED, payment is released to the creator\'s UPI within 1-2 business days.',
                    },
                    {
                      title: 'Can I mix tiers in one campaign?',
                      content:
                        'Yes. Add 10 nano creators for engagement, 2 micros for reach, and a macro for credibility — all in one checkout.',
                    },
                  ]}
                />
              </Block>
              <Block label="Empty state">
                <EmptyState
                  icon={<IconInbox />}
                  title="No campaigns yet"
                  description="Once you check out a package or build a custom mix, campaigns appear here."
                  action={<Button>Browse packages</Button>}
                />
              </Block>
            </Section>
          </main>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, desc, children }) {
  return (
    <section id={id} className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h2>
        {desc && <p className="mt-1 text-sm text-zinc-600">{desc}</p>}
      </header>
      <div className="space-y-8">{children}</div>
    </section>
  );
}

function Block({ label, children }) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
}

// --- inline icons ---
function IconStar() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.05 2.927a1 1 0 011.9 0l1.6 4.9h5.15a1 1 0 01.59 1.81l-4.17 3.03 1.6 4.9a1 1 0 01-1.54 1.12L10 15.66l-4.18 3.03a1 1 0 01-1.54-1.12l1.6-4.9-4.17-3.03A1 1 0 012.3 7.83h5.15l1.6-4.9z" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M3 10a1 1 0 011-1h10.586L11.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="6" />
      <path d="m14 14 3 3" strokeLinecap="round" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M3 12l2-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2l2 7M3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6M3 12h5l2 2h4l2-2h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
