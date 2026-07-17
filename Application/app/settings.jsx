import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, PasswordInput, Switch } from '@/components/ui';
import BackHeader from '@/components/BackHeader';
import { useAuth } from '@/lib/auth';
import { api, apiError } from '@/lib/api';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [push, setPush] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const updatePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing fields', 'Enter your current and new password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Weak password', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords differ', 'New password and confirmation must match.');
      return;
    }
    setSavingPwd(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Password updated', 'Use your new password next time you sign in.');
    } catch (e) {
      Alert.alert("Couldn't update password", apiError(e));
    } finally {
      setSavingPwd(false);
    }
  };

  const confirmDelete = () => {
    if (!deletePassword) {
      Alert.alert('Confirm with password', 'Enter your password to delete your account.');
      return;
    }
    Alert.alert(
      'Delete account?',
      'This deactivates your account and signs you out. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteAccount },
      ],
    );
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/me', { data: { password: deletePassword } });
      await logout();
    } catch (e) {
      Alert.alert("Couldn't delete account", apiError(e));
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['top']}>
      <BackHeader title="Settings" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Text className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-700">
          Account
        </Text>
        <Text className="mt-1 text-2xl font-bold text-zinc-900">Settings</Text>
        <Text className="mt-1 text-sm text-zinc-600">
          Manage how you sign in, get notified, and your data.
        </Text>

        <Card className="mt-6">
          <Text className="text-base font-bold text-zinc-900">Account</Text>
          <Text className="mt-1 text-xs text-zinc-500">
            Some details can&apos;t be changed here. Reach out to support to update them.
          </Text>
          <View className="mt-4 gap-3">
            <Row label="Email" value={user?.email} />
            <Row label="Full name" value={user?.fullName} />
            <Row label="Role" value={user?.role === 'BRAND' ? 'Brand' : 'Creator'} />
          </View>
        </Card>

        <Card className="mt-3">
          <Text className="text-base font-bold text-zinc-900">Change password</Text>
          <View className="mt-3 gap-3">
            <PasswordInput
              label="Current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <PasswordInput
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <PasswordInput
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          <View className="mt-4">
            <Button loading={savingPwd} onPress={updatePassword}>
              Update password
            </Button>
          </View>
        </Card>

        <Card className="mt-3">
          <Text className="text-base font-bold text-zinc-900">Notifications</Text>
          <View className="mt-3 gap-3">
            <Switch
              label="Push notifications"
              description="Drafts, approvals, payouts"
              value={push}
              onValueChange={setPush}
            />
            <Switch
              label="Weekly email digest"
              description="A summary every Monday"
              value={emailDigest}
              onValueChange={setEmailDigest}
            />
            <Switch
              label="Marketing tips"
              description="Best practices, new features"
              value={marketing}
              onValueChange={setMarketing}
            />
          </View>
        </Card>

        <Card className="mt-3 border-red-200">
          <Text className="text-base font-bold text-red-600">Danger zone</Text>
          <Text className="mt-1 text-xs text-zinc-500">
            Permanently deactivate your account. Enter your password to confirm.
          </Text>
          <View className="mt-3 gap-3">
            <PasswordInput
              label="Password"
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <Button variant="danger" loading={deleting} onPress={confirmDelete}>
              Delete account
            </Button>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View className="flex-row items-center justify-between border-b border-zinc-100 pb-2">
      <Text className="text-sm text-zinc-500">{label}</Text>
      <Text className="text-sm font-semibold text-zinc-900">{value ?? '—'}</Text>
    </View>
  );
}
