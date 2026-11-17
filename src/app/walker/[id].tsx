import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Body, Button, Card, Field, H1, Label, Pill, Row, Screen } from '@/components/ui';
import { getWalker, naira, type Booking } from '@/data/walkers';
import { uid, useStoredState } from '@/lib/storage';

export default function WalkerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const walker = getWalker(id);
  const [, setBookings] = useStoredState<Booking[]>('bookings', []);
  const [dogName, setDogName] = useStoredState('dog-name', '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('07:30');
  const [minutes, setMinutes] = useState<30 | 60>(30);

  if (!walker) return <Screen><Body>Walker not found.</Body></Screen>;

  const valid = dogName.trim() && /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time);
  const price = walker.pricePer30 * (minutes / 30);

  const book = () => {
    setBookings((b) => [...b, { id: uid(), walkerId: walker.id, dogName: dogName.trim(), date, time, minutes, status: 'upcoming' }]);
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: walker.name }} />
      <Text style={{ fontSize: 64 }}>{walker.emoji}</Text>
      <H1>{walker.name}</H1>
      <Body muted>
        {walker.area} · ★ {walker.rating} · {walker.walks} walks
      </Body>
      <Body>{walker.bio}</Body>

      <Card>
        <Label>Book a walk</Label>
        <Field label="Dog's name" value={dogName} onChangeText={setDogName} placeholder="e.g. Bingo" />
        <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-11-20" keyboardType="numbers-and-punctuation" />
        <Field label="Time (HH:MM)" value={time} onChangeText={setTime} placeholder="07:30" keyboardType="numbers-and-punctuation" />
        <Row>
          <Pill active={minutes === 30} onPress={() => setMinutes(30)}>30 min</Pill>
          <Pill active={minutes === 60} onPress={() => setMinutes(60)}>60 min</Pill>
        </Row>
        <Body>Total: {naira(price)}</Body>
        <Button title="Request booking" disabled={!valid} onPress={book} />
        <Body muted style={{ fontSize: 13 }}>Payments aren&apos;t connected yet — this saves the booking on your phone.</Body>
      </Card>
    </Screen>
  );
}
