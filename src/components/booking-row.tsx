import { router } from 'expo-router';

import { Avatar, Badge, ListItem, type Tone } from '@/components/ui';
import { statusLabel } from '@/data/store';
import type { Booking, BookingStatus } from '@/data/types';
import { naira } from '@/data/walkers';

const tone: Record<BookingStatus, Tone> = { requested: 'warn', accepted: 'info', 'in-progress': 'ok', done: 'neutral', declined: 'danger', cancelled: 'neutral' };

export const prettyDate = (d: string, t: string) => `${new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${t}`;

export function BookingRow({ booking, otherName }: { booking: Booking; otherName: string }) {
  return (
    <ListItem
      title={`${booking.dogName} · ${booking.minutes} min`}
      subtitle={`${prettyDate(booking.date, booking.time)} · ${otherName} · ${naira(booking.price)}`}
      leading={<Avatar name={booking.dogName} size={42} />}
      trailing={<Badge tone={tone[booking.status]}>{statusLabel[booking.status]}</Badge>}
      onPress={() => router.push({ pathname: '/walk/[id]', params: { id: booking.id } })}
    />
  );
}
