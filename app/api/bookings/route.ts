import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { notifyTeam } from '@/lib/notify';
import { generateBookingId } from '@/lib/utils';

// GET /api/bookings?sport=cricket&date=2026-04-15
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get('sport');
  const date = searchParams.get('date');

  if (!sport || !date) {
    return NextResponse.json({ error: 'sport and date required' }, { status: 400 });
  }

  const supabase = getServiceClient();

  const [bookingsRes, blockedRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('*')
      .eq('sport', sport)
      .eq('date', date)
      .eq('status', 'confirmed'),
    supabase
      .from('blocked_slots')
      .select('*')
      .eq('sport', sport)
      .eq('date', date),
  ]);

  return NextResponse.json({
    bookings: bookingsRes.data ?? [],
    blockedSlots: blockedRes.data ?? [],
  });
}

// POST /api/bookings
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sport, date, start_time, end_time, duration_hours, name, phone } = body;

  if (!sport || !date || !start_time || !end_time || !duration_hours || !name || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Check for overlaps (confirmed bookings + blocked slots)
  const [existingRes, blockedRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, start_time, end_time')
      .eq('sport', sport)
      .eq('date', date)
      .eq('status', 'confirmed'),
    supabase
      .from('blocked_slots')
      .select('id, start_time, end_time')
      .eq('sport', sport)
      .eq('date', date),
  ]);

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const newStart = toMins(start_time);
  const newEnd = toMins(end_time);

  const all = [...(existingRes.data ?? []), ...(blockedRes.data ?? [])];
  const conflict = all.some((s) => {
    const sStart = toMins(s.start_time);
    const sEnd = toMins(s.end_time);
    return newStart < sEnd && newEnd > sStart;
  });

  if (conflict) {
    return NextResponse.json({ error: 'This time slot is already booked or blocked.' }, { status: 409 });
  }

  // Generate unique booking ID
  let booking_id = generateBookingId();
  // Ensure uniqueness (simple retry)
  for (let i = 0; i < 5; i++) {
    const check = await supabase.from('bookings').select('id').eq('booking_id', booking_id).maybeSingle();
    if (!check.data) break;
    booking_id = generateBookingId();
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({ sport, date, start_time, end_time, duration_hours, name, phone, booking_id, status: 'confirmed' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send WhatsApp notification (non-blocking)
  notifyTeam(data).catch(() => {});

  return NextResponse.json({ booking_id: data.booking_id }, { status: 201 });
}
