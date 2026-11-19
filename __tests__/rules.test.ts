import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEMO_CODE, demoAuth, passwordProblems, validEmail, validPhone } from '@/data/auth';
import { canMove, earnings, isActive, moveBooking } from '@/data/store';
import type { Booking } from '@/data/types';

beforeEach(() => AsyncStorage.clear());

describe('sign-up validation', () => {
  it('accepts Nigerian phone numbers in common formats', () => {
    for (const p of ['08031234567', '0803 123 4567', '+2348031234567', '09011112222', '07012345678']) expect(validPhone(p)).toBe(true);
    for (const p of ['12345', '0603123456', '+447911123456']) expect(validPhone(p)).toBe(false);
  });
  it('checks emails and password strength', () => {
    expect(validEmail('ada@example.com')).toBe(true);
    expect(validEmail('ada@')).toBe(false);
    expect(passwordProblems('short1')).toContain('at least 8 characters');
    expect(passwordProblems('onlyletters')).toContain('letters and numbers');
    expect(passwordProblems('walkies2026')).toEqual([]);
  });
});

describe('demo auth', () => {
  const ada = { name: 'Ada Bello', email: 'Ada@Example.com', phone: '0803 123 4567', password: 'walkies2026', role: 'customer' as const };

  it('signs up, rejects duplicates, and logs in case-insensitively', async () => {
    const u = await demoAuth.signUp(ada);
    expect(u).toMatchObject({ email: 'ada@example.com', role: 'customer', emailVerified: false, profileComplete: false });
    await expect(demoAuth.signUp(ada)).rejects.toMatchObject({ field: 'email' });
    expect((await demoAuth.logIn('ADA@example.com', 'walkies2026')).id).toBe(u.id);
    await expect(demoAuth.logIn('ada@example.com', 'wrong-pass1')).rejects.toMatchObject({ field: 'password' });
  });

  it('never stores the password itself', async () => {
    await demoAuth.signUp(ada);
    expect(await AsyncStorage.getItem('auth-users')).not.toContain('walkies2026');
  });

  it('verifies email only with the right code', async () => {
    await demoAuth.signUp(ada);
    await expect(demoAuth.verifyEmail(ada.email, '000000')).rejects.toMatchObject({ field: 'code' });
    expect((await demoAuth.verifyEmail(ada.email, DEMO_CODE)).emailVerified).toBe(true);
  });

  it('resets the password', async () => {
    await demoAuth.signUp(ada);
    await demoAuth.resetPassword(ada.email, DEMO_CODE, 'newpass2027');
    await expect(demoAuth.logIn(ada.email, 'walkies2026')).rejects.toBeTruthy();
    expect((await demoAuth.logIn(ada.email, 'newpass2027')).name).toBe('Ada Bello');
  });
});

describe('booking rules', () => {
  const b: Booking = { id: 'b1', customerId: 'c', walkerId: 'w', dogName: 'Bingo', date: '2026-11-20', time: '07:30', minutes: 30, price: 3000, status: 'requested' };

  it('only walkers accept, start and finish; only owners cancel', () => {
    expect(canMove(b, 'accepted', 'customer')).toBe(false);
    expect(canMove(b, 'accepted', 'walker')).toBe(true);
    expect(canMove(b, 'cancelled', 'walker')).toBe(false);
    expect(canMove(b, 'cancelled', 'customer')).toBe(true);
  });

  it('runs requested → accepted → in progress → done with timestamps', () => {
    const a = moveBooking(b, 'accepted', 'walker', 1);
    const s = moveBooking(a, 'in-progress', 'walker', 1000);
    const d = moveBooking(s, 'done', 'walker', 1_801_000);
    expect(d).toMatchObject({ status: 'done', startedAt: 1000, endedAt: 1_801_000 });
    expect(isActive(d)).toBe(false);
  });

  it('ignores impossible moves', () => {
    expect(moveBooking(b, 'done', 'walker')).toBe(b);
    expect(moveBooking(moveBooking(b, 'declined', 'walker'), 'accepted', 'walker').status).toBe('declined');
  });

  it("counts a walker's earnings from finished walks only", () => {
    const list: Booking[] = [
      { ...b, id: '1', status: 'done' },
      { ...b, id: '2', status: 'done', price: 6000, minutes: 60 },
      { ...b, id: '3', status: 'accepted' },
      { ...b, id: '4', status: 'done', walkerId: 'someone-else' },
    ];
    expect(earnings(list, 'w')).toEqual({ total: 9000, walks: 2 });
  });
});
