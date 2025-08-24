const CART_KEY = 'maa_cart_v1';

const Cart = {
  open(){ document.getElementById('cartDrawer').classList.add('open'); },
  close(){ document.getElementById('cartDrawer').classList.remove('open'); },

  load(){ try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch(e){ return []; } },
  save(list){ localStorage.setItem(CART_KEY, JSON.stringify(list)); },

  items(){ return this.load(); },
  count(){ return this.load().reduce((n,i)=>n+i.qty,0); },
  subtotal(){ return this.load().reduce((s,i)=>s + i.price*i.qty,0); },
  shipping(){ return 0; },
  total(){ return this.subtotal() + this.shipping(); },

  add(product, qty=1){
    const list = this.load();
    const i = list.find(x=>x.id===product.id);
    if(i){ i.qty += qty; if(i.qty<1) i.qty=1; }
    else list.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty });
    this.save(list);
  },
  addId(id, d=1){
    const list = this.load();
    const i = list.find(x=>x.id===id);
    if(i){ i.qty += d; if(i.qty < 1) this.removeId(id); else this.save(list); }
  },
  removeId(id){
    const list = this.load().filter(x=>x.id!==id);
    this.save(list);
  },
  clear(){ this.save([]); }
};