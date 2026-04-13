import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

// GET /api/admin/block?date=YYYY-MM-DD&sport=cricket
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const sport = searchParams.get('sport');

  const supabase = getServiceClient();
  let query = supabase.from('blocked_slots').select('*').order('start_time', { ascending: true });

  if (date) query = query.eq('date', date);
  if (sport) query = query.eq('sport', sport);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blockedSlots: data ?? [] });
}

// POST /api/admin/block
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sport, date, start_time, end_time, reason } = body;

  if (!sport || !date || !start_time || !end_time || !reason) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('blocked_slots')
    .insert({ sport, date, start_time, end_time, reason });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
