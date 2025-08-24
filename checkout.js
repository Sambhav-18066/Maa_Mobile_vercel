const $ = (q)=>document.querySelector(q);

document.addEventListener('DOMContentLoaded', () => {
  // Apply theme
  const b = document.documentElement.style;
  b.setProperty('--primary', STORE_CONFIG.BRAND.primary);
  b.setProperty('--accent',  STORE_CONFIG.BRAND.accent);
  b.setProperty('--bg',      STORE_CONFIG.BRAND.bg);
  b.setProperty('--text',    STORE_CONFIG.BRAND.text);
  b.setProperty('--faint',   STORE_CONFIG.BRAND.faint);

  renderSummary();
  const form = document.getElementById('checkoutForm');
  const upiBox = document.getElementById('upiBox');

  // Payment toggle
  form.addEventListener('change', e=>{
    if(e.target.name==='pay'){
      upiBox.classList.toggle('hidden', e.target.value!=='UPI');
      updateUpiLink();
    }
  });

  updateUpiLink();

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const pay = fd.get('pay');
    const orderId = 'MMA' + Math.floor(100000 + Math.random()*900000);
    const to = (fd.get('whatsapp') || STORE_CONFIG.ADMIN_WHATSAPP_NUMBER || '').replace(/[^0-9]/g,'');
    const details = buildOrderText(orderId, fd.get('name'), fd.get('phone'), fd.get('address'), pay);

    // Clear cart
    localStorage.removeItem('maa_cart_v1');

    // Build redirect
    const wa = to ? `https://wa.me/${to}?text=${encodeURIComponent(details)}` : `https://wa.me/?text=${encodeURIComponent(details)}`;
    location.href = `success.html?oid=${orderId}&wa=${encodeURIComponent(wa)}`;
  });
});

function renderSummary(){
  const box = document.getElementById('summaryItems');
  const items = JSON.parse(localStorage.getItem('maa_cart_v1') || '[]');
  box.innerHTML = items.length ? items.map(i => `
    <div class="cart-item">
      <img src="${i.image}" alt="${i.name}"/>
      <div><div class="name">${i.name}</div><div class="small">Qty: ${i.qty}</div></div>
      <div><strong>₹${(i.qty*i.price).toLocaleString()}</strong></div>
    </div>
  `).join('') : '<div class="small">Your cart is empty.</div>';

  const subtotal = items.reduce((s,i)=>s+i.qty*i.price,0);
  document.getElementById('sumCount').textContent = items.reduce((n,i)=>n+i.qty,0);
  document.getElementById('sumSubtotal').textContent = '₹'+subtotal.toLocaleString();
  document.getElementById('sumTotal').textContent = '₹'+subtotal.toLocaleString();
}

function buildOrderText(orderId, name, phone, address, pay){
  const items = JSON.parse(localStorage.getItem('maa_cart_v1') || '[]');
  const lines = [];
  lines.push(`Order ID: ${orderId}`);
  lines.push(`Name: ${name}`);
  lines.push(`Phone: ${phone}`);
  lines.push(`Address: ${address}`);
  lines.push(`Payment: ${pay}`);
  lines.push('');
  lines.push('Items:');
  for(const i of items){
    lines.push(`- ${i.name} x ${i.qty} = ₹${(i.qty*i.price).toLocaleString()}`);
  }
  const total = items.reduce((s,i)=>s+i.qty*i.price,0);
  lines.push('');
  lines.push(`Total: ₹${total.toLocaleString()}`);
  lines.push('');
  lines.push('— Sent from Maa Mobile store');
  return lines.join('\n');
}

function updateUpiLink(){
  const items = JSON.parse(localStorage.getItem('maa_cart_v1') || '[]');
  const total = items.reduce((s,i)=>s+i.qty*i.price,0);
  const upi = STORE_CONFIG.UPI_ID;
  const name = encodeURIComponent(STORE_CONFIG.UPI_NAME || 'Maa Mobile');
  const link = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${name}&am=${encodeURIComponent(String(total))}&cu=INR`;
  const a = document.getElementById('upiDeepLink'); a.href = link;
  document.getElementById('upiIdText').textContent = upi;
  document.getElementById('upiNameText').textContent = STORE_CONFIG.UPI_NAME || 'Maa Mobile';
}