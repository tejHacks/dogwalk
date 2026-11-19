import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { Avatar, Badge, Body, Button, Card, Empty, Field, H1, Row, Screen, SectionTitle, Small } from '@/components/ui';
import { prettyDate } from '@/components/booking-row';
import { canMove, moveBooking, statusLabel, useAllWalkers, useBookings, useSession } from '@/data/store';
import { naira } from '@/data/walkers';
import { radius, usePalette } from '@/theme';

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** One booking, from both sides: owners follow it; walkers accept, start and finish it. */
export default function WalkScreen() {
  const c = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user] = useSession();
  const [bookings, setBookings, ready] = useBookings();
  const walkers = useAllWalkers();
  const [now, setNow] = useState(() => Date.now());
  const b = bookings.find((x) => x.id === id);

  useEffect(() => {
    if (b?.status !== 'in-progress') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [b?.status]);

  if (!ready) return null;
  if (!b || !user) return <Screen><Empty icon="help-circle-outline" title="Walk not found" body="It may have been cancelled." /></Screen>;

  const role = user.id === b.walkerId ? 'walker' : 'customer';
  const walker = walkers.find((w) => w.userId === b.walkerId);
  const move = (to: Parameters<typeof moveBooking>[1]) => setBookings((l) => l.map((x) => (x.id === b.id ? moveBooking(x, to, role) : x)));
  const elapsed = b.startedAt ? (b.endedAt ?? now) - b.startedAt : 0;
  const target = b.minutes * 60_000;
  const live = b.status === 'in-progress';

  return (
    <Screen>
      <Stack.Screen options={{ title: `${b.dogName}'s walk` }} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Badge tone={live ? 'ok' : b.status === 'requested' ? 'warn' : b.status === 'accepted' ? 'info' : 'neutral'} icon={live ? 'radio-button-on' : undefined}>
          {statusLabel[b.status]}
        </Badge>
        <Small>{naira(b.price)}</Small>
      </Row>
      <H1 style={{ fontSize: 26 }}>{b.dogName}&apos;s walk</H1>
      <Body muted>{prettyDate(b.date, b.time)} · {b.minutes} minutes</Body>

      {role === 'customer' && walker ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={walker.name} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>{walker.name}</Text>
            <Small>{walker.area}</Small>
          </View>
        </Card>
      ) : null}

      {b.status === 'in-progress' || b.status === 'done' ? (
        <View style={{ borderWidth: 2, borderColor: live ? c.primary : c.border, backgroundColor: c.card, borderRadius: radius.lg, padding: 24, alignItems: 'center', gap: 12 }}>
          <Text style={{ color: c.text, fontSize: 60, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{clock(elapsed)}</Text>
          <View style={{ height: 10, alignSelf: 'stretch', borderRadius: 5, backgroundColor: c.chip, overflow: 'hidden' }}>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: c.primary, width: `${Math.min(100, (elapsed / target) * 100)}%` }} />
          </View>
          <Small>{live ? `of ${b.minutes} minutes` : 'Walk finished'}</Small>
        </View>
      ) : null}

      {b.status === 'requested' && role === 'customer' ? <Card><Body muted>Waiting for {walker?.name.split(' ')[0] ?? 'the walker'} to accept. You&apos;ll see it here as soon as they do.</Body></Card> : null}

      {role === 'walker' ? (
        <>
          {canMove(b, 'accepted', 'walker') ? <Button big title="Accept walk" icon="checkmark" onPress={() => move('accepted')} /> : null}
          {canMove(b, 'declined', 'walker') ? <Button title="Decline" variant="secondary" onPress={() => move('declined')} /> : null}
          {canMove(b, 'in-progress', 'walker') ? <Button big title="Start walk" icon="play" onPress={() => move('in-progress')} /> : null}
          {canMove(b, 'done', 'walker') ? <Button big title="Finish walk" icon="flag" onPress={() => move('done')} /> : null}
        </>
      ) : null}

      {b.status !== 'requested' && b.status !== 'declined' && b.status !== 'cancelled' ? (
        <>
          <SectionTitle>Walk notes</SectionTitle>
          {role === 'walker' ? (
            <Field label="Notes for the owner" multiline value={b.notes ?? ''} onChangeText={(notes) => setBookings((l) => l.map((x) => (x.id === b.id ? { ...x, notes } : x)))} placeholder="Pee ✓ Poo ✓ Drank water, met a friendly cat…" />
          ) : (
            <Card><Body muted={!b.notes}>{b.notes || 'Your walker’s notes will appear here.'}</Body></Card>
          )}
        </>
      ) : null}

      {role === 'customer' && walker && b.status !== 'done' ? <Button title="Call walker" icon="call-outline" variant="secondary" onPress={() => Linking.openURL('tel:')} /> : null}
      {role === 'customer' && canMove(b, 'cancelled', 'customer') ? (
        <Button
          title="Cancel booking"
          variant="ghost"
          onPress={() => {
            move('cancelled');
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}
