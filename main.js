/* ============================================================
   Electrostore — main.js  (Complete v2 — all features)
   ============================================================ */

/* ── Price + Emoji maps ─────────────────────────────────── */
const PRICES = {
  'iPhone 16 Pro Max':389000,'iPhone 15 Plus':229000,
  'Galaxy S25 Ultra':329000,'Galaxy A55':89000,
  'Pixel 9 Pro XL':219000,'OnePlus 13':189000,
  'MacBook Pro M4':649000,'MacBook Air M3':349000,
  'ROG Zephyrus G16':489000,'Dell XPS 15':369000,
  'ThinkPad X1 Carbon':329000,'HP Omen 16':529000,
  'Sony WH-1000XM5':52000,'AirPods Pro 2':49000,
  'Apple Watch S10':79000,'Galaxy Watch 7':52000,
  'MX Master 3S':18500,'Keychron K8 Pro':14500,
  'Anker 140W Charger':8500,'Belkin 3-in-1 Charger':12000,
};
const EMOJIS = {
  'iPhone':'📱','Galaxy S':'📱','Galaxy A':'📱','Pixel':'📱','OnePlus':'📱',
  'MacBook':'💻','ROG':'💻','Dell XPS':'💻','ThinkPad':'💻','HP Omen':'💻',
  'Sony':'🎧','AirPods':'🎧','Apple Watch':'⌚','Galaxy Watch':'⌚',
  'MX Master':'🖱️','Keychron':'⌨️','Anker':'🔌','Belkin':'🔌',
};
function getEmoji(name){
  for(const[k,v] of Object.entries(EMOJIS)){if(name.startsWith(k)||name.includes(k)) return v;}
  return '📦';
}

