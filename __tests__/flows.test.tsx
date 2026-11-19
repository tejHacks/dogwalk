import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { DEMO_CODE, demoAuth } from '@/data/auth';
import { resetStoredStateCache } from '@/lib/storage';

const APP = './src/app';
/** The router test renderer turns on fake timers; auth uses real async work, so switch back. */
async function open(url: string) {
  await renderRouter(APP, { initialUrl: url });
  jest.useRealTimers();
}
const typeCode = async () => fireEvent.changeText(await screen.findByLabelText('Code'), DEMO_CODE);

beforeEach(async () => {
  await AsyncStorage.clear();
  resetStoredStateCache();
});

it('first launch shows onboarding, then the role choice', async () => {
  await open('/');
  expect(await screen.findByText('Walks your dog will love')).toBeOnTheScreen();
  await fireEvent.press(screen.getByText('Skip'));
  expect(await screen.findByText('Welcome to DogWalk')).toBeOnTheScreen();
  expect(screen.getByLabelText('I need a walker')).toBeOnTheScreen();
  expect(screen.getByLabelText('I want to walk dogs')).toBeOnTheScreen();
});

it('a customer signs up, verifies email, adds a dog, and books a walker', async () => {
  await AsyncStorage.setItem('onboarded', 'true');
  await open('/welcome');
  await fireEvent.press(await screen.findByLabelText('I need a walker'));
  await fireEvent.changeText(await screen.findByLabelText('Full name'), 'Ada Bello');
  await fireEvent.changeText(screen.getByLabelText('Email'), 'ada@example.com');
  await fireEvent.changeText(screen.getByLabelText('Phone'), '08031234567');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'walkies2026');
  await fireEvent.press(screen.getByText('Create account'));

  await typeCode();
  await fireEvent.press(screen.getByText('Verify email'));

  await fireEvent.changeText(await screen.findByLabelText("Dog's name"), 'Bingo');
  await fireEvent.press(screen.getByText('Save and find walkers'));

  await fireEvent.press(await screen.findByLabelText('Tobi Adeyemi, Bodija, Ibadan'));
  await fireEvent.press(await screen.findByText('Request walk for Bingo'));
  expect(await screen.findByText('Waiting for walker')).toBeOnTheScreen();
  const [booking] = JSON.parse((await AsyncStorage.getItem('bookings'))!);
  expect(booking).toMatchObject({ dogName: 'Bingo', walkerId: 'w1', status: 'requested', price: 3000 });
});

it('signup shows field errors from validation', async () => {
  await AsyncStorage.setItem('onboarded', 'true');
  await open('/signup?role=customer');
  await fireEvent.changeText(await screen.findByLabelText('Full name'), 'Ada');
  await fireEvent.changeText(screen.getByLabelText('Email'), 'ada@example.com');
  await fireEvent.changeText(screen.getByLabelText('Phone'), '12345');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'walkies2026');
  await fireEvent.press(screen.getByText('Create account'));
  expect(await screen.findByText(/Enter a Nigerian phone number/)).toBeOnTheScreen();
});

it('a walker signs up, builds a profile, then accepts and completes a walk', async () => {
  await AsyncStorage.setItem('onboarded', 'true');
  await open('/signup?role=walker');
  expect(await screen.findByText('Become a walker')).toBeOnTheScreen();
  await fireEvent.changeText(screen.getByLabelText('Full name'), 'Musa Bello');
  await fireEvent.changeText(screen.getByLabelText('Email'), 'musa@example.com');
  await fireEvent.changeText(screen.getByLabelText('Phone'), '+2348091112222');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'walkies2026');
  await fireEvent.press(screen.getByText('Create account'));
  await typeCode();
  await fireEvent.press(screen.getByText('Verify email'));

  await fireEvent.changeText(await screen.findByLabelText('Area you walk in'), 'Agodi, Ibadan');
  await fireEvent.changeText(screen.getByLabelText('About you'), 'I have walked my family’s two Boerboels every day for years.');
  await fireEvent.press(screen.getByText('Finish and go online'));
  expect(await screen.findByText("You're online")).toBeOnTheScreen();

  // An owner books Musa (written straight into storage, as another phone would via the API).
  const [musa] = JSON.parse((await AsyncStorage.getItem('auth-users'))!);
  const booking = { id: 'b9', customerId: 'c1', walkerId: musa.id, dogName: 'Rex', date: '2026-01-01', time: '07:30', minutes: 30, price: 2500, status: 'requested' };
  await AsyncStorage.setItem('bookings', JSON.stringify([booking]));
  resetStoredStateCache();
  await open('/walk/b9');
  await fireEvent.press(await screen.findByText('Accept walk'));
  await fireEvent.press(await screen.findByText('Start walk'));
  await fireEvent.press(await screen.findByText('Finish walk'));
  await waitFor(async () => expect(JSON.parse((await AsyncStorage.getItem('bookings'))!)[0].status).toBe('done'));
});

it('logs in, and a wrong password shows an error', async () => {
  await AsyncStorage.setItem('onboarded', 'true');
  const u = await demoAuth.signUp({ name: 'Ada Bello', email: 'ada@example.com', phone: '08031234567', password: 'walkies2026', role: 'customer' });
  await demoAuth.verifyEmail(u.email, DEMO_CODE);
  await demoAuth.markProfileComplete(u.id);
  await open('/login');
  await fireEvent.changeText(await screen.findByLabelText('Email'), 'ada@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'nope12345');
  await fireEvent.press(screen.getByText('Log in'));
  expect(await screen.findByText('Email or password is incorrect.')).toBeOnTheScreen();
  await fireEvent.changeText(screen.getByLabelText('Password'), 'walkies2026');
  await fireEvent.press(screen.getByText('Log in'));
  expect(await screen.findByText(/walkers? near you/)).toBeOnTheScreen();
});

it('forgot password: code, new password, then log in with it', async () => {
  await AsyncStorage.setItem('onboarded', 'true');
  await demoAuth.signUp({ name: 'Ada Bello', email: 'ada@example.com', phone: '08031234567', password: 'walkies2026', role: 'customer' });
  await open('/forgot-password');
  await fireEvent.changeText(await screen.findByLabelText('Email'), 'ada@example.com');
  await fireEvent.press(screen.getByText('Send code'));
  await typeCode();
  await fireEvent.press(screen.getByText('Continue'));
  await fireEvent.changeText(await screen.findByLabelText('New password'), 'freshstart9');
  await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'freshstart9');
  await fireEvent.press(screen.getByText('Update password'));
  expect(await screen.findByText('Password updated')).toBeOnTheScreen();
  expect((await demoAuth.logIn('ada@example.com', 'freshstart9')).name).toBe('Ada Bello');
});
