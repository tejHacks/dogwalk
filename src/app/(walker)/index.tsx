import { Switch, Text, View } from 'react-native';

import { BookingRow } from '@/components/booking-row';
import { Badge, Body, Button, Card, Empty, H1, Row, Screen, SectionTitle, Small } from '@/components/ui';
import { earnings, moveBooking, useBookings, useSession, useWalkerProfiles } from '@/data/store';
import { naira } from '@/data/walkers';
import { space, usePalette } from '@/theme';

const today = () => new Date().toISOString().slice(0, 10);

export default function WalkerToday() {
  const c = usePalette();
  const [user] = useSession();
  const [profiles, setProfiles] = useWalkerProfiles();
  const [bookings, setBookings] = useBookings();
  const me = profiles.find((p) => p.userId === user?.id);
  if (!user || !me) return null;

  const mine = bookings.filter((b) => b.walkerId === user.id);
  const requests = mine.filter((b) => b.status === 'requested');
  const todays = mine.filter((b) => (b.status === 'accepted' || b.status === 'in-progress') && b.date <= today());
  const later = mine.filter((b) => b.status === 'accepted' && b.date > today());
  const earned = earnings(bookings, user.id);
  const respond = (id: string, to: 'accepted' | 'declined') => setBookings((l) => l.map((b) => (b.id === id ? moveBooking(b, to, 'walker') : b)));
  const setAvailable = (available: boolean) => setProfiles((l) => l.map((p) => (p.userId === user.id ? { ...p, available } : p)));

  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <Small>Hello,</Small>
        <H1 style={{ fontSize: 26 }}>{user.name.split(' ')[0]}</H1>
      </View>

      <Card style={{ backgroundColor: me.available ? c.primary : c.card, borderColor: me.available ? c.primary : c.border }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: me.available ? c.primaryText : c.text, fontSize: 18, fontWeight: '800' }}>{me.available ? "You're online" : "You're offline"}</Text>
            <Text style={{ color: me.available ? c.primaryText : c.muted, opacity: 0.85 }}>{me.available ? 'Owners can book you.' : 'Owners can’t send you new requests.'}</Text>
          </View>
          <Switch accessibilityLabel="Available for walks" value={me.available} onValueChange={setAvailable} />
        </Row>
      </Card>

      <Row style={{ gap: space.sm }}>
        {[
          { label: 'Earned', value: naira(earned.total) },
          { label: 'Walks done', value: String(earned.walks) },
          { label: 'Your rate', value: `${naira(me.pricePer30)}` },
        ].map((s) => (
          <Card key={s.label} style={{ flex: 1, gap: 2, padding: 14 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }} numberOfLines={1}>{s.value}</Text>
            <Small>{s.label}</Small>
          </Card>
        ))}
      </Row>

      {me.idStatus !== 'verified' ? (
        <Card>
          <Badge tone="warn" icon="shield-outline">{me.idStatus === 'pending' ? 'ID check pending' : 'Not verified yet'}</Badge>
          <Body muted>{me.idStatus === 'pending' ? 'The DogWalk team is reviewing your ID. Verified walkers get more bookings.' : 'Verify your ID from Account to get the Verified badge.'}</Body>
        </Card>
      ) : null}

      <SectionTitle>{`New requests (${requests.length})`}</SectionTitle>
      {requests.length === 0 ? <Small>No new requests. Stay online to get booked.</Small> : null}
      {requests.map((b) => (
        <Card key={b.id}>
          <BookingRow booking={b} otherName="Owner" />
          <Row>
            <Button title="Decline" variant="secondary" style={{ flex: 1 }} onPress={() => respond(b.id, 'declined')} />
            <Button title="Accept" icon="checkmark" style={{ flex: 1 }} onPress={() => respond(b.id, 'accepted')} />
          </Row>
        </Card>
      ))}

      <SectionTitle>Today</SectionTitle>
      {todays.length === 0 ? <Empty icon="sunny-outline" title="No walks today" body="Accepted walks for today will show here, ready to start." /> : todays.map((b) => <BookingRow key={b.id} booking={b} otherName="Owner" />)}

      {later.length ? (
        <>
          <SectionTitle>Coming up</SectionTitle>
          {later.map((b) => (
            <BookingRow key={b.id} booking={b} otherName="Owner" />
          ))}
        </>
      ) : null}
    </Screen>
  );
}
