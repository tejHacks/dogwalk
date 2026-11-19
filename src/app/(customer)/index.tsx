import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { BookingRow } from '@/components/booking-row';
import { Avatar, Badge, Card, Field, Icon, Pill, Row, Screen, SectionTitle, Small } from '@/components/ui';
import { isActive, useAllWalkers, useBookings, useDogs, useSession } from '@/data/store';
import type { DogSize } from '@/data/types';
import { naira } from '@/data/walkers';
import { usePalette } from '@/theme';

export default function FindWalker() {
  const c = usePalette();
  const [user] = useSession();
  const [dogs] = useDogs();
  const [bookings] = useBookings();
  const walkers = useAllWalkers();
  const [q, setQ] = useState('');
  const myDog = dogs.find((d) => d.ownerId === user?.id);
  const [size, setSize] = useState<DogSize | null>(myDog?.size ?? null);
  const upcoming = bookings.filter((b) => b.customerId === user?.id && isActive(b)).slice(0, 2);

  const list = walkers
    .filter((w) => (!size || w.sizes.includes(size)) && `${w.name} ${w.area}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => Number(b.available) - Number(a.available) || b.rating - a.rating);

  return (
    <Screen>
      {upcoming.length ? (
        <>
          <SectionTitle>Coming up</SectionTitle>
          {upcoming.map((b) => (
            <BookingRow key={b.id} booking={b} otherName={walkers.find((w) => w.userId === b.walkerId)?.name ?? 'Walker'} />
          ))}
        </>
      ) : null}
      <Field label="Search" value={q} onChangeText={setQ} placeholder="Name or area, e.g. Bodija" />
      <Row style={{ flexWrap: 'wrap' }}>
        <Pill active={!size} onPress={() => setSize(null)}>All sizes</Pill>
        {(['small', 'medium', 'large'] as DogSize[]).map((s) => (
          <Pill key={s} active={size === s} onPress={() => setSize(s)}>
            {s[0].toUpperCase() + s.slice(1)} dogs
          </Pill>
        ))}
      </Row>
      <SectionTitle>{`${list.length} walker${list.length === 1 ? '' : 's'} near you`}</SectionTitle>
      {list.map((w) => (
        <Card key={w.userId} onPress={() => router.push({ pathname: '/walker/[id]', params: { id: w.userId } })} accessibilityLabel={`${w.name}, ${w.area}`} style={{ opacity: w.available ? 1 : 0.6 }}>
          <Row style={{ gap: 14, alignItems: 'flex-start' }}>
            <Avatar name={w.name} size={52} />
            <View style={{ flex: 1, gap: 4 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>{w.name}</Text>
                <Text style={{ color: c.text, fontWeight: '800' }}>{naira(w.pricePer30)}<Text style={{ color: c.muted, fontWeight: '500' }}>/30m</Text></Text>
              </Row>
              <Row style={{ gap: 6 }}>
                <Icon name="location-outline" size={14} color={c.muted} />
                <Small>{w.area}</Small>
              </Row>
              <Row style={{ gap: 8, flexWrap: 'wrap' }}>
                {w.walks > 0 ? <Badge tone="warn" icon="star">{`${w.rating.toFixed(1)} · ${w.walks} walks`}</Badge> : <Badge tone="info">New walker</Badge>}
                {w.idStatus === 'verified' ? <Badge tone="ok" icon="shield-checkmark">Verified</Badge> : null}
                {!w.available ? <Badge>Unavailable</Badge> : null}
              </Row>
            </View>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
