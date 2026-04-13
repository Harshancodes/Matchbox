-- ============================================================
-- Matchbox Sports Ground — Supabase Schema (v2)
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      TEXT UNIQUE NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('ground', 'pickleball')),
  location        TEXT NOT NULL CHECK (location IN ('vijaynagar', 'hebbal')),
  court_type      TEXT NOT NULL CHECK (court_type IN ('full', 'left_half', 'right_half', 'court_1', 'court_2', 'court_3', 'court_4')),
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
  category    TEXT NOT NULL CHECK (category IN ('ground', 'pickleball')),
  location    TEXT NOT NULL CHECK (location IN ('vijaynagar', 'hebbal')),
  court_type  TEXT NOT NULL CHECK (court_type IN ('full', 'left_half', 'right_half', 'court_1', 'court_2', 'court_3', 'court_4')),
  date        DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  reason      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_cat_loc_date   ON bookings (category, location, date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id     ON bookings (booking_id);
CREATE INDEX IF NOT EXISTS idx_blocked_cat_loc_date    ON blocked_slots (category, location, date);

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
