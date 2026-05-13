import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Input, Switch } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { useAuth } from '@/lib/auth';

export default function ProfileEditScreen() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const isBrand = user.role === 'BRAND';
  const initial = isBrand ? user.brandProfile ?? {} : user.influencerProfile ?? {};

  // Local form state — demo only, doesn't persist.
  const [companyName, setCompanyName] = useState(initial.companyName ?? '');
  const [industry, setIndustry] = useState(initial.industry ?? '');
  const [website, setWebsite] = useState(initial.website ?? '');
  const [gstin, setGstin] = useState(initial.gstin ?? '');
  const [city, setCity] = useState(initial.city ?? '');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [isAvailable, setIsAvailable] = useState(initial.isAvailable ?? true);

  const save = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 700);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title={isBrand ? 'Brand profile' : 'Your profile'} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
          Settings
        </Text>
        <Text className="mt-1 text-2xl font-bold text-zinc-900">
          {isBrand ? 'Brand profile' : 'Your profile'}
        </Text>
        <Text className="mt-1 text-sm text-zinc-600">
          {isBrand
            ? 'How creators see your brand when accepting briefs.'
            : 'Brands see this when browsing creators.'}
        </Text>

        {isBrand ? (
          <Card className="mt-5">
            <Text className="text-base font-bold text-zinc-900">Company</Text>
            <View className="mt-3 gap-3">
              <Input
                label="Company name"
                value={companyName}
                onChangeText={setCompanyName}
                autoCapitalize="words"
              />
              <Input
                label="Industry"
                value={industry}
                onChangeText={setIndustry}
                placeholder="Beauty, Food, Tech…"
                autoCapitalize="words"
              />
              <Input
                label="Website"
                value={website}
                onChangeText={setWebsite}
                placeholder="https://yourbrand.com"
                keyboardType="url"
              />
              <Input
                label="GSTIN"
                value={gstin}
                onChangeText={setGstin}
                placeholder="22AAAAA0000A1Z5"
                autoCapitalize="characters"
              />
              <Input
                label="City"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
            </View>
          </Card>
        ) : (
          <>
            <Card className="mt-5">
              <Switch
                label="Available for bookings"
                description="Turn off if you can't take new campaigns right now."
                value={isAvailable}
                onValueChange={setIsAvailable}
              />
            </Card>

            <Card className="mt-3">
              <Text className="text-base font-bold text-zinc-900">Basics</Text>
              <View className="mt-3 gap-3">
                <Input
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                />
                <Input
                  label="Bio"
                  value={bio}
                  onChangeText={setBio}
                  placeholder="What makes your content stand out?"
                  autoCapitalize="sentences"
                />
              </View>
            </Card>
          </>
        )}

        <View className="mt-6">
          <Button onPress={save} loading={busy} fullWidth>
            Save changes
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
