import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AuthHeader } from '@/components/auth';
import { Button, Field, Screen, Small } from '@/components/ui';
import { auth, validEmail } from '@/data/auth';
import { AuthError } from '@/data/types';
import { usePalette } from '@/theme';

export default function ForgotPassword() {
  const c = usePalette();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await auth.forgotPassword(email.trim());
      router.push({ pathname: '/verify', params: { email: email.trim(), purpose: 'reset' } });
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <AuthHeader icon="key-outline" title="Reset your password" subtitle="Enter the email you signed up with. If it has an account, we’ll send a 6-digit code." />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      {error ? <Small style={{ color: c.danger }}>{error}</Small> : null}
      <Button big title="Send code" loading={busy} disabled={!validEmail(email)} onPress={submit} />
    </Screen>
  );
}
