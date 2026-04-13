import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { notifyTeam } from '@/lib/notify';
import { generateBookingId } from '@/lib/utils';
import { CourtType } from '@/lib/types';

// Courts that conflict with each other:
// - full conflicts with left_half and right_half (and vice versa)
// - left_half only conflicts with full and left_half
// - right_half only conflicts with full and right_half
// - pickleball courts (court_1..4) only conflict with themselves
function getConflictingCourts(courtType: CourtType): CourtType[] {
  if (courtType === 'full') return ['full', 'left_half', 'right_half'];
  if (courtType === 'left_half') return ['full', 'left_half'];
  if (courtType === 'right_half') return ['full', 'right_half'];
  return [courtType]; // pickleball courts only conflict with themselves
}

// GET /api/bookings?category=ground&location=vijaynagar&court=full&date=2026-04-15
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const location = searchParams.get('location');
  const court = searchParams.get('court') as CourtType | null;
  const date = searchParams.get('date');

  if (!category || !location || !court || !date) {
    return NextResponse.json({ error: 'category, location, court, and date required' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const conflicting = getConflictingCourts(court);

  const [bookingsRes, blockedRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('*')
      .eq('category', category)
      .eq('location', location)
      .eq('date', date)
      .eq('status', 'confirmed')
      .in('court_type', conflicting),
    supabase
      .from('blocked_slots')
      .select('*')
      .eq('category', category)
      .eq('location', location)
      .eq('date', date)
      .in('court_type', conflicting),
  ]);

  return NextResponse.json({
    bookings: bookingsRes.data ?? [],
    blockedSlots: blockedRes.data ?? [],
  });
}

// POST /api/bookings
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, location, court_type, date, start_time, end_time, duration_hours, name, phone } = body;

  if (!category || !location || !court_type || !date || !start_time || !end_time || !duration_hours || !name || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const conflicting = getConflictingCourts(court_type as CourtType);

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const newStart = toMins(start_time);
  const newEnd = toMins(end_time);

  // Check for time overlaps across all conflicting court types
  const [existingRes, blockedRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, start_time, end_time, court_type')
      .eq('category', category)
      .eq('location', location)
      .eq('date', date)
      .eq('status', 'confirmed')
      .in('court_type', conflicting),
    supabase
      .from('blocked_slots')
      .select('id, start_time, end_time, court_type')
      .eq('category', category)
      .eq('location', location)
      .eq('date', date)
      .in('court_type', conflicting),
  ]);

  const all = [...(existingRes.data ?? []), ...(blockedRes.data ?? [])];
  const conflict = all.some((s) => {
    const sStart = toMins(s.start_time);
    const sEnd = toMins(s.end_time);
    return newStart < sEnd && newEnd > sStart;
  });

  if (conflict) {
    return NextResponse.json({ error: 'This slot is already booked or blocked.' }, { status: 409 });
  }

  // Generate unique booking ID
  let booking_id = generateBookingId();
  for (let i = 0; i < 5; i++) {
    const check = await supabase.from('bookings').select('id').eq('booking_id', booking_id).maybeSingle();
    if (!check.data) break;
    booking_id = generateBookingId();
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({ category, location, court_type, date, start_time, end_time, duration_hours, name, phone, booking_id, status: 'confirmed' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  notifyTeam(data).catch(() => {});

  return NextResponse.json({ booking_id: data.booking_id }, { status: 201 });
}
