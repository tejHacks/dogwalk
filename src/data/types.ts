/** DogWalk's shared types. Field names match the planned Laravel API (snake_case on the wire, mapped in api.ts). */

export type Role = 'customer' | 'walker';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  emailVerified: boolean;
  /** Customers: at least one dog. Walkers: walker profile submitted. */
  profileComplete: boolean;
}

export type DogSize = 'small' | 'medium' | 'large';

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  size: DogSize;
  ageYears: number;
  notes: string;
}

export interface WalkerProfile {
  userId: string;
  name: string;
  area: string;
  bio: string;
  pricePer30: number;
  sizes: DogSize[];
  yearsExperience: number;
  /** ID check: pending until reviewed by the DogWalk team (on the backend). */
  idStatus: 'not-submitted' | 'pending' | 'verified';
  available: boolean;
  rating: number;
  walks: number;
}

export type BookingStatus = 'requested' | 'accepted' | 'in-progress' | 'done' | 'declined' | 'cancelled';

export interface Booking {
  id: string;
  customerId: string;
  walkerId: string;
  dogName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  minutes: 30 | 60;
  price: number;
  status: BookingStatus;
  startedAt?: number;
  endedAt?: number;
  notes?: string;
}

export class AuthError extends Error {
  field?: 'name' | 'email' | 'phone' | 'password' | 'code';
  constructor(message: string, field?: AuthError['field']) {
    super(message);
    this.name = 'AuthError';
    this.field = field;
  }
}
