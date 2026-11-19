/**
 * Sample walkers so customers have someone to book before the backend exists.
 * Walkers who sign up on this phone appear alongside them.
 */
import type { DogSize, WalkerProfile } from './types';

export const sampleWalkers: WalkerProfile[] = [
  { userId: 'w1', name: 'Tobi Adeyemi', area: 'Bodija, Ibadan', pricePer30: 3000, rating: 4.9, walks: 212, bio: 'Grew up with Alsatians. Calm and confident with big, strong dogs.', sizes: ['medium', 'large'], yearsExperience: 6, idStatus: 'verified', available: true },
  { userId: 'w2', name: 'Kemi Okafor', area: 'Jericho, Ibadan', pricePer30: 2500, rating: 4.8, walks: 140, bio: 'Vet nursing student. Gentle with puppies and senior dogs.', sizes: ['small', 'medium'], yearsExperience: 3, idStatus: 'verified', available: true },
  { userId: 'w3', name: 'David Eze', area: 'UI, Ibadan', pricePer30: 2000, rating: 4.6, walks: 58, bio: 'Morning runner, perfect for high-energy dogs that need a proper workout.', sizes: ['medium', 'large'], yearsExperience: 2, idStatus: 'pending', available: true },
  { userId: 'w4', name: 'Amaka Nwosu', area: 'Ring Road, Ibadan', pricePer30: 2800, rating: 4.9, walks: 301, bio: 'Small-breed specialist. Sends photos and a note after every walk.', sizes: ['small'], yearsExperience: 5, idStatus: 'verified', available: false },
];

export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export const sizeLabel: Record<DogSize, string> = { small: 'Small (under 10 kg)', medium: 'Medium (10–25 kg)', large: 'Large (25 kg+)' };
