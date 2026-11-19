import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Body, Button, H1, Icon, Screen, Small, type IconName } from '@/components/ui';
import type { Role } from '@/data/types';
import { radius, space, usePalette } from '@/theme';

const roles: { role: Role; icon: IconName; title: string; body: string }[] = [
  { role: 'customer', icon: 'paw-outline', title: 'I need a walker', body: 'Book walks for your dog and follow them live.' },
  { role: 'walker', icon: 'walk-outline', title: 'I want to walk dogs', body: 'Set your price and area, and earn from walks.' },
];

export default function Welcome() {
  const c = usePalette();
  return (
    <Screen edges={['top', 'bottom']} style={{ flexGrow: 1, paddingTop: space.xl }}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="paw" size={34} color={c.primaryText} />
      </View>
      <H1>Welcome to DogWalk</H1>
      <Body muted>How will you use DogWalk? You can&apos;t change this later, but you can make another account.</Body>
      {roles.map((r) => (
        <Pressable
          key={r.role}
          accessibilityRole="button"
          accessibilityLabel={r.title}
          onPress={() => router.push({ pathname: '/signup', params: { role: r.role } })}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, opacity: pressed ? 0.85 : 1 })}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={r.icon} size={26} color={c.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{r.title}</Text>
            <Small>{r.body}</Small>
          </View>
          <Icon name="chevron-forward" size={20} color={c.subtle} />
        </Pressable>
      ))}
      <View style={{ flex: 1 }} />
      <Button title="I already have an account" variant="secondary" onPress={() => router.push('/login')} />
      <Small style={{ textAlign: 'center' }}>By continuing you agree to DogWalk&apos;s terms and privacy policy.</Small>
    </Screen>
  );
}
