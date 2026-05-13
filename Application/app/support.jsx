import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { Badge, Button, Card, EmptyState, Input } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import StatusBadge from '@/components/StatusBadge';
import { DUMMY_TICKETS } from '@/lib/dummyData';

const STATUS_VARIANT = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  AWAITING_USER: 'warning',
  CLOSED: 'default',
  RESOLVED: 'success',
};

export default function SupportScreen() {
  const [tickets, setTickets] = useState(DUMMY_TICKETS);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    if (!subject.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setTickets((t) => [
        {
          id: `t_${Date.now()}`,
          subject,
          status: 'OPEN',
          category: 'GENERAL',
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...t,
      ]);
      setSubject('');
      setMessage('');
      setShowNew(false);
      setSubmitting(false);
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title="Help & disputes" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View className="flex-row items-end justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
              Support
            </Text>
            <Text className="mt-1 text-2xl font-bold text-zinc-900">Help & disputes</Text>
            <Text className="mt-1 text-sm text-zinc-600">
              Open a ticket when something needs platform intervention.
            </Text>
          </View>
          {!showNew && (
            <Button onPress={() => setShowNew(true)} size="sm">
              + New
            </Button>
          )}
        </View>

        {showNew && (
          <Card className="mt-5">
            <Text className="text-base font-bold text-zinc-900">New ticket</Text>
            <View className="mt-3 gap-3">
              <Input
                label="Subject"
                value={subject}
                onChangeText={setSubject}
                placeholder="What's the issue?"
                autoCapitalize="sentences"
              />
              <Input
                label="Details"
                value={message}
                onChangeText={setMessage}
                placeholder="Steps, screenshots, order IDs…"
                autoCapitalize="sentences"
              />
            </View>
            <View className="mt-4 flex-row gap-2">
              <Button
                variant="outline"
                onPress={() => setShowNew(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onPress={submit} loading={submitting} className="flex-1">
                Submit
              </Button>
            </View>
          </Card>
        )}

        <View className="mt-6 gap-3">
          {tickets.length === 0 ? (
            <EmptyState
              icon={<Plus size={20} color="#0a2472" />}
              title="No tickets yet"
              description="Open a ticket when a creator or campaign needs help."
              action={
                <Button onPress={() => setShowNew(true)}>Open a ticket</Button>
              }
            />
          ) : (
            tickets.map((t) => (
              <Card key={t.id}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-zinc-900">
                      {t.subject}
                    </Text>
                    <Text className="mt-0.5 text-xs text-zinc-500">
                      {t.category} · {t.createdAt}
                    </Text>
                  </View>
                  <Badge variant={STATUS_VARIANT[t.status] ?? 'default'}>
                    {t.status.replace(/_/g, ' ')}
                  </Badge>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
