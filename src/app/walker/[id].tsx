import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Avatar, Badge, Body, Button, Card, Empty, H1, Icon, Label, Pill, Row, Screen, Small } from '@/components/ui';
import { uid, useAllWalkers, useBookings, useDogs, useSession } from '@/data/store';
import { naira, sizeLabel } from '@/data/walkers';
import { usePalette } from '@/theme';

const TIMES = ['06:30', '07:30', '09:00', '12:00', '16:00', '17:30', '18:30'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function WalkerProfileScreen() {
  const c = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user] = useSession();
  const [dogs] = useDogs();
  const [, setBookings] = useBookings();
  const walker = useAllWalkers().find((w) => w.userId === id);
  const myDogs = dogs.filter((d) => d.ownerId === user?.id);
  const [days] = useState(() => Array.from({ length: 7 }, (_, i) => new Date(Date.now() + i * 86_400_000)));
  const [date, setDate] = useState(() => iso(days[0]));
  const [time, setTime] = useState('17:30');
  const [minutes, setMinutes] = useState<30 | 60>(30);
  const [dogId, setDogId] = useState(myDogs[0]?.id);

  if (!walker) return <Screen><Empty icon="help-circle-outline" title="Walker not found" body="They may no longer be on DogWalk." /></Screen>;
  const dog = myDogs.find((d) => d.id === dogId);
  const price = walker.pricePer30 * (minutes / 30);
  const canWalkDog = !dog || walker.sizes.includes(dog.size);

  const book = () => {
    if (!user || !dog) return;
    const bookingId = uid();
    setBookings((b) => [...b, { id: bookingId, customerId: user.id, walkerId: walker.userId, dogName: dog.name, date, time, minutes, price, status: 'requested' }]);
    router.replace({ pathname: '/walk/[id]', params: { id: bookingId } });
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: walker.name }} />
      <Row style={{ gap: 16 }}>
        <Avatar name={walker.name} size={76} />
        <View style={{ flex: 1, gap: 6 }}>
          <H1 style={{ fontSize: 26 }}>{walker.name}</H1>
          <Row style={{ gap: 6 }}>
            <Icon name="location-outline" size={15} color={c.muted} />
            <Small>{walker.area}</Small>
          </Row>
          <Row style={{ flexWrap: 'wrap' }}>
            {walker.walks ? <Badge tone="warn" icon="star">{`${walker.rating.toFixed(1)} · ${walker.walks} walks`}</Badge> : <Badge tone="info">New walker</Badge>}
            {walker.idStatus === 'verified' ? <Badge tone="ok" icon="shield-checkmark">ID verified</Badge> : null}
          </Row>
        </View>
      </Row>
      <Body>{walker.bio}</Body>
      <Row style={{ flexWrap: 'wrap' }}>
        {walker.yearsExperience ? <Badge icon="ribbon-outline">{`${walker.yearsExperience} yrs with dogs`}</Badge> : null}
        {walker.sizes.map((s) => (
          <Badge key={s} icon="paw-outline">{sizeLabel[s].split(' (')[0]}</Badge>
        ))}
      </Row>

      <Card style={{ gap: 14 }}>
        <Text style={{ color: c.text, fontSize: 20, fontWeight: '800' }}>Book a walk</Text>
        {myDogs.length > 1 ? (
          <View style={{ gap: 6 }}>
            <Label>Dog</Label>
            <Row style={{ flexWrap: 'wrap' }}>
              {myDogs.map((d) => (
                <Pill key={d.id} active={d.id === dogId} onPress={() => setDogId(d.id)}>{d.name}</Pill>
              ))}
            </Row>
          </View>
        ) : null}
        <View style={{ gap: 6 }}>
          <Label>Day</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {days.map((d, i) => (
              <Pill key={iso(d)} active={date === iso(d)} onPress={() => setDate(iso(d))}>
                {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
              </Pill>
            ))}
          </ScrollView>
        </View>
        <View style={{ gap: 6 }}>
          <Label>Time</Label>
          <Row style={{ flexWrap: 'wrap' }}>
            {TIMES.map((t) => (
              <Pill key={t} active={time === t} onPress={() => setTime(t)}>{t}</Pill>
            ))}
          </Row>
        </View>
        <View style={{ gap: 6 }}>
          <Label>Length</Label>
          <Row>
            <Pill active={minutes === 30} onPress={() => setMinutes(30)}>30 min</Pill>
            <Pill active={minutes === 60} onPress={() => setMinutes(60)}>60 min</Pill>
          </Row>
        </View>
        {!canWalkDog ? <Small style={{ color: c.danger }}>{walker.name.split(' ')[0]} doesn&apos;t walk {dog?.size} dogs. Try another walker.</Small> : null}
        {!walker.available ? <Small style={{ color: c.warn }}>{walker.name.split(' ')[0]} is offline right now, but will see your request when they&apos;re back.</Small> : null}
        <Row style={{ justifyContent: 'space-between' }}>
          <Body muted>Total</Body>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800' }}>{naira(price)}</Text>
        </Row>
        <Button big title={`Request walk for ${dog?.name ?? 'your dog'}`} icon="paw" disabled={!dog || !canWalkDog} onPress={book} />
        <Small>You pay after the walk. Payments will be connected with the DogWalk server.</Small>
      </Card>
    </Screen>
  );
}
