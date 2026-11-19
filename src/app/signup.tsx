import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { AuthHeader } from '@/components/auth';
import { Button, Field, PasswordField, Row, Screen, Small } from '@/components/ui';
import { auth, passwordProblems } from '@/data/auth';
import { useAuthActions } from '@/data/store';
import { AuthError, type Role } from '@/data/types';
import { usePalette } from '@/theme';

export default function SignUp() {
  const c = usePalette();
  const { role: param } = useLocalSearchParams<{ role?: Role }>();
  const role: Role = param === 'walker' ? 'walker' : 'customer';
  const { signedIn } = useAuthActions();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState<AuthError | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const issues = passwordProblems(form.password);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const user = await auth.signUp({ ...form, role });
      await auth.sendVerifyCode(user.email);
      signedIn(user);
      router.replace({ pathname: '/verify', params: { email: user.email, purpose: 'signup' } });
    } catch (e) {
      setError(e instanceof AuthError ? e : new AuthError('Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };
  const err = (f: AuthError['field']) => (error && error.field === f ? error.message : undefined);

  return (
    <Screen>
      <AuthHeader
        icon={role === 'walker' ? 'walk-outline' : 'paw-outline'}
        title={role === 'walker' ? 'Become a walker' : 'Create your account'}
        subtitle={role === 'walker' ? 'Walk dogs near you and get paid. You’ll set up your walker profile next.' : 'Book trusted walkers for your dog. You’ll add your dog next.'}
      />
      <Field label="Full name" value={form.name} onChangeText={set('name')} placeholder="e.g. Ada Bello" autoComplete="name" textContentType="name" error={err('name')} />
      <Field label="Email" value={form.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" error={err('email')} />
      <Field label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="0803 123 4567" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" error={err('phone')} hint={role === 'walker' ? 'Owners call this number about walks.' : 'Your walker can reach you on this number.'} />
      <PasswordField
        label="Password"
        value={form.password}
        onChangeText={set('password')}
        placeholder="At least 8 characters"
        textContentType="newPassword"
        error={err('password')}
        hint={form.password && issues.length ? `Needs ${issues.join(' and ')}` : form.password ? 'Strong enough ✓' : undefined}
      />
      {error && !error.field ? <Small style={{ color: c.danger }}>{error.message}</Small> : null}
      <Button big title="Create account" loading={busy} disabled={!form.name || !form.email || !form.phone || !form.password} onPress={submit} />
      <Row style={{ justifyContent: 'center' }}>
        <Small>Already have an account?</Small>
        <Pressable accessibilityRole="link" onPress={() => router.replace('/login')} hitSlop={8}>
          <Text style={{ color: c.primary, fontWeight: '700' }}>Log in</Text>
        </Pressable>
      </Row>
    </Screen>
  );
}
