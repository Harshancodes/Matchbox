# Matchbox Ground Booking

A free, public web app to book sports ground slots at Matchbox — Mysore.

Supports Cricket, Football, and Badminton. No payments. No login for users.
Admin gets instant WhatsApp notification on every booking.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the Supabase SQL Editor
3. Copy your keys into `.env.local` (see `.env.local` for the template)
4. Run `npm run dev`

## Deploy

Push to GitHub → connect repo on [vercel.com](https://vercel.com) → add env vars → done.

Built with Next.js 16, Tailwind CSS, Supabase, and CallMeBot WhatsApp API.
