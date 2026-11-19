import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { AuthHeader } from '@/components/auth';
import { Button, Field, PasswordField, Row, Screen, Small } from '@/components/ui';
import { auth } from '@/data/auth';
import { useAuthActions } from '@/data/store';
import { AuthError } from '@/data/types';
import { usePalette } from '@/theme';

export default function LogIn() {
  const c = usePalette();
  const { signedIn } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<AuthError | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      signedIn(await auth.logIn(email, password));
      router.replace('/');
    } catch (e) {
      setError(e instanceof AuthError ? e : new AuthError('Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <AuthHeader icon="log-in-outline" title="Welcome back" subtitle="Log in to book walks or see your walk requests." />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" textContentType="password" error={error?.message} />
      <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/forgot-password', params: { email } })} style={{ alignSelf: 'flex-end' }} hitSlop={8}>
        <Text style={{ color: c.primary, fontWeight: '700' }}>Forgot password?</Text>
      </Pressable>
      <Button big title="Log in" loading={busy} disabled={!email || !password} onPress={submit} />
      <Row style={{ justifyContent: 'center' }}>
        <Small>New to DogWalk?</Small>
        <Pressable accessibilityRole="link" onPress={() => router.replace('/welcome')} hitSlop={8}>
          <Text style={{ color: c.primary, fontWeight: '700' }}>Create an account</Text>
        </Pressable>
      </Row>
    </Screen>
  );
}