/* ── Toast ──────────────────────────────────────────────── */
function showToast(msg, isWish=false){
  let c = document.querySelector('.toast-container');
  if(!c){c=document.createElement('div');c.className='toast-container';document.body.appendChild(c);}
  const t = document.createElement('div');
  t.className = 'toast-msg' + (isWish?' wish-toast':'');
  t.innerHTML = `<span class="ti">${isWish?'♥':'✓'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),350);},3000);
}

/* ── Cart Module ────────────────────────────────────────── */
const Cart = (()=>{
  let items = [];
  try{items=JSON.parse(localStorage.getItem('es_cart')||'[]');}catch(e){}

  function save(){
    try{localStorage.setItem('es_cart',JSON.stringify(items));}catch(e){}
    renderDrawer(); updateBadge();
  }
  function add(name){
    const price = PRICES[name]||0;
    const found = items.find(i=>i.name===name);
    if(found) found.qty++;
    else items.push({name,price,emoji:getEmoji(name),qty:1});
    save();
    showToast(`<strong>${name}</strong> added to cart 🛒`);
    openDrawer();
  }
  function remove(name){items=items.filter(i=>i.name!==name);save();}
  function changeQty(name,d){
    const it=items.find(i=>i.name===name);
    if(!it)return;
    it.qty=Math.max(1,it.qty+d);save();
  }
  function total(){return items.reduce((s,i)=>s+i.price*i.qty,0);}
  function count(){return items.reduce((s,i)=>s+i.qty,0);}
  function clear(){items=[];save();}
  function getAll(){return items;}
  return{add,remove,changeQty,total,count,clear,getAll};
})();

/* ── Wishlist Module ────────────────────────────────────── */
const Wish = (()=>{
  let set=new Set();
  try{set=new Set(JSON.parse(localStorage.getItem('es_wish')||'[]'));}catch(e){}
  function save(){try{localStorage.setItem('es_wish',JSON.stringify([...set]));}catch(e){}}
  function toggle(name,btn){
    if(set.has(name)){
      set.delete(name);
      btn&&btn.classList.remove('active');
      showToast(`Removed from wishlist`,true);
    }else{
      set.add(name);
      btn&&btn.classList.add('active');
      showToast(`<strong>${name}</strong> wishlisted ♥`,true);
    }
    save();
  }
  function has(n){return set.has(n);}
  return{toggle,has};
})();

/* ── Cart Drawer ────────────────────────────────────────── */
function renderDrawer(){
  const list=document.getElementById('cartItemsList');
  const total=document.getElementById('cartTotalAmt');
  if(!list)return;
  const items=Cart.getAll();
  if(!items.length){
    list.innerHTML=`<div class="cart-empty-msg">
      <span class="empty-icon">🛒</span>
      <p style="font-family:var(--font-head);font-size:.92rem;font-weight:700;color:var(--white)">Your cart is empty</p>
      <p style="font-size:.78rem;margin-top:4px">Add some awesome tech!</p>
    </div>`;
  }else{
    list.innerHTML=items.map(it=>`
      <div class="cart-item-row">
        <div class="cart-thumb">${it.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${it.name}</div>
          <div class="cart-item-price">Rs. ${it.price.toLocaleString()}</div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="Cart.changeQty('${it.name.replace(/'/g,"\\'")}', -1)">−</button>
            <span class="qty-value">${it.qty}</span>
            <button class="qty-btn" onclick="Cart.changeQty('${it.name.replace(/'/g,"\\'")}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-del" onclick="Cart.remove('${it.name.replace(/'/g,"\\'")}')">✕</button>
      </div>`).join('');
  }
  if(total) total.textContent=`Rs. ${Cart.total().toLocaleString()}`;
}

function updateBadge(){
  const n=Cart.count();
  document.querySelectorAll('.cart-badge').forEach(b=>{
    b.textContent=n;
    b.classList.toggle('show',n>0);
  });
}

function openDrawer(){
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeDrawer(){
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow='';
}

/* ── Global click delegation ────────────────────────────── */
document.addEventListener('click',e=>{
  // Add to cart
  const addBtn=e.target.closest('[data-action="add-cart"]');
  if(addBtn){Cart.add(addBtn.dataset.name);return;}

  // Wishlist
  const wishBtn=e.target.closest('[data-action="wishlist"]');
  if(wishBtn){Wish.toggle(wishBtn.dataset.name, wishBtn);return;}

  // Open cart
  if(e.target.closest('#cartOpenBtn')){openDrawer();return;}

  // Close cart
  if(e.target.closest('#cartCloseBtn')){closeDrawer();return;}
  if(e.target.id==='cartOverlay'){closeDrawer();return;}

  // Checkout
  if(e.target.id==='checkoutBtn'){
    if(!Cart.count()){showToast('Your cart is empty!');return;}
    const btn=e.target;
    btn.textContent='Processing...';btn.disabled=true;
    setTimeout(()=>{
      showToast('Order placed! Check your email for confirmation 🎉');
      Cart.clear();closeDrawer();
      btn.textContent='Proceed to Checkout';btn.disabled=false;
    },2000);
  }
});

/* ── Filter buttons ─────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    btn.closest('.filter-bar').querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const cat=btn.dataset.filter;
    document.querySelectorAll('[data-category]').forEach(card=>{
      const show=cat==='all'||card.dataset.category===cat;
      card.style.display=show?'':'none';
      if(show){card.style.animation='none';card.offsetHeight;card.style.animation='fadeInUp 0.4s ease forwards';}
    });
  });
});

/* ── Navbar scroll ──────────────────────────────────────── */
const navbar=document.querySelector('.navbar');
if(navbar) window.addEventListener('scroll',()=>navbar.classList.toggle('scrolled',window.scrollY>40));

/* ── Fade-up observer ───────────────────────────────────── */
const io=new IntersectionObserver((entries,obs)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
},{threshold:0.1});
document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));

/* ── Counter animation ──────────────────────────────────── */
function runCounter(el){
  const target=parseInt(el.dataset.counter||el.dataset.n)||0;
  const suffix=el.dataset.suffix||el.dataset.s||'';
  let v=0;const step=target/(1800/16);
  const t=setInterval(()=>{
    v+=step;if(v>=target){v=target;clearInterval(t);}
    el.textContent=Math.floor(v).toLocaleString()+suffix;
  },16);
}
const cio=new IntersectionObserver((entries,obs)=>{
  entries.forEach(e=>{if(e.isIntersecting){runCounter(e.target);obs.unobserve(e.target);}});
},{threshold:0.5});
document.querySelectorAll('[data-counter],[data-n]').forEach(el=>cio.observe(el));

/* ── Deal timer ─────────────────────────────────────────── */
(function(){
  const timer=document.getElementById('dealTimer');
  if(!timer)return;
  let secs=7*3600+42*60+33;
  const fmt=n=>String(n).padStart(2,'0');
  function tick(){
    const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60;
    const hEl=timer.querySelector('[data-t="h"]');
    const mEl=timer.querySelector('[data-t="m"]');
    const sEl=timer.querySelector('[data-t="s"]');
    if(hEl)hEl.textContent=fmt(h);
    if(mEl)mEl.textContent=fmt(m);
    if(sEl)sEl.textContent=fmt(s);
    if(secs>0)secs--;
  }
  tick();setInterval(tick,1000);
})();

/* ── Navbar search ──────────────────────────────────────── */
const searchInp=document.getElementById('navSearch');
if(searchInp){
  searchInp.addEventListener('input',()=>{
    const q=searchInp.value.toLowerCase().trim();
    document.querySelectorAll('[data-category]').forEach(card=>{
      card.style.display=(!q||card.textContent.toLowerCase().includes(q))?'':'none';
    });
  });
}

/* ── Login form ─────────────────────────────────────────── */
const loginForm=document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit',e=>{
    e.preventDefault();let ok=true;
    const email=document.getElementById('loginEmail');
    const pw=document.getElementById('loginPassword');
    const eMsg=document.getElementById('emailMsg');
    const pMsg=document.getElementById('pwMsg');
    eMsg.className='validation-msg';pMsg.className='validation-msg';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){eMsg.textContent='⚠ Enter a valid email.';eMsg.className='validation-msg error';ok=false;}
    if(pw.value.length<6){pMsg.textContent='⚠ Min. 6 characters required.';pMsg.className='validation-msg error';ok=false;}
    if(ok){
      const btn=loginForm.querySelector('[type=submit]');
      btn.textContent='Signing in...';btn.disabled=true;
      setTimeout(()=>{showToast('Login successful! Welcome back 👋');btn.textContent='Sign In';btn.disabled=false;loginForm.reset();},1500);
    }
  });
}

/* ── Contact form ───────────────────────────────────────── */
const contactForm=document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit',e=>{
    e.preventDefault();
    const btn=contactForm.querySelector('[type=submit]');
    btn.textContent='Sending...';btn.disabled=true;
    setTimeout(()=>{showToast("Message sent! We'll get back to you within 24 hours.");btn.textContent='Send Message';btn.disabled=false;contactForm.reset();},1500);
  });
}

/* ── Newsletter forms ───────────────────────────────────── */
document.querySelectorAll('.newsletter-form').forEach(f=>{
  f.addEventListener('submit',e=>{
    e.preventDefault();
    showToast('Subscribed! Welcome deal updates incoming 📧');
    f.reset();
  });
});

/* ── Wishlist init (restore state) ─────────────────────── */
document.querySelectorAll('[data-action="wishlist"]').forEach(btn=>{
  if(Wish.has(btn.dataset.name)) btn.classList.add('active');
});

/* ── Init ───────────────────────────────────────────────── */
renderDrawer();
updateBadge();
