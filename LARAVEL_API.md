# DogWalk API contract (Laravel)

The app already speaks this API. Build the backend to match it, set `EXPO_PUBLIC_API_URL` (for example `https://api.dogwalk.ng/api`), rebuild, and the app leaves demo mode. No screen code changes.

- **Auth:** Laravel Sanctum personal access tokens. The app sends `Authorization: Bearer <token>` and stores the token in the device keychain (`expo-secure-store`).
- **Errors:** standard Laravel validation responses, `422 { "message": "...", "errors": { "email": ["..."] } }`. The app shows the first error next to the matching field (`name`, `email`, `phone`, `password`, `code`).
- **JSON:** snake_case. All requests send `Accept: application/json`.

## User object

```json
{
  "id": 12,
  "name": "Ada Bello",
  "email": "ada@example.com",
  "phone": "08031234567",
  "role": "customer",            // "customer" | "walker"
  "email_verified_at": null,     // ISO date once verified
  "profile_complete": false      // customer: has a dog; walker: profile submitted
}
```

## Auth endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | `name, email, phone, password, password_confirmation, role, device_name` | `201 { user, token }`, and emails a 6-digit code |
| POST | `/auth/login` | `email, password, device_name` | `{ user, token }` · `422` on wrong credentials (`errors.password`) |
| POST | `/auth/logout` | none (auth) | `204`, revokes the current token |
| POST | `/auth/email/code` | none (auth) | `204`, resends the verification code (throttle 1/30 s) |
| POST | `/auth/email/verify` | `code` (auth) | `{ user }` with `email_verified_at` set |
| POST | `/auth/password/forgot` | `email` | `204` **always**, even for unknown emails (don't leak accounts) |
| POST | `/auth/password/check-code` | `email, code` | `204` or `422 errors.code` |
| POST | `/auth/password/reset` | `email, code, password, password_confirmation` | `204`, and revoke all the user's tokens |
| GET | `/me` | none (auth) | `{ user }` |

Codes: 6 digits, hashed in the database, expire after 15 minutes, max 5 attempts.

Suggested rules: `phone` matches `^(?:\+?234|0)[789][01]\d{8}$`; `password` uses `Password::min(8)->letters()->numbers()`.

## Profiles and bookings (next)

| Method | Path | Notes |
|---|---|---|
| POST | `/dogs` | `name, breed, size (small/medium/large), age_years, notes` · sets `profile_complete` for customers |
| GET | `/dogs` | the customer's dogs |
| PUT | `/walker/profile` | `area, bio, price_per_30, sizes[], years_experience, available` · sets `profile_complete` |
| POST | `/walker/id-check` | multipart: `id_document`, `selfie` → `id_status: pending` (reviewed by admins) |
| GET | `/walkers?size=&q=` | public walker profiles: `user_id, name, area, bio, price_per_30, sizes, years_experience, id_status, available, rating, walks` |
| POST | `/bookings` | `walker_id, dog_id, date, time, minutes (30/60)` → `status: requested`; price computed on the server |
| GET | `/bookings` | the caller's bookings (as customer or walker) |
| POST | `/bookings/{id}/accept` · `/decline` · `/start` · `/finish` | walker only |
| POST | `/bookings/{id}/cancel` | customer only, while `requested` or `accepted` |
| PATCH | `/bookings/{id}` | `notes` (walker) |

Status rules (enforce them on the server too; the app's copy is in `src/data/store.ts`):

```
requested → accepted | declined (walker) | cancelled (customer)
accepted  → in-progress (walker) | cancelled (customer)
in-progress → done (walker)
```

Later: Paystack payment on `finish`, push notifications for new requests, live GPS during `in-progress`.
