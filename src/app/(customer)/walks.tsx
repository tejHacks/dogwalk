import { router } from 'expo-router';
import { useState } from 'react';

import { BookingRow } from '@/components/booking-row';
import { Button, Empty, Screen, Segmented } from '@/components/ui';
import { isActive, useAllWalkers, useBookings, useSession } from '@/data/store';

export default function MyWalks() {
  const [user] = useSession();
  const [bookings] = useBookings();
  const walkers = useAllWalkers();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const mine = bookings.filter((b) => b.customerId === user?.id && (tab === 'upcoming' ? isActive(b) : !isActive(b)));

  return (
    <Screen>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }]} />
      {mine.length === 0 ? (
        <Empty
          icon="calendar-outline"
          title={tab === 'upcoming' ? 'No walks booked' : 'No past walks yet'}
          body={tab === 'upcoming' ? 'Find a walker near you and book your first walk.' : 'Finished, cancelled and declined walks will show here.'}
          action={tab === 'upcoming' ? <Button title="Find a walker" icon="paw" onPress={() => router.push('/(customer)')} /> : null}
        />
      ) : (
        mine.map((b) => <BookingRow key={b.id} booking={b} otherName={walkers.find((w) => w.userId === b.walkerId)?.name ?? 'Walker'} />)
      )}
    </Screen>
  );
}
