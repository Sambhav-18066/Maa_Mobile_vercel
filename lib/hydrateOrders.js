// lib/hydrateOrders.js
// Turn a raw row (with joins) into the flattened shape the admin wants.
export function hydrateRow(o) {
  const items = Array.isArray(o.items) ? o.items : [];
  const computed_total_paise = items.reduce((s, it) => s + (Number(it.price_paise) || 0) * (Number(it.qty) || 0), 0);
  const item_count = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);

  const addr = o.address || {};
  const cityStatePin = [addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
  const addressText = [addr.line1, cityStatePin].filter(Boolean).join(" — ");

  const total_rupees = Number.isFinite(o.total_paise) ? o.total_paise / 100 : null;
  const computed_total_rupees = computed_total_paise / 100;

  return {
    // original order columns
    id: o.id, created_at: o.created_at, status: o.status,
    status_timestamps: o.status_timestamps, user_id: o.user_id, address_id: o.address_id,
    payment_status: o.payment_status, subtotal_paise: o.subtotal_paise,
    discount_paise: o.discount_paise, shipping_paise: o.shipping_paise,
    total_paise: o.total_paise, notes: o.notes, updated_at: o.updated_at,

    // safe scalar extras
    name: addr.name || "", phone: addr.phone || "", address: addressText || "",
    item_count, total_rupees, computed_total_rupees
  };
}
