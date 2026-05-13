import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Building2, Sparkles } from 'lucide-react-native';
import { Button, Input, PasswordInput } from '@/components/ui';
import BrandWatermark from '@/components/BrandWatermark';
import { useAuth } from '@/lib/auth';
import { COLORS } from '@/lib/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BRAND');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = await register({ fullName, email, password, role });
    if (!res.ok) setError(res.error);
    setBusy(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand hero */}
          <View className="rounded-b-[2rem] bg-brand-50 px-6 pb-10 pt-12">
            <View className="mb-6 flex-row items-center gap-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-700">
                <Text className="text-lg font-black text-white">C</Text>
              </View>
              <Text className="text-xl font-bold text-brand-800">Collabhype</Text>
            </View>
            <View className="self-start rounded-full bg-white px-3 py-1 shadow-sm">
              <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">
                Get started
              </Text>
            </View>
            <Text className="mt-4 text-3xl font-bold leading-tight text-zinc-900">
              Create your <Text className="text-brand-700">Collabhype</Text> account
            </Text>
            <Text className="mt-2 text-sm leading-6 text-zinc-600">
              Brands run campaigns, creators get paid — all in one app.
            </Text>
          </View>

          {/* Form card */}
          <View className="px-5 pt-6">
            <View className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <Text className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                I&apos;m signing up as
              </Text>
              <View className="flex-row gap-2">
                <RolePill
                  active={role === 'BRAND'}
                  icon={<Building2 size={18} color={role === 'BRAND' ? '#ffffff' : COLORS.brand[700]} />}
                  label="Brand"
                  onPress={() => setRole('BRAND')}
                />
                <RolePill
                  active={role === 'INFLUENCER'}
                  icon={<Sparkles size={18} color={role === 'INFLUENCER' ? '#ffffff' : COLORS.brand[700]} />}
                  label="Creator"
                  onPress={() => setRole('INFLUENCER')}
                />
              </View>

              <View className="mt-4 gap-3">
                <Input
                  label="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={role === 'BRAND' ? 'Your name or contact' : 'Your full name'}
                  autoCapitalize="words"
                />
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                />
                <PasswordInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                />
                {error && (
                  <View className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <Text className="text-xs font-medium text-red-700">{error}</Text>
                  </View>
                )}
                <Text className="text-[11px] text-zinc-500">
                  By continuing you agree to Collabhype&apos;s Terms and Privacy Policy.
                </Text>
                <Button onPress={submit} loading={busy} fullWidth size="lg">
                  Create account
                </Button>
              </View>
            </View>

            <View className="mt-5 flex-row items-center justify-center gap-1.5">
              <Text className="text-sm text-zinc-600">Already have an account?</Text>
              <Pressable onPress={() => router.replace('/login')}>
                <Text className="text-sm font-semibold text-brand-700">Sign in</Text>
              </Pressable>
            </View>

            <Text className="mt-6 text-center text-[11px] text-zinc-400">
              Managed by Finvera Solution LLP
            </Text>
          </View>

          <View className="mt-8 px-3">
            <BrandWatermark />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RolePill({ active, icon, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border px-3 py-3 ${
        active
          ? 'border-brand-700 bg-brand-700'
          : 'border-zinc-200 bg-white'
      }`}
    >
      {icon}
      <Text
        className={`text-sm font-semibold ${
          active ? 'text-white' : 'text-zinc-700'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
