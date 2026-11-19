import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AuthHeader } from '@/components/auth';
import { Button, PasswordField, Screen, Small } from '@/components/ui';
import { auth, passwordProblems } from '@/data/auth';
import { AuthError } from '@/data/types';
import { usePalette } from '@/theme';

export default function ResetPassword() {
  const c = usePalette();
  const { email = '', code = '' } = useLocalSearchParams<{ email: string; code: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const issues = passwordProblems(password);
  const mismatch = confirm.length > 0 && confirm !== password;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await auth.resetPassword(email, code, password);
      setDone(true);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Screen>
        <AuthHeader icon="checkmark-circle-outline" title="Password updated" subtitle="You can now log in with your new password." />
        <Button big title="Log in" onPress={() => router.replace('/login')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AuthHeader icon="lock-closed-outline" title="Choose a new password" subtitle={`For ${email}`} />
      <PasswordField label="New password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" textContentType="newPassword" hint={password && issues.length ? `Needs ${issues.join(' and ')}` : undefined} />
      <PasswordField label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Type it again" textContentType="newPassword" error={mismatch ? "Passwords don't match." : undefined} />
      {error ? <Small style={{ color: c.danger }}>{error}</Small> : null}
      <Button big title="Update password" loading={busy} disabled={issues.length > 0 || confirm !== password} onPress={submit} />
    </Screen>
  );
}
