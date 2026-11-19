import { router } from 'expo-router';

import { Avatar, Badge, Body, Button, Card, H2, ListItem, Icon, Row, Screen, SectionTitle, Small } from '@/components/ui';
import { auth } from '@/data/auth';
import { useAuthActions, useSession } from '@/data/store';
import { usePalette } from '@/theme';
import type { ReactNode } from 'react';
import { View } from 'react-native';

export function AccountScreen({ children }: { children?: ReactNode }) {
  const c = usePalette();
  const [user] = useSession();
  const { logOut } = useAuthActions();
  if (!user) return null;
  return (
    <Screen>
      <Row style={{ gap: 14 }}>
        <Avatar name={user.name} size={64} />
        <View style={{ flex: 1, gap: 4 }}>
          <H2>{user.name}</H2>
          <Small>{user.email}</Small>
          <Badge tone="info">{user.role === 'walker' ? 'Walker' : 'Dog owner'}</Badge>
        </View>
      </Row>
      {children}
      <SectionTitle>Account</SectionTitle>
      <ListItem title="Phone" subtitle={user.phone} leading={<Icon name="call-outline" size={22} color={c.primary} />} />
      <ListItem title="Change password" subtitle="We’ll email you a code" leading={<Icon name="key-outline" size={22} color={c.primary} />} onPress={() => router.push({ pathname: '/forgot-password', params: { email: user.email } })} />
      {auth.mode === 'demo' ? (
        <Card>
          <Badge tone="info" icon="flask-outline">Demo mode</Badge>
          <Body muted>Accounts and bookings are saved on this phone until the DogWalk server is connected.</Body>
        </Card>
      ) : null}
      <Button
        title="Log out"
        icon="log-out-outline"
        variant="secondary"
        onPress={async () => {
          await logOut();
          router.replace('/welcome');
        }}
      />
    </Screen>
  );
}
