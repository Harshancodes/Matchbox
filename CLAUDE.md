@AGENTS.md

# Matchbox Ground Booking — Developer Reference

## What This Is
A public web app for a local sports ground (Matchbox) where anyone can book a ground slot
for Cricket, Football, or Badminton. No payments. No user accounts. Admin gets a WhatsApp
notification on every booking via CallMeBot (free).

---

## Stack
| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth (Admin only) | Supabase Auth |
| Notifications | CallMeBot WhatsApp API |
| Hosting | Vercel |

---

## Project Layout
```
matchbox-booking/
├── app/
│   ├── page.tsx                    # Home — sport selector
│   ├── book/page.tsx               # Booking flow (date → time → form)
│   ├── confirmation/page.tsx       # Booking confirmed screen
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   └── login/page.tsx          # Admin login
│   └── api/
│       ├── bookings/
│       │   ├── route.ts            # GET (availability) / POST (create booking)
│       │   └── [booking_id]/route.ts  # GET single booking by booking_id
│       └── admin/
│           ├── bookings/route.ts   # GET all bookings (admin)
│           ├── block/route.ts      # GET / POST blocked slots
│           └── cancel/route.ts     # POST cancel a booking
├── components/
│   ├── SportSelector.tsx           # Cricket / Football / Badminton cards
│   ├── DatePicker.tsx              # Horizontal scroll next-14-days picker
│   ├── TimeRangePicker.tsx         # Start time grid + duration buttons
│   ├── AvailabilityTimeline.tsx    # Visual 6AM–9:30PM bar with booked blocks
│   ├── BookingForm.tsx             # Name + phone with validation
│   └── BookingCard.tsx             # Card used in admin dashboard
├── lib/
│   ├── supabase.ts                 # Supabase client (lazy init) + service client
│   ├── notify.ts                   # WhatsApp notification via CallMeBot
│   ├── utils.ts                    # Time helpers, slot generators, date formatters
│   └── types.ts                    # Shared TypeScript types
└── supabase-schema.sql             # Run this in Supabase SQL Editor to set up DB
```

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=           # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # From Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=          # From Supabase project settings (keep secret)
CALLMEBOT_PHONE=91XXXXXXXXXX        # WhatsApp number with country code, no +
CALLMEBOT_APIKEY=                   # From CallMeBot registration
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

---

## Database Tables
### `bookings`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| booking_id | text | Short human-readable ID e.g. "A3F9" |
| sport | text | cricket / football / badminton |
| date | date | YYYY-MM-DD |
| start_time | time | HH:MM:SS |
| end_time | time | HH:MM:SS |
| duration_hours | numeric(4,1) | e.g. 1.5 |
| name | text | |
| phone | text | 10 digits |
| status | text | confirmed / cancelled |
| created_at | timestamptz | |

### `blocked_slots`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| sport | text | cricket / football / badminton |
| date | date | |
| start_time | time | |
| end_time | time | |
| reason | text | e.g. "Maintenance" |
| created_at | timestamptz | |

---

## Key Business Rules
- Ground hours: **6:00 AM – 9:30 PM** (no booking can end after 9:30 PM)
- Minimum duration: **1 hour**
- Duration increments: **30 minutes** (1h, 1.5h, 2h … 4h)
- Overlap is checked **server-side** in `POST /api/bookings` (client check is UI-only)
- Admin dashboard is protected by Supabase Auth (email + password)
- Cancellations set `status = 'cancelled'` — rows are never deleted

---

## Local Development
```bash
npm run dev        # http://localhost:3000
npm run build      # production build check
npx tsc --noEmit   # type check only
```

---

## Supabase Setup (one time)
1. Create free project at supabase.com
2. Run `supabase-schema.sql` in the SQL Editor
3. Create admin user: Authentication → Users → Add User
4. Copy URL + keys to `.env.local`

## CallMeBot Setup (one time)
1. Add `+34 644 81 07 57` to WhatsApp contacts
2. Send: `I allow callmebot to send me messages`
3. You'll receive your API key back on WhatsApp
4. Add to `.env.local`

## Deploy to Vercel
1. Push to GitHub
2. Import repo in vercel.com
3. Add all env vars in Vercel dashboard
4. Deploy — done

---

## Out of Scope (do not add)
- Payments
- User accounts for public users
- SMS notifications
- Multiple grounds
- Recurring bookings
- Mobile app
