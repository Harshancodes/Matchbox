import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

// GET /api/admin/bookings?date=YYYY-MM-DD&sport=cricket
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const sport = searchParams.get('sport');

  const supabase = getServiceClient();
  let query = supabase.from('bookings').select('*').order('start_time', { ascending: true });

  if (date) query = query.eq('date', date);
  if (sport) query = query.eq('sport', sport);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data ?? [] });
}
