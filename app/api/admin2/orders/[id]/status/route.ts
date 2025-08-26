// app/api/admin2/orders/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const next = String(body?.status ?? '').toLowerCase();
  const eta = body?.eta ? new Date(body.eta).toISOString() : null;

  if (!next) return NextResponse.json({ message: 'Missing status' }, { status: 400 });

  try {
    const { data, error } = await supabase.rpc('admin_update_order_status', {
      p_order_id: id,
      p_next: next,
      p_eta: eta
    });
    if (error) return NextResponse.json({ message: error.message }, { status: 422 });
    return NextResponse.json({ ok: true, order: data });
  } catch (e: any) {
    return NextResponse.json({ message: e.message ?? 'Internal error' }, { status: 500 });
  }
}
