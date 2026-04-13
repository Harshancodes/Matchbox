import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

// POST /api/cancel  — public cancellation (booking_id + phone, 6hr cutoff)
export async function POST(req: NextRequest) {
  const { booking_id, phone } = await req.json();

  if (!booking_id || !phone) {
    return NextResponse.json({ error: 'Booking ID and phone are required.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Fetch the booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_id', booking_id.toUpperCase())
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found. Check your Booking ID.' }, { status: 404 });
  }

  // Verify phone matches
  if (booking.phone !== phone.trim()) {
    return NextResponse.json({ error: 'Phone number does not match this booking.' }, { status: 403 });
  }

  // Already cancelled
  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'This booking is already cancelled.' }, { status: 400 });
  }

  // 6-hour cutoff check
  const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
  const now = new Date();
  const diffMs = bookingDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 6) {
    return NextResponse.json({
      error: `Cancellations must be made at least 6 hours before the booking. Your slot starts at ${booking.start_time.slice(0, 5)} — it's too late to cancel online. Please call us directly.`,
    }, { status: 400 });
  }

  // Cancel it
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking.id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to cancel. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, booking_id: booking.booking_id });
}
