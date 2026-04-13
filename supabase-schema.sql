-- ============================================================
-- Matchbox Sports Ground — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      TEXT UNIQUE NOT NULL,
  sport           TEXT NOT NULL CHECK (sport IN ('cricket', 'football', 'badminton')),
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  duration_hours  NUMERIC(4,1) NOT NULL,
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked slots table (admin-managed)
CREATE TABLE IF NOT EXISTS blocked_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport       TEXT NOT NULL CHECK (sport IN ('cricket', 'football', 'badminton')),
  date        DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  reason      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bookings_sport_date   ON bookings (sport, date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id   ON bookings (booking_id);
CREATE INDEX IF NOT EXISTS idx_blocked_sport_date    ON blocked_slots (sport, date);

-- Row Level Security
ALTER TABLE bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- Public can INSERT bookings (booking form)
CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (true);

-- Public can SELECT confirmed bookings (availability check)
CREATE POLICY "Public can view confirmed bookings"
  ON bookings FOR SELECT
  TO anon
  USING (status = 'confirmed');

-- Public can SELECT blocked slots (availability check)
CREATE POLICY "Public can view blocked slots"
  ON blocked_slots FOR SELECT
  TO anon
  USING (true);

-- Service role has full access (used by server-side API routes)
-- (service role bypasses RLS by default — no extra policy needed)
