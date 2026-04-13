import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

// GET /api/bookings/:booking_id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ booking_id: string }> }
) {
  const { booking_id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_id', booking_id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ booking: data });
}
