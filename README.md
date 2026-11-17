# DogWalk

> Book a trusted walker for your dog.

## What's built

- Walker list and profiles (**sample data** in `src/data/walkers.ts`)
- Booking flow (dog, date, time, 30/60 min, price in ₦)
- Walk screen: start/end, live timer with progress bar, walk notes

## Next

- Supabase backend (walkers, bookings, reviews), Paystack payments, live GPS route with expo-location + maps, push notifications

## Run it

```bash
npm install          # already done once after scaffolding
npx expo start       # then press i (iOS), a (Android) or w (web)
npm run typecheck
npx expo lint
```

Built on **Expo SDK 58** (React Native 0.88, React 19.3), Expo Router, TypeScript.
Everything is stored on-device with AsyncStorage (`src/lib/storage.ts`); there is no backend yet.

## Structure

- `src/app/` — screens (Expo Router; every file is a route)
- `src/brand.ts` — app name, brand colours, screen titles
- `src/theme.ts` — light/dark design tokens
- `src/components/ui.tsx` — shared UI primitives
