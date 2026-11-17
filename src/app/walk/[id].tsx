import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Field, H1, Label, Screen } from '@/components/ui';
import { getWalker, type Booking } from '@/data/walkers';
import { useStoredState } from '@/lib/storage';
import { usePalette } from '@/theme';

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Follow a walk: start, live timer, notes, finish. */
export default function WalkScreen() {
  const c = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bookings, setBookings, ready] = useStoredState<Booking[]>('bookings', []);
  const [now, setNow] = useState(0);
  const booking = bookings.find((b) => b.id === id);

  useEffect(() => {
    if (booking?.status !== 'in-progress') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [booking?.status]);

  if (!ready) return <Screen>{null}</Screen>;
  if (!booking) return <Screen><Body>Walk not found.</Body></Screen>;

  const walker = getWalker(booking.walkerId);
  const update = (patch: Partial<Booking>) => setBookings((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const elapsed = booking.startedAt ? (booking.endedAt ?? (now || booking.startedAt)) - booking.startedAt : 0;
  const target = booking.minutes * 60_000;

  return (
    <Screen>
      <H1>{booking.dogName}&apos;s walk</H1>
      <Body muted>
        with {walker?.name} · {booking.date} at {booking.time}
      </Body>

      <View style={[styles.timer, { backgroundColor: c.card, borderColor: booking.status === 'in-progress' ? c.primary : c.border }]}>
        <Text style={[styles.time, { color: c.text }]}>{fmt(elapsed)}</Text>
        <View style={[styles.track, { backgroundColor: c.border }]}>
          <View style={[styles.fill, { backgroundColor: c.primary, width: `${Math.min(100, (elapsed / target) * 100)}%` }]} />
        </View>
        <Text style={{ color: c.muted }}>of {booking.minutes} minutes</Text>
      </View>

      {booking.status === 'upcoming' ? <Button big title="Start walk" onPress={() => update({ status: 'in-progress', startedAt: Date.now() })} /> : null}
      {booking.status === 'in-progress' ? <Button big title="End walk" onPress={() => update({ status: 'done', endedAt: Date.now() })} /> : null}

      <Card>
        <Label>Walk notes</Label>
        <Field label="How did it go?" multiline value={booking.notes ?? ''} onChangeText={(notes) => update({ notes })} placeholder="Pee ✓, poo ✓, met a friendly cat…" />
      </Card>

      {booking.status === 'upcoming' ? (
        <Button title="Cancel booking" variant="secondary" onPress={() => { setBookings((l) => l.filter((b) => b.id !== id)); router.back(); }} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  timer: { borderWidth: 2, borderRadius: 28, padding: 24, alignItems: 'center', gap: 12 },
  time: { fontSize: 64, fontWeight: '800', fontVariant: ['tabular-nums'] },
  track: { height: 10, borderRadius: 5, alignSelf: 'stretch', overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
});
