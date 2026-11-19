import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AuthHeader, DemoCodeNote } from '@/components/auth';
import { Button, Row, Screen, Small } from '@/components/ui';
import { auth } from '@/data/auth';
import { useAuthActions, useSession } from '@/data/store';
import { AuthError } from '@/data/types';
import { radius, usePalette } from '@/theme';

const RESEND_SECONDS = 30;

/** 6-digit code for a new account's email, or for a password reset. */
export default function Verify() {
  const c = usePalette();
  const { email = '', purpose = 'signup' } = useLocalSearchParams<{ email: string; purpose: 'signup' | 'reset' }>();
  const [user] = useSession();
  const { signedIn, logOut } = useAuthActions();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      if (purpose === 'reset') {
        await auth.checkResetCode(email, code);
        router.replace({ pathname: '/reset-password', params: { email, code } });
      } else {
        signedIn(await auth.verifyEmail(email, code));
        router.replace('/');
      }
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Something went wrong. Please try again.');
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setWait(RESEND_SECONDS);
    await (purpose === 'reset' ? auth.forgotPassword(email) : auth.sendVerifyCode(email)).catch(() => {});
  };

  return (
    <Screen>
      <AuthHeader icon="mail-unread-outline" title="Check your email" subtitle={`Enter the 6-digit code we sent to ${email}.`} />
      <Pressable accessibilityLabel="Verification code" onPress={() => input.current?.focus()}>
        <Row style={{ justifyContent: 'space-between' }}>
          {Array.from({ length: 6 }, (_, i) => (
            <View key={i} style={{ flex: 1, maxWidth: 54, aspectRatio: 0.85, borderRadius: radius.md, borderWidth: 2, borderColor: error ? c.danger : i === code.length ? c.primary : c.border, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: c.text, fontSize: 26, fontWeight: '800' }}>{code[i] ?? ''}</Text>
            </View>
          ))}
        </Row>
      </Pressable>
      <TextInput
        ref={input}
        accessibilityLabel="Code"
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        maxLength={6}
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />
      {error ? <Small style={{ color: c.danger }}>{error}</Small> : null}
      <DemoCodeNote />
      <Button big title={purpose === 'reset' ? 'Continue' : 'Verify email'} loading={busy} disabled={code.length !== 6} onPress={submit} />
      <Row style={{ justifyContent: 'center' }}>
        {wait > 0 ? (
          <Small>Resend code in {wait}s</Small>
        ) : (
          <Pressable accessibilityRole="button" onPress={resend} hitSlop={8}>
            <Text style={{ color: c.primary, fontWeight: '700' }}>Resend code</Text>
          </Pressable>
        )}
      </Row>
      {purpose === 'signup' && user ? (
        <Button
          title="Use a different account"
          variant="ghost"
          onPress={async () => {
            await logOut();
            router.replace('/welcome');
          }}
        />
      ) : null}
    </Screen>
  );
}
