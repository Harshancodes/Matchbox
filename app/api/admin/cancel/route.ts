import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

// POST /api/admin/cancel
export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
