/** On-device state. When the Laravel API is connected these become API calls. */
import { useCallback, useMemo } from 'react';

import { auth } from './auth';
import type { Booking, BookingStatus, Dog, User, WalkerProfile } from './types';
import { sampleWalkers } from './walkers';
import { useStoredState } from '@/lib/storage';

export const useOnboarded = () => useStoredState<boolean>('onboarded', false);
export const useSession = () => useStoredState<User | null>('session', null);
export const useDogs = () => useStoredState<Dog[]>('dogs', []);
export const useWalkerProfiles = () => useStoredState<WalkerProfile[]>('walker-profiles', []);
export const useBookings = () => useStoredState<Booking[]>('bookings', []);

/** Everyone a customer can book: sample walkers plus walkers registered on this phone. */
export function useAllWalkers() {
  const [profiles] = useWalkerProfiles();
  return useMemo(() => [...profiles.filter((p) => p.idStatus !== 'not-submitted'), ...sampleWalkers], [profiles]);
}

export function useAuthActions() {
  const [, setSession] = useSession();
  const signedIn = useCallback((u: User) => setSession(u), [setSession]);
  const logOut = useCallback(async () => {
    await auth.logOut();
    setSession(null);
  }, [setSession]);
  return { signedIn, logOut };
}

/* ------------------------------------------------------------ booking rules */

const allowed: Record<BookingStatus, { to: BookingStatus; by: 'customer' | 'walker' }[]> = {
  requested: [
    { to: 'accepted', by: 'walker' },
    { to: 'declined', by: 'walker' },
    { to: 'cancelled', by: 'customer' },
  ],
  accepted: [
    { to: 'in-progress', by: 'walker' },
    { to: 'cancelled', by: 'customer' },
  ],
  'in-progress': [{ to: 'done', by: 'walker' }],
  done: [],
  declined: [],
  cancelled: [],
};

export const canMove = (b: Booking, to: BookingStatus, by: 'customer' | 'walker') => allowed[b.status].some((a) => a.to === to && a.by === by);

/** Apply a status change, or return the booking unchanged if it isn't allowed. */
export function moveBooking(b: Booking, to: BookingStatus, by: 'customer' | 'walker', now = Date.now()): Booking {
  if (!canMove(b, to, by)) return b;
  return { ...b, status: to, ...(to === 'in-progress' ? { startedAt: now } : null), ...(to === 'done' ? { endedAt: now } : null) };
}

export const isActive = (b: Booking) => b.status === 'requested' || b.status === 'accepted' || b.status === 'in-progress';

export const statusLabel: Record<BookingStatus, string> = {
  requested: 'Waiting for walker',
  accepted: 'Confirmed',
  'in-progress': 'Walking now',
  done: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

export function earnings(bookings: Booking[], walkerId: string) {
  const done = bookings.filter((b) => b.walkerId === walkerId && b.status === 'done');
  return { total: done.reduce((s, b) => s + b.price, 0), walks: done.length };
}
export { uid } from '@/lib/storage';
