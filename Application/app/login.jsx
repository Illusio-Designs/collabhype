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
import { Button, Input, PasswordInput } from '@/components/ui';
import BrandWatermark from '@/components/BrandWatermark';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async () => {
    setBusy(true);
    setError(null);
    const res = await login({ email, password });
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
          {/* Brand hero — gradient panel matching the web Hero. */}
          <View className="rounded-b-[2rem] bg-brand-50 px-6 pb-10 pt-12">
            <View className="mb-6 flex-row items-center gap-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-700">
                <Text className="text-lg font-black text-white">C</Text>
              </View>
              <Text className="text-xl font-bold text-brand-800">Collabhype</Text>
            </View>
            <View className="self-start rounded-full bg-white px-3 py-1 shadow-sm">
              <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">
                Welcome back
              </Text>
            </View>
            <Text className="mt-4 text-3xl font-bold leading-tight text-zinc-900">
              Sign in to your <Text className="text-brand-700">marketplace</Text>
            </Text>
            <Text className="mt-2 text-sm leading-6 text-zinc-600">
              Track campaigns, approve drafts and release escrow — all from
              your phone.
            </Text>
          </View>

          {/* Form card */}
          <View className="px-5 pt-6">
            <View className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <View className="gap-3">
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@brand.com"
                  keyboardType="email-address"
                />
                <PasswordInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                />
                {error && (
                  <View className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <Text className="text-xs font-medium text-red-700">{error}</Text>
                  </View>
                )}
                <View className="items-end">
                  <Pressable onPress={() => {}}>
                    <Text className="text-xs font-semibold text-brand-700">
                      Forgot password?
                    </Text>
                  </Pressable>
                </View>
                <Button onPress={onSubmit} loading={busy} fullWidth size="lg">
                  Sign in
                </Button>
              </View>
            </View>

            <View className="mt-5 flex-row items-center justify-center gap-1.5">
              <Text className="text-sm text-zinc-600">New to Collabhype?</Text>
              <Pressable onPress={() => router.push('/register')}>
                <Text className="text-sm font-semibold text-brand-700">
                  Create account
                </Text>
              </Pressable>
            </View>

            <Text className="mt-6 text-center text-[11px] text-zinc-400">
              Managed by Finvera Solution LLP
            </Text>
          </View>

          {/* Footer watermark — same big "Collabhype" feel as the web. */}
          <View className="mt-8 px-3">
            <BrandWatermark />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
