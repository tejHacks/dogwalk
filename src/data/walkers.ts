/**
 * SAMPLE DATA — placeholder walkers for building the UI.
 * Replace with your backend (e.g. Supabase) before launch.
 */
export interface Walker {
  id: string;
  name: string;
  area: string;
  pricePer30: number;
  rating: number;
  walks: number;
  bio: string;
  emoji: string;
  verified: boolean;
}

export const walkers: Walker[] = [
  { id: 'w1', name: 'Tobi A.', area: 'Bodija, Ibadan', pricePer30: 3000, rating: 4.9, walks: 212, bio: 'Grew up with Alsatians. Calm with big, strong dogs.', emoji: '🧑🏾', verified: true },
  { id: 'w2', name: 'Kemi O.', area: 'Jericho, Ibadan', pricePer30: 2500, rating: 4.8, walks: 140, bio: 'Vet nursing student. Great with puppies and seniors.', emoji: '👩🏾', verified: true },
  { id: 'w3', name: 'David E.', area: 'UI, Ibadan', pricePer30: 2000, rating: 4.6, walks: 58, bio: 'Morning runner — perfect for high-energy dogs.', emoji: '🧑🏿', verified: false },
  { id: 'w4', name: 'Amaka N.', area: 'Ring Road, Ibadan', pricePer30: 2800, rating: 4.9, walks: 301, bio: 'Small-breed specialist. Sends photos every walk.', emoji: '👩🏿', verified: true },
];

export const getWalker = (id: string) => walkers.find((w) => w.id === id);
export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export interface Booking {
  id: string;
  walkerId: string;
  dogName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  minutes: 30 | 60;
  status: 'upcoming' | 'in-progress' | 'done';
  startedAt?: number;
  endedAt?: number;
  notes?: string;
}
