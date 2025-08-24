const $ = (q)=>document.querySelector(q);
const $$ = (q)=>Array.from(document.querySelectorAll(q));

// Apply theme from config
document.addEventListener('DOMContentLoaded', () => {
  const b = document.documentElement.style;
  b.setProperty('--primary', STORE_CONFIG.BRAND.primary);
  b.setProperty('--accent',  STORE_CONFIG.BRAND.accent);
  b.setProperty('--bg',      STORE_CONFIG.BRAND.bg);
  b.setProperty('--text',    STORE_CONFIG.BRAND.text);
  b.setProperty('--faint',   STORE_CONFIG.BRAND.faint);
  $('#year').textContent = new Date().getFullYear();
  initShop();
});

async function initShop(){
  // Nav categories
  const cats = ["All","Mobiles","Electronics","Home Appliances","LPG"];
  const nav = $('#categoryNav');
  nav.innerHTML = cats.map(c=>`<button data-cat="${c}" class="${c==="All"?"active":""}">${c}</button>`).join('');
  nav.addEventListener('click', e=>{
    const b = e.target.closest('button'); if(!b) return;
    $$('#categoryNav button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    renderProducts(filterState.query, b.dataset.cat);
  });

  // Search
  $('#searchBtn').addEventListener('click', ()=>{
    filterState.query = $('#searchBox').value.trim();
    renderProducts(filterState.query, getActiveCat());
  });
  $('#searchBox').addEventListener('keydown', (e)=>{
    if(e.key==='Enter') $('#searchBtn').click();
  });

  // Cart drawer
  $('#cartBtn').addEventListener('click', Cart.open);
  $('#cartClose').addEventListener('click', Cart.close);
  $('#clearCart').addEventListener('click', ()=>{ Cart.clear(); renderCart(); });

  // WhatsApp CTA
  $('#ctaWhatsapp').addEventListener('click', (e)=>{
    e.preventDefault();
    const num = STORE_CONFIG.ADMIN_WHATSAPP_NUMBER || '';
    const text = encodeURIComponent("Hi, I have a question for Maa Mobile.");
    const link = num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(link, '_blank');
  });

  await loadProducts();
  renderProducts('', 'All');
  renderCart();
}

let ALL_PRODUCTS = [];
async function loadProducts(){
  const res = await fetch('products.json');
  ALL_PRODUCTS = await res.json();
}

const filterState = { query: '', category: 'All' };
function getActiveCat(){
  const btn = $('#categoryNav button.active'); return btn ? btn.dataset.cat : 'All';
}

function renderProducts(q = '', cat = 'All'){
  filterState.query = q; filterState.category = cat;
  const grid = $('#productGrid'); grid.innerHTML = '<div class="small">Loading…</div>';

  const qlc = q.toLowerCase();
  let list = ALL_PRODUCTS.filter(p => 
    (cat==='All' || p.category===cat) &&
    (!q || (p.name.toLowerCase().includes(qlc) || (p.brand||'').toLowerCase().includes(qlc)))
  );

  grid.innerHTML = list.map(p => Card(p)).join('');
  grid.addEventListener('click', (e)=>{
    const addBtn = e.target.closest('[data-add]');
    if(addBtn){ 
      const id = addBtn.dataset.add;
      const item = ALL_PRODUCTS.find(x=>x.id===id);
      Cart.add(item, 1);
      renderCart();
    }
  }, { once: true });
}

function Card(p){
  const discount = p.mrp > p.price ? `<span class="small" style="color:#0a7c0a;font-weight:700;">Save ₹${p.mrp - p.price}</span>` : '';
  return `
  <article class="card">
    <img src="${p.image}" alt="${p.name}"/>
    <div class="title">${p.name}</div>
    <div class="rating">★ ${p.rating.toFixed(1)}</div>
    <div class="price">
      <span class="sell">₹${p.price.toLocaleString()}</span>
      ${p.mrp>p.price ? `<span class="mrp">₹${p.mrp.toLocaleString()}</span>` : ''}
    </div>
    ${discount}
    <button class="btn primary" data-add="${p.id}">Add to cart</button>
  </article>`;
}

// ---- Cart UI wiring ----
function renderCart(){
  $('#cartCount').textContent = Cart.count();
  $('#cartItemsCount').textContent = Cart.count();
  $('#cartSubtotal').textContent = '₹' + Cart.subtotal().toLocaleString();
  $('#cartTotal').textContent    = '₹' + Cart.total().toLocaleString();

  const container = $('#cartItems');
  const items = Cart.items();
  container.innerHTML = items.length ? items.map(CartItemRow).join('') : '<div class="small">Your cart is empty.</div>';

  container.querySelectorAll('[data-inc]').forEach(b=> b.addEventListener('click', ()=>{ Cart.addId(b.dataset.inc, 1); renderCart(); }));
  container.querySelectorAll('[data-dec]').forEach(b=> b.addEventListener('click', ()=>{ Cart.addId(b.dataset.dec, -1); renderCart(); }));
  container.querySelectorAll('[data-del]').forEach(b=> b.addEventListener('click', ()=>{ Cart.removeId(b.dataset.del); renderCart(); }));
}
function CartItemRow(ci){
  return `
  <div class="cart-item">
    <img src="${ci.image}" alt="${ci.name}"/>
    <div>
      <div class="name">${ci.name}</div>
      <div class="small">₹${ci.price.toLocaleString()}</div>
      <div class="qty">
        <button data-dec="${ci.id}">−</button>
        <span>${ci.qty}</span>
        <button data-inc="${ci.id}">+</button>
        <button style="margin-left:auto" data-del="${ci.id}">Remove</button>
      </div>
    </div>
    <div><strong>₹${(ci.price * ci.qty).toLocaleString()}</strong></div>
  </div>`;
}