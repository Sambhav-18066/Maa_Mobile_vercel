// app/api/admin2/orders/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, created_at, customer_name, phone, address, status, payment_status, total_amount, eta, items')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;

    const { data: totals, error: terr } = await supabase.from('order_totals').select('*');
    if (terr) throw terr;
    const totalMap = new Map(totals?.map(t => [t.id, t.computed_total]) ?? []);

    const ids = orders?.map(o => o.id) ?? [];
    let itemsByOrder = new Map<string, any[]>();
    if (ids.length) {
      const { data: lines } = await supabase
        .from('order_items')
        .select('order_id, product_name, quantity, unit_price, line_total')
        .in('order_id', ids);

      if (lines) {
        for (const row of lines) {
          const arr = itemsByOrder.get(row.order_id) ?? [];
          arr.push(row);
          itemsByOrder.set(row.order_id, arr);
        }
      }
    }

    const result = (orders ?? []).map(o => ({
      ...o,
      total_amount: Number(o.total_amount ?? totalMap.get(o.id) ?? 0).toFixed(2),
      line_items: itemsByOrder.get(o.id) ?? (Array.isArray(o.items) ? o.items : [])
    }));

    return NextResponse.json({ ok: true, orders: result });
  } catch (e: any) {
    return NextResponse.json({ message: e.message ?? 'Internal error' }, { status: 500 });
  }
}
