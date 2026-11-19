import { useState } from 'react';

import { BookingRow } from '@/components/booking-row';
import { Empty, Screen, Segmented } from '@/components/ui';
import { isActive, useBookings, useSession } from '@/data/store';

export default function WalkerJobs() {
  const [user] = useSession();
  const [bookings] = useBookings();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const list = bookings.filter((b) => b.walkerId === user?.id && (tab === 'active' ? isActive(b) : !isActive(b)));
  return (
    <Screen>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'active', label: 'Active' }, { value: 'history', label: 'History' }]} />
      {list.length === 0 ? (
        <Empty icon="list-outline" title={tab === 'active' ? 'No active walks' : 'No history yet'} body={tab === 'active' ? 'Requests and accepted walks appear here.' : 'Completed and cancelled walks appear here.'} />
      ) : (
        list.map((b) => <BookingRow key={b.id} booking={b} otherName="Owner" />)
      )}
    </Screen>
  );
}
