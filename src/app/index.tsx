import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Body, Card, H2, Label, Row, Screen } from '@/components/ui';
import { getWalker, naira, walkers, type Booking } from '@/data/walkers';
import { useStoredState } from '@/lib/storage';
import { usePalette } from '@/theme';

export default function Home() {
  const c = usePalette();
  const [bookings] = useStoredState<Booking[]>('bookings', []);
  const active = bookings.filter((b) => b.status !== 'done');

  return (
    <Screen>
      {active.length ? (
        <View style={{ gap: 10 }}>
          <Label>Your walks</Label>
          {active.map((b) => {
            const w = getWalker(b.walkerId);
            return (
              <Card key={b.id} onPress={() => router.push({ pathname: '/walk/[id]', params: { id: b.id } })} style={{ borderColor: b.status === 'in-progress' ? c.primary : c.border }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <H2>{b.dogName} with {w?.name ?? 'walker'}</H2>
                  <Text style={{ color: b.status === 'in-progress' ? c.primary : c.muted, fontWeight: '700' }}>{b.status === 'in-progress' ? 'LIVE' : `${b.minutes} min`}</Text>
                </Row>
                <Body muted>{b.date} at {b.time}</Body>
              </Card>
            );
          })}
        </View>
      ) : (
        <Card>
          <H2>Book a trusted walker</H2>
          <Body muted>Pick a walker below, choose a time, and follow the walk live.</Body>
        </Card>
      )}

      <Label>Walkers near you · sample data</Label>
      {walkers.map((w) => (
        <Card key={w.id} onPress={() => router.push({ pathname: '/walker/[id]', params: { id: w.id } })}>
          <Row>
            <Text style={{ fontSize: 40 }}>{w.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Row>
                <H2>{w.name}</H2>
                {w.verified ? <Text style={{ color: c.primary, fontWeight: '700' }}>✓ Verified</Text> : null}
              </Row>
              <Body muted>{w.area}</Body>
              <Body muted>
                ★ {w.rating} · {w.walks} walks · {naira(w.pricePer30)}/30 min
              </Body>
            </View>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
