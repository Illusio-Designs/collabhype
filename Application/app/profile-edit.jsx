import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, Input, Switch } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { useAuth } from '@/lib/auth';
import { api, apiError } from '@/lib/api';

export default function ProfileEditScreen() {
  const { user, refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);

  const isBrand = user?.role === 'BRAND';
  const initial = isBrand ? user?.brandProfile ?? {} : user?.influencerProfile ?? {};

  // Brand fields
  const [companyName, setCompanyName] = useState(initial.companyName ?? '');
  const [industry, setIndustry] = useState(initial.industry ?? '');
  const [website, setWebsite] = useState(initial.website ?? '');
  const [gstin, setGstin] = useState(initial.gstin ?? '');
  const [about, setAbout] = useState(initial.about ?? '');
  // Creator fields
  const [city, setCity] = useState(initial.city ?? '');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [isAvailable, setIsAvailable] = useState(initial.isAvailable ?? true);

  if (!user) return null;

  const save = async () => {
    setBusy(true);
    try {
      if (isBrand) {
        await api.patch('/brands/me', {
          companyName: companyName.trim(),
          industry,
          website,
          gstin,
          about,
        });
      } else {
        await api.patch('/influencers/me', { bio, city, isAvailable });
      }
      await refreshUser();
      Alert.alert('Saved', 'Your profile is updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Couldn't save", apiError(e));
    } finally {
      setBusy(false);
    }
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
                autoCapitalize="none"
              />
              <Input
                label="GSTIN"
                value={gstin}
                onChangeText={setGstin}
                placeholder="22AAAAA0000A1Z5"
                autoCapitalize="characters"
              />
              <Input
                label="About"
                value={about}
                onChangeText={setAbout}
                placeholder="A short pitch creators will see."
                autoCapitalize="sentences"
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
                <Input label="City" value={city} onChangeText={setCity} autoCapitalize="words" />
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
