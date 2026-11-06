(() => {
'use strict';
const PAGE_KEY = document.body.dataset.page || 'home';
const WA = '254790835039', TEL = '+254790835039', PHONE = '+254 790 835039';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=Jamia+Shopping+Mall+Nairobi+CBD';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const kes = n => 'KSh ' + Number(n).toLocaleString('en-KE');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const waLink = t => 'https://wa.me/' + WA + (t ? '?text=' + encodeURIComponent(t) : '');
const store = {
  get(k, d) { try { const v = localStorage.getItem('dai_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('dai_' + k, JSON.stringify(v)); } catch (e) {} }
};
const icon = (n, c = '') => `<span class="material-symbols-outlined ${c}">${n}</span>`;

/* ---------- Product data ---------- */
const POP = {'tecno-camon-30-pro-5g':95,'infinix-note-40-pro':94,'apple-iphone-15-pro-max':92,'samsung-galaxy-s24-ultra':90,'tecno-spark-20-pro':96,'infinix-hot-40-pro':91,'xiaomi-redmi-13c':93,'samsung-galaxy-a15':89};
const EXTRA = [];
let products = [];
const byId = id => products.find(p => p.id === id);
const pct = p => p.old > p.price ? Math.round((p.old - p.price) / p.old * 100) : 0;

function phoneArt(p) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${p.color}'/><stop offset='1' stop-color='#10213D'/></linearGradient></defs><rect x='60' y='12' width='80' height='176' rx='15' fill='#0b1c30'/><rect x='65' y='18' width='70' height='164' rx='11' fill='url(#g)'/><circle cx='100' cy='26' r='2.6' fill='#0b1c30'/><text x='100' y='104' font-family='Arial' font-size='10' font-weight='700' fill='white' text-anchor='middle'>${p.brand.toUpperCase()}</text><text x='100' y='120' font-family='Arial' font-size='8' fill='white' fill-opacity='.85' text-anchor='middle'>${p.short}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function cardHTML(p) {
  const d = pct(p);
  return `<div class="relative w-full">
<div class="flex items-center justify-between absolute top-0 inset-x-0 z-10">
<span class="px-2 py-0.5 rounded ${d ? 'bg-tertiary-container' : 'bg-mpesa-green'} text-white font-bold text-[10px] tracking-wide">${d ? d + '% OFF' : 'NEW'}</span>
<button aria-label="Add to Wishlist" class="wishlist-btn p-1.5 rounded-full bg-surface-canvas/90 text-secondary hover:text-danger active:scale-90 transition-transform shadow-sm" type="button"><span class="material-symbols-outlined text-lg">favorite</span></button>
</div>
<div class="aspect-square w-full flex items-center justify-center p-3 mt-3 bg-surface-subtle rounded-lg overflow-hidden cursor-pointer"><img alt="${esc(p.name)}" class="object-contain h-full w-full" loading="lazy" decoding="async" src="${p.img}"/></div>
</div>
<div class="mt-3 flex flex-col flex-1 justify-between">
<div>
<div class="flex items-center gap-1.5 mb-1"><span class="text-[10px] uppercase font-bold text-primary tracking-wider">${esc(p.brand)}</span><span class="text-[10px] text-mpesa-green font-semibold flex items-center gap-0.5"><span class="w-1.5 h-1.5 rounded-full bg-mpesa-green"></span> In Stock</span></div>
<h3 class="text-label-md sm:text-headline-sm font-headline-sm text-price-primary line-clamp-2 leading-tight cursor-pointer hover:text-primary transition-colors">${esc(p.name)}</h3>
<p class="text-body-sm font-body-sm text-secondary mt-0.5 text-xs">${esc(p.spec)}</p>
</div>
<div class="mt-3 pt-2 border-t border-surface-border">
${p.old ? `<div class="text-[11px] line-through text-price-strikethrough">${kes(p.old)}</div>` : ''}
<div class="text-headline-sm sm:text-price-display font-price-display text-price-primary leading-tight">${kes(p.price)}</div>
<div class="text-[10px] text-mpesa-green font-medium mt-0.5">Brand sealed · Warranty included</div>
<div class="mt-3 flex items-center gap-1.5">
<button class="add-cart-btn flex-1 h-9 bg-primary-container text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 hover:bg-primary active:scale-95 transition-all" type="button"><span class="material-symbols-outlined text-[16px]">add_shopping_cart</span><span class="hidden sm:inline">Add to Cart</span><span class="sm:hidden">Buy</span></button>
<a class="h-9 w-9 bg-surface-subtle text-mpesa-green border border-surface-border rounded-lg flex items-center justify-center hover:bg-mpesa-green hover:text-white transition-colors" href="#" rel="noopener" target="_blank" title="Order via WhatsApp"><span class="material-symbols-outlined text-[18px]">chat</span></a>
</div></div></div>`;
}

function readProducts() {
  $$('#productGrid .product-card').forEach((el, i) => {
    const name = $('h3', el).textContent.trim();
    const p = {
      id: slug(name), name,
      brand: $('.tracking-wider', el).textContent.trim(),
      spec: $('p.text-xs', el).textContent.trim(),
      price: +el.dataset.price,
      old: parseInt(($('.line-through', el) || {textContent: ''}).textContent.replace(/\D/g, '')) || 0,
      cat: el.dataset.category, img: $('img', el).src, rank: i, el
    };
    el.dataset.id = p.id;
    $('h3', el).classList.add('cursor-pointer');
    $('.aspect-square', el).classList.add('cursor-pointer');
    products.push(p);
  });
  const grid = $('#productGrid');
  const extras = EXTRA.concat((window.DAI_CATALOG || []).filter(c => !c.inDom && !EXTRA.some(e => slug(e.name) === c.id)));
  extras.forEach((x, i) => {
    const p = Object.assign({}, x, {id: x.id || slug(x.name), rank: 100 + i});
    p.img = x.img || phoneArt(p);
    const el = document.createElement('article');
    el.className = 'product-card bg-surface-canvas border border-surface-border rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-md hover:border-primary-container/40 transition-all duration-200 group relative';
    el.dataset.id = p.id; el.dataset.price = p.price; el.dataset.category = p.cat;
    el.innerHTML = cardHTML(p);
    el.style.display = 'none';
    grid.appendChild(el);
    p.el = el;
    products.push(p);
  });
  products.forEach(p => {
    p.pop = POP[p.id] || 80;
    const a = $('a[href^="https://wa.me"], a[title="Order via WhatsApp"]', p.el);
    if (a) { a.href = waLink(`Hello Daisolve, I am interested in the ${p.name} (${kes(p.price)}). Is it available?`); a.target = '_blank'; }
  });
}


function loadStaticProducts() {
  (window.DAI_CATALOG || []).forEach((c, i) => {
    const p = Object.assign({}, c, {rank: i});
    p.img = c.img || phoneArt(p);
    p.pop = POP[p.id] || Math.round((c.rating || 4) * (c.reviews || 10) / 5);
    products.push(p);
  });
}

/* ---------- State ---------- */
let cart = store.get('cart', {});
let wish = store.get('wish', []);
let orders = store.get('orders', []);
let session = store.get('session', null);
const state = {cat: 'all', brands: [], q: '', sort: 'newest', shown: 8};
const PAGE = 4;

function saveCart() { store.set('cart', cart); updateBadges(); renderCart(); }
function saveWish() { store.set('wish', wish); updateBadges(); syncHearts(); renderWish(); }
function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function cartTotal() { return Object.entries(cart).reduce((t, [id, q]) => t + (byId(id) ? byId(id).price * q : 0), 0); }

function updateBadges() {
  const c = cartCount(), w = wish.length;
  [['#cartCountBadge', c], ['#wishlistCountBadge', w], ['#mobileWishlistBadge', w]].forEach(([s, n]) => {
    const el = $(s); if (!el) return;
    el.textContent = n; el.style.display = n ? 'flex' : 'none';
  });
  const cartBtn = $('#cartDrawerCount'); if (cartBtn) cartBtn.textContent = c;
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, actLabel, actFn) {
  const t = $('#toast'); if (!t) return;
  t.innerHTML = `<span>${esc(msg)}</span>` + (actLabel ? `<button class="ml-3 font-bold text-mpesa-green underline" type="button" id="toastAct">${esc(actLabel)}</button>` : '');
  t.classList.remove('hidden');
  if (actLabel) $('#toastAct').onclick = () => { t.classList.add('hidden'); actFn(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}

/* ---------- Overlay / drawers / modal ---------- */
function lockScroll(on) { document.body.style.overflow = on ? 'hidden' : ''; }
function closeDrawers() {
  ['#cartDrawer', '#wishDrawer'].forEach(s => $(s).classList.add('translate-x-full'));
  $('#ovl').classList.add('hidden');
  if ($('#modalRoot').classList.contains('hidden')) lockScroll(false);
}
function openDrawerEl(sel) {
  closeModal(true);
  $('#ovl').classList.remove('hidden');
  $(sel).classList.remove('translate-x-full');
  lockScroll(true);
}
function openCart() { renderCart(); openDrawerEl('#cartDrawer'); }
function openWish() { renderWish(); openDrawerEl('#wishDrawer'); }
function openModal(html, wide) {
  closeDrawers();
  const prev = $('#modalBox'), box = prev.cloneNode(false);
  prev.replaceWith(box);
  box.className = 'relative bg-white w-full ' + (wide ? 'sm:max-w-3xl' : 'sm:max-w-lg') + ' rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl outline-none';
  box.innerHTML = `<button aria-label="Close" class="absolute top-3 right-3 p-1.5 rounded-full text-secondary hover:bg-surface-subtle z-10" data-close-modal type="button">${icon('close')}</button>` + html;
  const root = $('#modalRoot');
  root.classList.remove('hidden'); root.classList.add('flex');
  box.scrollTop = 0; box.setAttribute('tabindex', '-1'); box.focus();
  lockScroll(true);
  return box;
}
function closeModal(silent) {
  afterAuth = null; afterAuthInfo = null;
  const root = $('#modalRoot');
  root.classList.add('hidden'); root.classList.remove('flex');
  if (!silent && $('#ovl').classList.contains('hidden')) lockScroll(false);
}

/* ---------- Scrolling / navigation ---------- */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el && el.offsetParent !== null) { el.scrollIntoView({behavior: 'smooth', block: 'start'}); return; }
  location.href = id === 'catalogue' ? '/shop' : id === 'brands' ? '/brands' : '/home#' + id;
}
function catalogueVisible() { const c = document.getElementById('catalogue'); return !!(c && c.offsetParent !== null); }
function closeNavDrawer() { $('#navDrawer').classList.add('-translate-x-full'); $('#drawerOverlay').classList.add('hidden'); }
function setBottomNav() {
  const tab = PAGE_KEY === 'product' ? 'shop' : PAGE_KEY;
  $$('.nav-item').forEach(n => {
    const on = n.dataset.tab === tab;
    n.className = 'nav-item ' + (n.dataset.tab === 'wishlist' ? 'relative ' : '') + 'flex flex-col items-center justify-center transition-transform active:scale-95 ' + (on ? 'text-primary font-bold' : 'text-secondary hover:text-primary');
    const i = $('.material-symbols-outlined', n);
    if (on) i.setAttribute('style', "font-variation-settings: 'FILL' 1;"); else i.removeAttribute('style');
  });
}
function goTop() { if (PAGE_KEY !== 'home') { location.href = '/home'; return; } window.scrollTo({top: 0, behavior: 'smooth'}); setBottomNav('home'); }

/* ---------- Catalogue: filter / sort / render ---------- */
function matches(p) {
  if (state.cat === 'flagship' && !p.cat.includes('flagship')) return false;
  if (state.cat === 'midrange' && !p.cat.includes('midrange')) return false;
  if (state.cat === '5g' && !p.cat.includes('5g')) return false;
  if (state.cat === 'under20k' && p.price > 20000) return false;
  if (state.brands.length && !state.brands.includes(p.brand.toLowerCase())) return false;
  if (state.q) {
    const hay = (p.name + ' ' + p.brand + ' ' + p.spec).toLowerCase();
    if (!state.q.toLowerCase().split(/\s+/).every(w => hay.includes(w))) return false;
  }
  return true;
}
function render() {
  const grid = $('#productGrid');
  if (!grid) return;
  const on = state.cat !== 'all' || state.brands.length || state.q;
  let list = products.filter(matches);
  const sorters = {
    'newest': (a, b) => a.rank - b.rank,
    'popular': (a, b) => b.pop - a.pop,
    'low-high': (a, b) => a.price - b.price,
    'high-low': (a, b) => b.price - a.price,
    'discount': (a, b) => pct(b) - pct(a)
  };
  list.sort(sorters[state.sort] || sorters.newest);
  const limit = on ? list.length : Math.min(state.shown, list.length);
  const vis = new Set(list.slice(0, limit).map(p => p.id));
  list.forEach(p => grid.appendChild(p.el));
  products.filter(p => !list.includes(p)).forEach(p => grid.appendChild(p.el));
  products.forEach(p => { p.el.style.display = vis.has(p.id) ? '' : 'none'; });

  // tabs
  $$('.filter-tab').forEach(t => {
    const active = t.dataset.category === state.cat;
    t.className = 'filter-tab px-4 py-2 rounded-lg text-label-md font-label-md font-semibold transition-all whitespace-nowrap ' + (active ? 'bg-primary-container text-white shadow-sm' : 'bg-surface-canvas border border-surface-border text-on-surface-variant hover:border-primary');
    if (t.dataset.category === 'all') t.textContent = `All Phones (${products.length})`;
  });
  // brand chips
  $$('.brand-chip').forEach(c => {
    const b = c.dataset.brand, active = state.brands.includes(b);
    const n = products.filter(p => p.brand.toLowerCase() === b).length;
    c.className = 'brand-chip flex-shrink-0 min-w-[130px] p-3.5 rounded-xl flex flex-col items-center justify-center gap-2 hover:shadow-sm transition-all group ' + (active ? 'bg-surface-subtle border-2 border-primary-container shadow-sm' : 'bg-surface-canvas border border-surface-border hover:border-primary-container');
    const box = c.children[0], label = c.children[1], count = c.children[2];
    box.className = 'w-12 h-12 rounded-lg flex items-center justify-center transition-colors ' + (active ? 'bg-primary-container text-white' : 'bg-surface-subtle text-price-primary group-hover:bg-primary-container group-hover:text-white');
    label.className = 'text-label-md font-label-md font-bold ' + (active ? 'text-primary' : 'text-price-primary');
    count.className = 'text-[11px] ' + (active ? 'text-primary font-semibold' : 'text-secondary');
    count.textContent = `${n} ${n === 1 ? 'Model' : 'Models'}`;
  });
  // counts + progress + load more
  const box = $('#loadMoreBtn').parentElement;
  const nums = $$('.font-bold', $('div', box));
  if (nums.length >= 2) { nums[0].textContent = vis.size; nums[1].textContent = list.length; }
  const bar = $('.h-2.rounded-full.bg-primary-container', box);
  if (bar) { bar.className = 'bg-primary-container h-2 rounded-full transition-all duration-300'; bar.style.width = (list.length ? vis.size / list.length * 100 : 0) + '%'; }
  const more = !on && state.shown < list.length;
  $('#loadMoreBtn').style.display = more ? '' : 'none';
  const a = $('#viewAllLink'); if (a) $('span', a).textContent = `View All ${products.length} Phones`;
  $('#emptyState').classList.toggle('hidden', list.length > 0);
  // active filter bar
  const bar2 = $('#filterBar'), chips = [];
  if (state.q) chips.push(`Search: “${esc(state.q)}”`);
  state.brands.forEach(b => chips.push('Brand: ' + esc(b.charAt(0).toUpperCase() + b.slice(1))));
  bar2.classList.toggle('hidden', !chips.length);
  bar2.innerHTML = chips.length ? `<span class="text-body-sm text-secondary">${list.length} ${list.length === 1 ? 'phone' : 'phones'} found</span>` + chips.map(c => `<span class="px-2.5 py-1 bg-surface-container text-primary text-xs font-semibold rounded-full">${c}</span>`).join('') + `<button class="text-xs font-bold text-primary underline" data-clear-filters type="button">Clear all</button>` : '';
  syncHearts();
}
function setFilters(o, scroll = true) {
  Object.assign(state, o);
  if (!catalogueVisible()) {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.brands.length) p.set('brand', state.brands.join(','));
    if (state.cat !== 'all') p.set('cat', state.cat);
    if (state.sort !== 'newest') p.set('sort', state.sort);
    location.href = '/shop' + (p.toString() ? '?' + p : '');
    return;
  }
  render();
  if (scroll) scrollToId('catalogue');
}
function clearFilters() {
  state.cat = 'all'; state.brands = []; state.q = ''; state.sort = 'newest'; state.shown = 8;
  setSortUI('newest');
}
function setSortUI(v) { const s = $('#sortSelect'); if (s) s.value = v; }
function syncHearts() {
  syncProductHeart();
  products.forEach(p => {
    if (!p.el) return;
    const btn = $('.wishlist-btn', p.el), i = btn && $('.material-symbols-outlined', btn);
    if (!btn) return;
    const on = wish.includes(p.id);
    if (on) i.setAttribute('style', "font-variation-settings: 'FILL' 1;"); else i.removeAttribute('style');
    btn.classList.toggle('text-danger', on); btn.classList.toggle('text-secondary', !on);
  });
}

/* ---------- Cart & wishlist actions ---------- */
function addToCart(id, qty = 1, quiet) {
  const p = byId(id); if (!p) return;
  cart[id] = Math.min(10, (cart[id] || 0) + qty);
  saveCart();
  const b = $('#cartCountBadge'); b.classList.add('scale-125'); setTimeout(() => b.classList.remove('scale-125'), 200);
  if (!quiet) toast(`${p.name} added to cart`, 'View cart', openCart);
}
function toggleWish(id) {
  const p = byId(id); if (!p) return;
  const i = wish.indexOf(id);
  if (i > -1) { wish.splice(i, 1); toast('Removed from wishlist'); }
  else { wish.push(id); toast(`${p.name} saved to wishlist`, 'View', openWish); }
  saveWish();
}
function cartRow(p, q) {
  return `<div class="flex gap-3 py-3 border-b border-surface-border" data-row="${p.id}">
<img alt="" class="w-16 h-16 object-contain bg-surface-subtle rounded-lg p-1" src="${p.img}"/>
<div class="flex-1 min-w-0">
<p class="text-label-md font-label-md text-price-primary leading-tight">${esc(p.name)}</p>
<p class="text-xs text-secondary">${esc(p.spec)}</p>
<div class="mt-2 flex items-center justify-between">
<div class="flex items-center border border-surface-border rounded-lg">
<button aria-label="Decrease quantity" class="w-8 h-8 flex items-center justify-center hover:bg-surface-subtle" data-cart-act="dec" data-id="${p.id}" type="button">${icon('remove', 'text-base')}</button>
<span class="w-8 text-center text-label-md font-bold">${q}</span>
<button aria-label="Increase quantity" class="w-8 h-8 flex items-center justify-center hover:bg-surface-subtle" data-cart-act="inc" data-id="${p.id}" type="button">${icon('add', 'text-base')}</button>
</div>
<span class="text-label-md font-bold text-price-primary">${kes(p.price * q)}</span>
</div></div>
<button aria-label="Remove" class="self-start p-1 text-secondary hover:text-danger" data-cart-act="del" data-id="${p.id}" type="button">${icon('delete', 'text-lg')}</button>
</div>`;
}
function renderCart() {
  const body = $('#cartBody'), foot = $('#cartFoot');
  const items = Object.entries(cart).map(([id, q]) => ({p: byId(id), q})).filter(x => x.p);
  if (!items.length) {
    body.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-center p-8">${icon('shopping_bag', 'text-6xl text-outline-variant')}<p class="mt-3 text-headline-sm font-headline-sm text-price-primary">Your cart is empty</p><p class="text-body-sm text-secondary mt-1">Pick a phone and it will show up here.</p><button class="mt-4 h-10 px-5 bg-primary-container text-white rounded-lg text-label-md font-bold" data-act="shop" type="button">Browse phones</button></div>`;
    foot.classList.add('hidden'); return;
  }
  body.innerHTML = `<div class="px-4">${items.map(x => cartRow(x.p, x.q)).join('')}<button class="mt-3 text-xs text-secondary underline" data-cart-act="clear" type="button">Clear cart</button></div>`;
  foot.classList.remove('hidden');
  $('#cartSubtotal').textContent = kes(cartTotal());
}
function renderWishPage(items) {
  const wp = $('#wishPage'); if (!wp) return;
  if (!items.length) {
    wp.innerHTML = `<div class="flex flex-col items-center justify-center text-center py-16">${icon('favorite', 'text-6xl text-outline-variant')}<p class="mt-3 text-headline-sm font-headline-sm text-price-primary">No saved phones yet</p><p class="text-body-sm text-secondary mt-1">Tap the heart on any phone to save it here.</p><a class="mt-4 h-10 px-5 bg-primary-container text-white rounded-lg text-label-md font-bold flex items-center" href="/shop">Browse phones</a></div>`;
    return;
  }
  wp.innerHTML = `<p class="text-body-sm text-secondary mb-4">${items.length} saved ${items.length === 1 ? 'phone' : 'phones'}</p><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">${items.map(p => `<article class="bg-surface-canvas border border-surface-border rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all">
<div class="aspect-square w-full flex items-center justify-center p-3 bg-surface-subtle rounded-lg cursor-pointer" data-qv="${p.id}"><img alt="${esc(p.name)}" class="object-contain h-full w-full" loading="lazy" decoding="async" src="${p.img}"/></div>
<div class="mt-3"><span class="text-[10px] uppercase font-bold text-primary tracking-wider">${esc(p.brand)}</span>
<h3 class="text-label-md sm:text-headline-sm font-headline-sm text-price-primary leading-tight cursor-pointer" data-qv="${p.id}">${esc(p.name)}</h3>
<p class="text-xs text-secondary mt-0.5">${esc(p.spec)}</p>
${p.old ? `<div class="mt-2 text-[11px] line-through text-price-strikethrough">${kes(p.old)}</div>` : '<div class="mt-2"></div>'}
<div class="text-headline-sm font-price-display text-price-primary">${kes(p.price)}</div></div>
<div class="mt-3 flex items-center gap-1.5"><button class="flex-1 h-9 bg-primary-container text-white rounded-lg text-label-md font-bold hover:bg-primary active:scale-95 transition" data-wish-act="cart" data-id="${p.id}" type="button">Add to cart</button><button aria-label="Remove from wishlist" class="h-9 w-9 border border-surface-border rounded-lg flex items-center justify-center text-secondary hover:text-danger" data-wish-act="del" data-id="${p.id}" type="button">${icon('delete', 'text-lg')}</button></div>
</article>`).join('')}</div>`;
}
function renderWish() {
  const body = $('#wishBody');
  const items = wish.map(byId).filter(Boolean);
  renderWishPage(items);
  if (!items.length) {
    body.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-center p-8">${icon('favorite', 'text-6xl text-outline-variant')}<p class="mt-3 text-headline-sm font-headline-sm text-price-primary">No saved phones yet</p><p class="text-body-sm text-secondary mt-1">Tap the heart on any phone to save it here.</p><button class="mt-4 h-10 px-5 bg-primary-container text-white rounded-lg text-label-md font-bold" data-act="shop" type="button">Browse phones</button></div>`;
    return;
  }
  body.innerHTML = `<div class="px-4">${items.map(p => `<div class="flex gap-3 py-3 border-b border-surface-border">
<img alt="" class="w-16 h-16 object-contain bg-surface-subtle rounded-lg p-1 cursor-pointer" data-qv="${p.id}" src="${p.img}"/>
<div class="flex-1 min-w-0"><p class="text-label-md font-label-md text-price-primary leading-tight cursor-pointer" data-qv="${p.id}">${esc(p.name)}</p><p class="text-xs text-secondary">${esc(p.spec)}</p>
<div class="mt-2 flex items-center justify-between"><span class="text-label-md font-bold text-price-primary">${kes(p.price)}</span>
<div class="flex gap-1.5"><button class="h-8 px-3 bg-primary-container text-white rounded-lg text-xs font-bold hover:bg-primary" data-wish-act="cart" data-id="${p.id}" type="button">Add to cart</button><button aria-label="Remove" class="h-8 w-8 flex items-center justify-center text-secondary hover:text-danger" data-wish-act="del" data-id="${p.id}" type="button">${icon('delete', 'text-lg')}</button></div></div></div></div>`).join('')}</div>`;
}

/* ---------- WhatsApp order text ---------- */
function cartText() {
  const lines = Object.entries(cart).map(([id, q]) => { const p = byId(id); return p ? `• ${p.name} x${q} – ${kes(p.price * q)}` : ''; }).filter(Boolean);
  return `Hello Daisolve, I would like to order:\n${lines.join('\n')}\nTotal: ${kes(cartTotal())}\nPlease confirm availability.`;
}

/* ---------- Product page (replaces the old quick-view modal) ---------- */
const PRODUCT_PAGE = '/shop';
function goProduct(id) { if (byId(id)) location.href = PRODUCT_PAGE + '/' + encodeURIComponent(id); }
const openQuickView = goProduct;

let currentProduct = null, pageQty = 1;
const storageLabel = g => g >= 1024 ? (g / 1024) + 'TB' : g + 'GB';
const starsHTML = r => Array.from({length: 5}, (_, i) => `<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">${r >= i + 0.75 ? 'star' : r >= i + 0.25 ? 'star_half' : 'star_outline'}</span>`).join('');
function syncProductHeart() {
  const btn = $('#pdWish'); if (!btn || !currentProduct) return;
  const on = wish.includes(currentProduct.id), i = $('.material-symbols-outlined', btn);
  if (on) i.setAttribute('style', "font-variation-settings: 'FILL' 1;"); else i.removeAttribute('style');
  btn.classList.toggle('text-danger', on); btn.classList.toggle('text-secondary', !on);
  btn.setAttribute('aria-pressed', on);
}
function relatedCard(p) {
  const d = pct(p);
  return `<a class="block bg-surface-canvas border border-surface-border rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-primary-container/40 transition-all" href="${PRODUCT_PAGE}/${encodeURIComponent(p.id)}">
<div class="relative aspect-square flex items-center justify-center p-3 bg-surface-subtle rounded-lg">${d ? `<span class="absolute top-1.5 left-1.5 bg-tertiary-container text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-${d}% OFF</span>` : ''}<img alt="${esc(p.name)}" class="object-contain h-full w-full" loading="lazy" src="${p.img}"/></div>
<span class="block mt-3 text-[10px] uppercase font-bold text-primary tracking-wider">${esc(p.brand)}</span>
<h3 class="text-label-md sm:text-headline-sm font-headline-sm text-price-primary line-clamp-2 leading-tight">${esc(p.name)}</h3>
<p class="text-xs text-secondary mt-0.5 line-clamp-1">${esc(p.spec)}</p>
<div class="mt-2 text-headline-sm font-price-display text-price-primary">${kes(p.price)}</div></a>`;
}
function loadGuides() {
  if (!window.daiArticles) return;
  daiArticles.load(list => {
    const box = document.getElementById('pdGuides'), sec = document.getElementById('pdGuidesSec'); if (!box || !list.length) return;
    box.innerHTML = list.slice(0, 2).map(a => `<a href="/blog/${encodeURIComponent(a.id)}" class="bg-surface-canvas p-4 rounded-xl border border-surface-border flex gap-4 items-center hover:border-primary/50 transition-colors"><div class="w-24 h-24 rounded-lg bg-surface-subtle flex-shrink-0 overflow-hidden flex items-center justify-center border border-surface-border/60">${a.img ? `<img src="${esc(a.img)}" alt="${esc(a.title)}" loading="lazy" decoding="async" class="w-full h-full object-cover"/>` : icon('menu_book', 'text-3xl text-outline-variant')}</div><div class="min-w-0"><p class="text-xs text-secondary">${esc(a.tag || '')}</p><h3 class="text-body-md font-bold text-price-primary leading-snug">${esc(a.title)}</h3><p class="text-body-sm text-secondary mt-1 line-clamp-2">${esc(a.ex)}</p></div></a>`).join('');
    sec.classList.remove('hidden');
  });
}
function renderProductPage() {
  const root = $('#productPage'); if (!root) return;
  const pm = location.pathname.match(/^\/shop\/([^\/]+)/);
  const id = pm ? decodeURIComponent(pm[1]) : new URLSearchParams(location.search).get('id');
  const p = byId(id);
  if (!p) {
    document.title = 'Product not found | Daisolve Technologies'; if (window.daiSEO) daiSEO.noindex();
    root.innerHTML = `<div class="max-w-7xl mx-auto px-margin md:px-margin-desktop py-16 text-center">${icon('search_off', 'text-6xl text-outline-variant')}<h1 class="mt-3 text-headline-md font-headline-md text-price-primary">We could not find that phone</h1><p class="text-body-md text-secondary mt-1">The link may be old, or the phone is no longer listed.</p><div class="mt-5 flex justify-center gap-2"><a class="h-11 px-6 bg-primary-container text-white rounded-lg text-label-md font-bold inline-flex items-center hover:bg-primary" href="/shop">Browse all phones</a><a class="h-11 px-6 border border-mpesa-green text-mpesa-green rounded-lg text-label-md font-bold inline-flex items-center gap-2 hover:bg-mpesa-green hover:text-white" href="${waLink('Hello Daisolve, I am looking for a phone I could not find on your website.')}" rel="noopener" target="_blank">Ask on WhatsApp</a></div></div>`;
    return;
  }
  currentProduct = p; pageQty = 1;
  const D = p.details || {};
  const d = pct(p), saved = p.old > p.price ? p.old - p.price : 0;
  const net = (p.net || '').toUpperCase() || 'Network';
  const stor = p.storage ? storageLabel(p.storage) : '';
  const memShort = [p.ram ? p.ram + 'GB RAM' : '', stor].filter(Boolean).join(' · ') || 'See specifications';
  const waMsg = `Hello Daisolve, I am interested in the ${p.name} (${kes(p.price)}). Is it available?`;
  document.title = `${p.name} Price in Kenya | Daisolve Technologies`;
  { let cl = document.querySelector('link[rel="canonical"]'); if (!cl) { cl = document.createElement('link'); cl.rel = 'canonical'; document.head.appendChild(cl); } cl.href = 'https://www.daisolvetechnologies.co.ke/shop/' + encodeURIComponent(p.id); }
  const meta = $('meta[name="description"]') || document.head.appendChild(Object.assign(document.createElement('meta'), {name: 'description'}));
  meta.content = `Buy the ${p.name} at ${kes(p.price)} from Daisolve Technologies, Jamia Shopping Mall, Nairobi. Brand sealed with warranty.`;
  const hasWarranty = p.corner && /warrant|care/i.test(p.corner);
  const warranty = hasWarranty ? p.corner : 'Manufacturer warranty (1–2 years depending on brand)';
  const FILL = `style="font-variation-settings: 'FILL' 1;"`;
  const ic = (n, c = '', fill) => `<span class="material-symbols-outlined ${c}"${fill ? ' ' + FILL : ''}>${n}</span>`;
  const stars = (r, c) => Array.from({length: 5}, (_, i) => ic(r >= i + 0.75 ? 'star' : r >= i + 0.25 ? 'star_half' : 'star_outline', c, true)).join('');

  /* data with graceful fallbacks (details in catalog.js override these) */
  const gal = (D.gallery && D.gallery.length) ? D.gallery : [{src: p.img, label: 'Front'}];
  const hero = D.hero || gal[0].src;
  if (window.daiSEO) {
    const path = '/shop/' + encodeURIComponent(p.id), url = daiSEO.ORIGIN + path;
    const imgs = gal.map(g => daiSEO.abs(g.src)).filter(Boolean);
    const specLine = [p.ram ? p.ram + 'GB RAM' : '', stor, net !== 'Network' ? net : ''].filter(Boolean).join(', ');
    const desc = `Buy the ${p.name} in Kenya for ${kes(p.price)}. ${specLine ? specLine + '. ' : ''}Brand new with warranty, M-PESA payment and same-day Nairobi delivery.`;
    daiSEO.set({
      title: `${p.name} Price in Kenya | Daisolve`, desc, path, image: imgs[0], type: 'product',
      extra: {'product:price:amount': String(p.price), 'product:price:currency': 'KES'},
      jsonld: [{
        '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: String(p.id), category: 'Smartphones',
        description: daiSEO.clip(desc, 300), image: imgs, brand: {'@type': 'Brand', name: p.brand},
        offers: {'@type': 'Offer', url, priceCurrency: 'KES', price: String(p.price), availability: 'https://schema.org/InStock',
                 itemCondition: 'https://schema.org/NewCondition', seller: {'@type': 'Organization', name: 'Daisolve Technologies', url: daiSEO.ORIGIN + '/home'}}
      }, {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Home', item: daiSEO.ORIGIN + '/home'},
          {'@type': 'ListItem', position: 2, name: 'Shop', item: daiSEO.ORIGIN + '/shop'},
          {'@type': 'ListItem', position: 3, name: p.name, item: url}]
      }]
    });
  }
  const highlights = D.highlights || [
    {icon: 'memory', title: 'Memory & Storage', text: `${memShort} for apps, photos and everyday use.`, footer: memShort},
    {icon: 'cell_tower', title: `${net} Connectivity`, text: p.net === '5g' ? 'Ready for 5G where network coverage is available, and fully backward compatible with 4G.' : 'Fast 4G connectivity for streaming, calls and everyday browsing.', footer: (p.chips || [])[1] || (p.chips || [])[0] || net},
    {icon: 'verified', title: 'Genuine & Warrantied', text: 'Brand new and factory sealed, backed by the manufacturer warranty. Collect at our Nairobi CBD shop or get it delivered.', footer: hasWarranty ? p.corner : 'Manufacturer warranty'}
  ];
  const quick = D.quick || [
    {icon: 'memory', title: memShort, sub: 'Memory & storage'},
    {icon: 'cell_tower', title: `${net} Network`, sub: p.net === '5g' ? '5G ready, 4G compatible' : '4G LTE'},
    {icon: 'star', title: `${p.rating.toFixed(1)} / 5 Rating`, sub: `${p.reviews} customer reviews`}
  ];
  const PURCHASE = {title: 'Purchase & Delivery', icon: 'local_shipping', items: [['Pickup', 'Jamia Shopping Mall, Nairobi CBD'], ['Delivery', 'Same-day in Nairobi · countrywide dispatch'], ['Payment', 'M-PESA Pochi, bank, card or PayPal']]};
  const specGroups = D.specs ? D.specs.concat([PURCHASE]) : [
    {title: 'General Information', icon: 'info', items: [['Brand', p.brand], ['Model', p.name], ['Condition', 'Brand new, factory sealed'], ['Warranty', warranty]]},
    {title: 'Memory & Network', icon: 'memory', items: [['RAM', p.ram ? p.ram + 'GB' : '-'], ['Storage', stor || '-'], ['Network', net], ['Customer Rating', `${p.rating.toFixed(1)} / 5 (${p.reviews} reviews)`]]},
    ...((p.chips || []).length ? [{title: 'Key Highlights', icon: 'bolt', items: p.chips.map(c => ['Highlight', c])}] : []),
    {title: 'Purchase & Delivery', icon: 'local_shipping', items: [['Pickup', 'Jamia Shopping Mall, Nairobi CBD'], ['Delivery', 'Same-day in Nairobi · countrywide dispatch'], ['Payment', 'M-PESA Pochi, bank, card or PayPal']]}
  ];
  const faqs = (D.faqsExtra || []).concat(D.faqs || [
    ['Does this phone come with a warranty?', 'Yes. Every phone is brand sealed and covered by the manufacturer\'s warranty, usually 1–2 years depending on brand and model. Claims are handled through the brand\'s certified service centres.'],
    ['How does delivery work?', 'In Nairobi we deliver within about 3 hours once your payment is confirmed. Outside Nairobi we dispatch by parcel to your town, anywhere in Kenya. The delivery fee depends on your location and we confirm it before you pay.'],
    ['How can I pay?', 'We accept M-PESA Pochi la Biashara (+254 790 835039), bank transfer, Visa, Mastercard and PayPal. You can also order through WhatsApp and we will guide you.'],
    ['Can I collect the phone from your shop?', 'Yes. You can collect it at Jamia Shopping Mall, Nairobi CBD. Message us on WhatsApp first so we can confirm the phone is ready for you.']
  ]);
  const reviews = D.reviews || [];
  const fam = x => (x.cat || '').split(' ')[0];
  const baseName = x => x.name.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  const related = products.filter(x => x.id !== p.id).sort((a, b) =>
    (b.brand === p.brand) - (a.brand === p.brand) || (fam(b) === fam(p)) - (fam(a) === fam(p)) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4);
  const variants = products.filter(x => x.id === p.id || baseName(x) === baseName(p)).sort((a, b) => (a.storage || 0) - (b.storage || 0) || (a.ram || 0) - (b.ram || 0));

  /* SEO: Product structured data */
  /* Product + Breadcrumb JSON-LD is written by seo.js (daiSEO.set) above. Ratings are left out on purpose: only mark up genuine customer reviews. */

  const thumbCls = on => on ? 'aspect-square rounded-lg border-2 border-primary bg-white p-1 flex flex-col items-center justify-center relative overflow-hidden focus:outline-none' : 'aspect-square rounded-lg border border-surface-border hover:border-primary/60 bg-white p-1 flex flex-col items-center justify-center relative overflow-hidden focus:outline-none transition-colors';
  const chev = ic('chevron_right', 'text-xs');
  const variantBtn = v => {
    const on = v.id === p.id, lbl = [v.ram ? v.ram + 'GB' : '', v.storage ? storageLabel(v.storage) : ''].filter(Boolean).join(' + ') || 'Standard';
    const inner = `<div class="text-body-sm font-bold ${on ? 'text-primary' : 'text-on-surface'}">${lbl}</div><div class="text-body-sm ${on ? 'font-semibold text-price-primary' : 'text-outline'} mt-0.5">${kes(v.price)}</div>`;
    return on ? `<button class="p-2.5 rounded-lg border-2 border-primary text-left bg-surface-subtle relative shadow-sm" type="button">${p.pop >= 90 ? '<span class="absolute -top-2 right-2 bg-primary text-white text-[9px] font-bold px-1.5 rounded">POPULAR</span>' : ''}${inner}</button>`
      : `<a class="p-2.5 rounded-lg border border-surface-border text-left hover:border-primary/50 bg-surface-canvas transition-colors block" href="${PRODUCT_PAGE}/${encodeURIComponent(v.id)}">${inner}</a>`;
  };
  const trust = [
    ['verified_user', 'text-primary', 'Warranty', hasWarranty ? p.corner + '. Covered by the manufacturer with local repair support through certified service centres.' : 'Covered by the manufacturer warranty (1–2 years depending on brand) with local repair support.'],
    ['security', 'text-mpesa-green', 'Payment Assurance', 'M-PESA Pochi (+254 790 835039), bank transfer, Visa, Mastercard or PayPal.'],
    ['local_shipping', 'text-primary', 'Express Delivery', 'About 3 hours in Nairobi once payment is confirmed; countrywide parcels dispatched safely.'],
    ['sync', 'text-primary', 'Genuine Guarantee', 'Brand new and factory sealed, collected or delivered exactly as it left the box.']
  ];
  const ratingBars = D.breakdown ? `<div class="space-y-1.5 min-w-[180px]">${[5, 4, 3, 2, 1].map(n => `<div class="flex items-center gap-2 text-[12px]"><span class="w-7 text-outline">${n} ★</span><div class="flex-1 bg-surface-container rounded-full h-2 overflow-hidden"><div class="bg-primary h-full rounded-full" style="width: ${D.breakdown[n] || 0}%"></div></div><span class="w-7 text-right font-medium text-price-primary">${D.breakdown[n] || 0}%</span></div>`).join('')}</div>` : '';
  const relCard = x => { const dd = pct(x); return `<div class="bg-surface-canvas rounded-xl border border-surface-border p-3 flex flex-col justify-between hover:shadow-md transition-shadow"><div><a class="block aspect-square bg-white rounded-lg p-2 relative flex items-center justify-center border border-surface-border/40" href="${PRODUCT_PAGE}/${encodeURIComponent(x.id)}"><span class="absolute top-2 left-2 ${dd ? 'bg-tertiary-container' : 'bg-mpesa-green'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded">${dd ? 'Sale' : 'Genuine'}</span><img alt="${esc(x.name)}" class="w-full h-full object-contain" loading="lazy" src="${x.img}"/></a><a href="${PRODUCT_PAGE}/${encodeURIComponent(x.id)}"><h3 class="text-body-md font-bold text-price-primary mt-2 line-clamp-2">${esc(x.name)}</h3></a><div class="flex items-center text-tertiary-container text-xs mt-1">${ic('star', 'text-xs', true)}<span class="ml-1 font-semibold text-price-primary">${x.rating.toFixed(1)}</span></div></div><div class="mt-3"><div class="text-body-md md:text-headline-sm font-bold text-price-primary">${kes(x.price)}</div><button class="w-full mt-2 bg-surface-subtle hover:bg-primary hover:text-white text-primary text-body-sm font-bold py-1.5 rounded border border-surface-border transition-colors" data-rel-add="${esc(x.id)}" type="button">Add to Cart</button></div></div>`; };

  root.innerHTML = `<div class="max-w-7xl mx-auto px-4 py-4 pb-safe-space">
<nav aria-label="Breadcrumb" class="mb-4 text-body-sm font-body-sm text-outline flex items-center gap-1.5 overflow-x-auto whitespace-nowrap no-scrollbar py-1"><a class="hover:text-primary transition-colors" href="/home">Home</a>${chev}<a class="hover:text-primary transition-colors" href="/shop">Shop</a>${chev}<a class="hover:text-primary transition-colors" href="/shop?brand=${encodeURIComponent(p.brand.toLowerCase())}">${esc(p.brand)}</a>${chev}<span class="text-price-primary font-semibold">${esc(p.name)}</span></nav>
<section class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-12">
<div class="lg:col-span-6 bg-surface-canvas rounded-xl p-4 border border-surface-border shadow-sm">
<div class="relative aspect-square w-full bg-white rounded-lg flex items-center justify-center overflow-hidden border border-surface-border/60">
<div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">${d ? `<span class="bg-tertiary-container text-on-tertiary-container text-label-sm font-label-sm px-2.5 py-1 rounded-md shadow-sm">${d}% OFF</span>` : ''}${p.badge ? `<span class="${p.badgeCls || 'bg-primary'} text-white text-label-sm font-label-sm px-2.5 py-1 rounded-md shadow-sm">${esc(p.badge)}</span>` : ''}<span class="bg-mpesa-green text-white text-label-sm font-label-sm px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">${ic('verified_user', 'text-xs fill', true)}${esc(hasWarranty ? p.corner : 'Official ' + p.brand + ' Warranty')}</span>${p.net === '5g' ? `<span class="bg-primary text-on-primary text-label-sm font-label-sm px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">${ic('cell_tower', 'text-xs')}5G Ready</span>` : ''}</div>
<button aria-label="Inspect full size image" class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-surface-canvas/90 backdrop-blur border border-surface-border text-on-surface flex items-center justify-center hover:bg-surface-subtle active:scale-95 shadow-sm" data-pd-zoom type="button">${ic('zoom_in', 'text-xl')}</button>
<img alt="${esc(p.name)}" class="w-4/5 h-4/5 object-contain transition-transform duration-300 hover:scale-105" id="pdMainImg" src="${hero}"/>
${gal.length > 1 ? `<div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-surface-canvas/80 px-2 py-1 rounded-full border border-surface-border" id="pdDots">${gal.map((g, i) => `<span class="${i ? 'w-1.5 h-1.5 bg-outline-variant' : 'w-2 h-2 bg-primary'} rounded-full"></span>`).join('')}</div>` : ''}
</div>
${gal.length > 1 ? `<div class="grid grid-cols-4 gap-2.5 mt-3" id="pdThumbs">${gal.map((g, i) => `<button class="${thumbCls(!i)}" data-pd-thumb="${i}" type="button"><img alt="${esc(g.label)}" class="w-full h-full object-contain" src="${g.src}"/><span class="absolute bottom-0 inset-x-0 bg-price-primary/80 text-white text-[9px] text-center font-medium py-0.5">${esc(g.label)}</span></button>`).join('')}</div>` : ''}
<div class="mt-4 pt-3 border-t border-surface-border grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
${[['verified', 'text-primary', '100% Genuine'], ['electric_bolt', 'text-primary', 'Nairobi Same-Day'], ['payments', 'text-mpesa-green', 'M-PESA Pochi'], ['store', 'text-primary', 'CBD Pickup']].map(t => `<div class="bg-surface-subtle p-2 rounded-lg border border-surface-border/60">${ic(t[0], t[1] + ' text-xl')}<div class="text-[11px] font-bold text-price-primary uppercase mt-0.5">${t[2]}</div></div>`).join('')}
</div></div>
<div class="lg:col-span-6 bg-surface-canvas rounded-xl p-5 lg:p-6 border border-surface-border shadow-sm">
<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle text-primary border border-surface-border mb-2.5">${ic('verified', 'text-sm')}<span class="text-label-sm font-label-sm">Genuine ${esc(p.brand)} · Brand Sealed</span></div>
<h1 class="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-price-primary">${esc(p.name)}</h1>
<div class="flex items-center gap-2 mt-2 pb-3 border-b border-surface-border"><div class="flex items-center text-tertiary-container">${stars(p.rating, 'text-base fill')}</div><span class="font-bold text-body-md text-price-primary">${p.rating.toFixed(1)}</span><span class="text-outline">·</span><a class="text-primary hover:underline text-body-sm font-body-sm" href="#reviews">(${p.reviews} Customer Reviews)</a></div>
<div class="mt-4 flex items-baseline gap-3 flex-wrap"><span class="text-headline-xl-mobile md:text-headline-xl font-headline-xl text-price-primary">${kes(p.price)}</span>${p.old > p.price ? `<span class="text-price-strikethrough line-through text-body-lg font-body-lg">${kes(p.old)}</span><span class="bg-tertiary-fixed text-on-tertiary-fixed font-bold text-label-sm font-label-sm px-2.5 py-1 rounded-md">Save ${kes(saved)}</span>` : ''}</div>
<div class="mt-3 p-3 bg-surface-subtle border border-surface-border rounded-lg flex items-start gap-2.5">${ic('inventory', 'text-success mt-0.5')}<div><div class="text-body-sm font-bold text-price-primary">${esc(p.sub || 'Available at Jamia Shopping Mall')}</div><div class="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">${ic('schedule', 'text-sm text-tertiary-container')}<span>Order today for <strong>Same-Day Express Delivery</strong> in Nairobi</span></div></div></div>
<div class="mt-5"><div class="flex justify-between items-center mb-2"><span class="text-label-md font-label-md text-price-primary">Select Storage &amp; RAM:</span><span class="text-body-sm text-primary font-medium">Selected: ${stor}</span></div><div class="grid grid-cols-3 gap-2">${variants.slice(0, 3).map(variantBtn).join('')}</div></div>
${D.colors && D.colors.length ? `<div class="mt-5"><div class="flex justify-between items-center mb-2"><span class="text-label-md font-label-md text-price-primary">Select Colour:</span><span class="text-body-sm text-price-primary font-semibold" id="pdColorName">${esc(D.colors[0].name)}</span></div><div class="flex items-center gap-3" id="pdColors">${D.colors.map((c, i) => `<button class="${i ? 'hover:ring-2 hover:ring-primary/40' : 'ring-2 ring-primary ring-offset-2'} w-9 h-9 rounded-full flex items-center justify-center transition-all" data-pd-color="${esc(c.name)}" style="background:${esc(c.hex)}" title="${esc(c.name)}" type="button">${i ? '' : ic('check', 'text-white text-base')}</button>`).join('')}</div></div>` : ''}
<div class="mt-6 flex flex-col gap-3">
<div class="flex gap-3">
<div class="flex items-center border border-surface-border rounded-lg bg-surface-subtle"><button aria-label="Decrease Quantity" class="w-10 h-11 flex items-center justify-center text-on-surface hover:text-primary active:scale-95 font-bold text-lg" data-pd-qty="-1" type="button">-</button><input class="w-10 h-11 border-0 bg-transparent text-center font-bold text-body-md text-price-primary p-0 focus:ring-0" id="pdQty" readonly type="text" value="1"/><button aria-label="Increase Quantity" class="w-10 h-11 flex items-center justify-center text-on-surface hover:text-primary active:scale-95 font-bold text-lg" data-pd-qty="1" type="button">+</button></div>
<button class="flex-1 bg-primary hover:bg-primary-container text-on-primary font-bold text-body-md h-11 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-95" data-pd-add type="button">${ic('shopping_bag', 'text-xl')}<span>Add to Cart</span></button>
<button aria-label="Save to wishlist" class="w-11 h-11 rounded-lg border border-surface-border text-on-surface-variant hover:text-primary hover:bg-surface-subtle flex items-center justify-center active:scale-95 transition-colors" id="pdWish" type="button">${ic('favorite', 'text-xl')}</button>
</div>
<button class="w-full bg-mpesa-green hover:opacity-95 text-white font-bold text-body-md h-11 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-95" data-pd-buy type="button">${ic('payments', 'text-xl')}<span>Buy Now (M-PESA · Card · Bank)</span></button>
<a class="w-full border border-surface-border hover:bg-surface-subtle text-price-primary font-bold text-body-md h-11 rounded-lg flex items-center justify-center gap-2 transition-all duration-150 active:scale-95" href="${waLink(waMsg)}" rel="noopener" target="_blank">${ic('chat', 'text-mpesa-green text-xl fill', true)}<span>Order via WhatsApp (Talk to an Agent)</span></a>
</div>
<div class="mt-6 pt-4 border-t border-surface-border space-y-2.5">${trust.map(t => `<div class="flex items-start gap-2.5 text-body-sm font-body-sm">${ic(t[0], t[1] + ' text-lg')}<span class="text-on-surface"><strong>${t[2]}:</strong> ${esc(t[3])}</span></div>`).join('')}</div>
</div></section>
<section class="mb-12"><div class="mb-4"><h2 class="text-headline-md md:text-headline-lg font-headline-md text-price-primary">Product Overview</h2><p class="text-body-md text-on-surface-variant mt-1">${esc(D.tagline || `${p.name} from ${p.brand}. Brand new, factory sealed and backed by the manufacturer warranty.`)}</p>${(D.description || []).map(t => `<p class="text-body-md text-on-surface-variant mt-3">${esc(t)}</p>`).join('')}</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${highlights.map(h => `<div class="bg-surface-canvas p-5 rounded-xl border border-surface-border shadow-sm flex flex-col justify-between"><div><div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-3">${ic(h.icon, 'text-2xl')}</div><h3 class="text-headline-sm font-headline-sm text-price-primary">${esc(h.title)}</h3><p class="text-body-sm text-on-surface-variant mt-2 leading-relaxed">${esc(h.text)}</p></div><div class="mt-4 pt-3 border-t border-surface-border text-label-sm font-label-sm text-primary flex items-center gap-1"><span>${esc(h.footer)}</span>${ic('arrow_forward', 'text-sm')}</div></div>`).join('')}</div>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">${quick.map(q => `<div class="bg-surface-subtle p-3.5 rounded-lg border border-surface-border flex items-center gap-3">${ic(q.icon, 'text-primary text-2xl')}<div><div class="text-body-sm font-bold text-price-primary">${esc(q.title)}</div><div class="text-[12px] text-outline">${esc(q.sub)}</div></div></div>`).join('')}</div></section>
<section class="mb-12"><div class="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div><h2 class="text-headline-md md:text-headline-lg font-headline-md text-price-primary">Technical Specifications</h2><p class="text-body-sm text-on-surface-variant">Verified details for ${esc(p.name)}</p></div><span class="text-label-sm font-label-sm text-primary bg-surface-subtle px-3 py-1 rounded-full border border-surface-border self-start">${esc(D.model || p.name)}</span></div>
<div class="bg-surface-canvas rounded-xl border border-surface-border shadow-sm overflow-hidden divide-y divide-surface-border">${specGroups.map(g => `<div class="p-4 sm:p-5"><h3 class="text-headline-sm font-headline-sm text-price-primary flex items-center gap-2 mb-3">${ic(g.icon, 'text-primary')}${esc(g.title)}</h3><dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-body-sm">${g.items.map(it => `<div class="bg-surface-subtle p-2.5 rounded border border-surface-border/60"><dt class="text-outline text-[11px] font-bold uppercase">${esc(it[0])}</dt><dd class="text-price-primary font-semibold mt-0.5">${esc(it[1])}</dd></div>`).join('')}</dl></div>`).join('')}</div></section>
<section class="mb-12 scroll-mt-20" id="reviews"><div class="bg-surface-canvas rounded-xl p-5 lg:p-6 border border-surface-border shadow-sm">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 ${reviews.length ? 'pb-6 border-b border-surface-border' : ''}">
<div class="flex items-center gap-4"><div class="text-center"><div class="text-4xl font-extrabold text-price-primary">${p.rating.toFixed(1)}</div><div class="flex items-center text-tertiary-container mt-1 justify-center">${stars(p.rating, 'text-lg fill')}</div><div class="text-[12px] text-outline mt-1 font-medium">${p.reviews} Customer Reviews</div></div>${ratingBars}</div>
<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"><button class="bg-surface-subtle hover:bg-surface-container text-primary font-bold text-body-sm px-4 py-2 rounded-lg border border-surface-border active:scale-95 transition-all text-center" data-write-review type="button">Write a Review</button></div></div>
${reviews.length ? `<div class="divide-y divide-surface-border mt-4">${reviews.map(r => `<div class="py-4"><div class="flex justify-between items-start"><div><div class="flex items-center gap-2"><span class="font-bold text-body-md text-price-primary">${esc(r.name)}</span><span class="inline-flex items-center gap-1 text-[11px] font-bold text-mpesa-green bg-mpesa-green/10 px-2 py-0.5 rounded">${ic('check_circle', 'text-xs')}Verified Buyer (${esc(r.city)})</span></div><div class="flex items-center text-tertiary-container mt-1">${stars(r.rating || 5, 'text-sm fill')}</div></div><span class="text-outline text-body-sm">${esc(r.when)}</span></div><p class="text-body-md text-on-surface mt-2 leading-relaxed">"${esc(r.text)}"</p></div>`).join('')}</div>` : ''}
<div id="dbReviews"></div>
</div></section>
<section class="mb-12"><div class="mb-4"><h2 class="text-headline-md md:text-headline-lg font-headline-md text-price-primary">Frequently Asked Questions</h2><p class="text-body-sm text-on-surface-variant">Questions about buying this phone in Kenya? Here are the answers.</p></div>
<div class="space-y-3">${faqs.map(f => `<details class="group bg-surface-canvas rounded-xl border border-surface-border p-4 [&_summary::-webkit-details-marker]:none"><summary class="flex items-center justify-between cursor-pointer font-bold text-body-md text-price-primary"><span>${esc(f[0])}</span>${ic('expand_more', 'text-primary group-open:rotate-180 transition-transform duration-200')}</summary><p class="mt-3 text-body-sm text-on-surface-variant leading-relaxed border-t border-surface-border/60 pt-3">${esc(f[1])}</p></details>`).join('')}</div></section>
<section class="mb-12"><div class="mb-4 flex items-center justify-between"><div><h2 class="text-headline-md md:text-headline-lg font-headline-md text-price-primary">You May Also Like</h2><p class="text-body-sm text-on-surface-variant">Explore other phones from our catalogue</p></div><a class="text-label-md font-label-md text-primary hover:underline" href="/shop">View All →</a></div>
<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">${related.map(relCard).join('')}</div></section>
<section class="mb-12 hidden" id="pdGuidesSec"><div class="mb-4"><h2 class="text-headline-md md:text-headline-lg font-headline-md text-price-primary">Kenyan Tech Guides &amp; Insights</h2><p class="text-body-sm text-on-surface-variant">Make informed phone buying decisions with Daisolve</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="pdGuides"></div></section>${(() => { setTimeout(loadGuides, 0); return ''; })()}
</div>
<div class="md:hidden fixed bottom-[60px] left-0 w-full z-40 bg-surface-canvas/95 backdrop-blur-md border-t border-surface-border px-4 py-2.5 shadow-lg"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2.5 min-w-0"><div class="w-10 h-10 rounded bg-white border border-surface-border p-1 flex-shrink-0"><img alt="" class="w-full h-full object-contain" src="${p.img}"/></div><div class="min-w-0"><div class="text-body-sm font-bold text-price-primary truncate">${esc(p.name)}</div><div class="text-price-display-mobile font-price-display-mobile text-primary">${kes(p.price)}</div></div></div><button class="bg-primary hover:bg-primary-container text-white text-body-sm font-bold px-4 py-2 rounded-lg active:scale-95 transition-all flex-shrink-0" data-pd-buy type="button">Buy Now</button></div></div>`;

  root.addEventListener('click', e => {
    const t = e.target;
    const q = t.closest('[data-pd-qty]');
    if (q) { pageQty = Math.max(1, Math.min(10, pageQty + +q.dataset.pdQty)); $('#pdQty').value = pageQty; return; }
    if (t.closest('[data-pd-add]')) { addToCart(p.id, pageQty); return; }
    if (t.closest('[data-pd-buy]')) { addToCart(p.id, pageQty, true); openCheckout(); return; }
    if (t.closest('#pdWish')) { toggleWish(p.id); return; }
    if (t.closest('[data-write-review]')) { startReview(p); return; }
    const ra = t.closest('[data-rel-add]'); if (ra) { addToCart(ra.dataset.relAdd, 1); return; }
    const th = t.closest('[data-pd-thumb]');
    if (th) {
      const i = +th.dataset.pdThumb, img = $('#pdMainImg');
      img.src = gal[i].src; img.alt = gal[i].label;
      $$('[data-pd-thumb]', root).forEach((b, k) => { b.className = thumbCls(k === i); });
      $$('#pdDots span', root).forEach((s, k) => { s.className = (k === i ? 'w-2 h-2 bg-primary' : 'w-1.5 h-1.5 bg-outline-variant') + ' rounded-full'; });
      return;
    }
    const cl = t.closest('[data-pd-color]');
    if (cl) {
      $$('[data-pd-color]', root).forEach(b => { b.className = 'hover:ring-2 hover:ring-primary/40 w-9 h-9 rounded-full flex items-center justify-center transition-all'; b.innerHTML = ''; });
      cl.className = 'ring-2 ring-primary ring-offset-2 w-9 h-9 rounded-full flex items-center justify-center transition-all';
      cl.innerHTML = ic('check', 'text-white text-base');
      $('#pdColorName').textContent = cl.dataset.pdColor; return;
    }
    if (t.closest('[data-pd-zoom]')) window.open($('#pdMainImg').src, '_blank', 'noopener');
  });
  syncProductHeart();
  loadDbReviews(p.id);
}

/* ---------- Form helpers ---------- */
const inputCls = 'w-full h-11 px-3 bg-surface-subtle border border-surface-border rounded-lg text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20';
const fld = (label, name, type = 'text', extra = '', val = '') => `<div><label class="block text-label-md font-label-md text-price-primary mb-1" for="f_${name}">${label}</label><input class="${inputCls}" id="f_${name}" name="${name}" type="${type}" value="${esc(val)}" ${extra}/><p class="text-xs text-danger mt-1 hidden" data-err="${name}"></p></div>`;
function setErr(form, name, msg) {
  const el = $(`[data-err="${name}"]`, form); if (!el) return;
  el.textContent = msg || ''; el.classList.toggle('hidden', !msg);
  const inp = form.elements[name]; if (inp) inp.classList.toggle('border-danger', !!msg);
}
const okPhone = v => { const d = String(v).replace(/\D/g, ''); return d.length >= 9 && d.length <= 15; };
const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
function firstError(form) { const e = $('[data-err]:not(.hidden)', form); if (e) { const i = form.elements[e.dataset.err]; if (i) i.focus(); } }

/* ---------- Checkout ---------- */
const PAY = {
  pochi: {label: 'M-PESA Pochi la Biashara', icon: 'smartphone'},
  bank: {label: 'Bank transfer', icon: 'account_balance'},
  card: {label: 'Visa / Mastercard', icon: 'credit_card'},
  paypal: {label: 'PayPal', icon: 'payments'},
  intl: {label: 'Other international provider', icon: 'public'}
};
const DELIV = {
  pickup: 'Collect at Jamia Shopping Mall, Nairobi CBD',
  nairobi: 'Same-day delivery in Nairobi',
  kenya: 'Countrywide dispatch (outside Nairobi)',
  intl: 'International shipping'
};
function payNote(m, total) {
  const t = kes(total);
  return ({
    pochi: `<p>Send <b>${t}</b> to <b>${PHONE}</b> using <b>M-PESA Pochi la Biashara</b> and keep the M-PESA message. After placing the order, send it on WhatsApp so we can confirm your payment.</p><button class="mt-2 text-xs font-bold text-primary underline" data-copy="0790835039" type="button">Copy Pochi number</button>`,
    bank: `<p>Bank transfers are accepted. We will send the account details on WhatsApp as soon as you place the order. Use your order ID as the payment reference.</p>`,
    card: `<p>Visa and Mastercard are accepted. We will send you a secure payment link for <b>${t}</b> once the order is placed. Never type card details into this page or into WhatsApp chats.</p>`,
    paypal: `<p>PayPal is accepted. We will send a PayPal payment request to your email address, so please add your email above. The amount is converted at the rate shown on the request.</p>`,
    intl: `<p>We accept other international payment providers. Tell us which one you prefer in the notes and we will confirm availability and send instructions.</p>`
  })[m];
}
const payVal = f => (f.querySelector('input[name="pay"]:checked') || {}).value;
function openCheckout() {
  if (!cartCount()) { toast('Your cart is empty. Add a phone first.'); return; }
  location.href = '/checkout'; return; // checkout now lives on its own page (old modal code below is unused)
  const u = session || {};
  const items = Object.entries(cart).map(([id, q]) => ({p: byId(id), q})).filter(x => x.p);
  const box = openModal(`<form class="p-5 sm:p-6 space-y-4" id="checkoutForm" novalidate="">
<h3 class="text-headline-md font-headline-md text-price-primary pr-8">Checkout</h3>
<div class="p-3 bg-surface-subtle rounded-lg border border-surface-border space-y-1 text-body-sm">
${items.map(x => `<div class="flex justify-between gap-3"><span class="text-secondary">${esc(x.p.name)} × ${x.q}</span><span class="font-semibold text-price-primary whitespace-nowrap">${kes(x.p.price * x.q)}</span></div>`).join('')}
<div class="flex justify-between pt-2 mt-1 border-t border-surface-border text-label-md font-bold text-price-primary"><span>Subtotal</span><span>${kes(cartTotal())}</span></div>
</div>
${fld('Full name', 'name', 'text', 'autocomplete="name"', u.name || '')}
${fld('Phone / WhatsApp number', 'phone', 'tel', 'autocomplete="tel" placeholder="07XX XXX XXX or +country code"', u.phone || '')}
${fld('Email <span class="font-normal text-secondary">(required for PayPal and card payments)</span>', 'email', 'email', 'autocomplete="email"', u.email || '')}
<div><label class="block text-label-md font-label-md text-price-primary mb-1" for="f_delivery">Delivery</label>
<select class="${inputCls}" id="f_delivery" name="delivery">${Object.entries(DELIV).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
<div class="hidden" id="addrWrap"><label class="block text-label-md font-label-md text-price-primary mb-1" for="f_address">Delivery address</label><textarea class="w-full px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg text-body-md focus:outline-none focus:border-primary-container" id="f_address" name="address" placeholder="Town, estate / street, landmark" rows="2"></textarea><p class="text-xs text-danger mt-1 hidden" data-err="address"></p></div>
<p class="text-xs text-secondary -mt-2" id="delivNote">Free pickup. Bring your ID and the order ID.</p>
<fieldset><legend class="block text-label-md font-label-md text-price-primary mb-2">Payment method</legend>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${Object.entries(PAY).map(([k, v], i) => `<label class="flex items-center gap-2 p-3 border border-surface-border rounded-lg cursor-pointer has-[:checked]:border-primary-container has-[:checked]:bg-surface-subtle"><input ${i === 0 ? 'checked' : ''} class="text-primary-container" name="pay" type="radio" value="${k}"/>${icon(v.icon, 'text-lg text-primary')}<span class="text-body-sm font-semibold text-price-primary">${v.label}</span></label>`).join('')}</div>
<div class="mt-3 p-3 bg-surface-container-low border border-surface-border rounded-lg text-body-sm text-secondary" id="payNote"></div></fieldset>
<div id="refWrap">${fld('M-PESA confirmation code <span class="font-normal text-secondary">(optional, add it once you have paid)</span>', 'ref', 'text', 'autocapitalize="characters" maxlength="12" placeholder="e.g. SH12ABC3DE"')}</div>
<div><label class="block text-label-md font-label-md text-price-primary mb-1" for="f_notes">Notes <span class="font-normal text-secondary">(optional)</span></label><textarea class="w-full px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg text-body-md focus:outline-none focus:border-primary-container" id="f_notes" name="notes" placeholder="Colour preference, delivery time, anything we should know" rows="2"></textarea></div>
<button class="w-full h-12 bg-primary-container text-white rounded-lg text-label-md font-label-md font-bold hover:bg-primary active:scale-95 transition" type="submit">Place order · ${kes(cartTotal())}</button>
<p class="text-xs text-secondary text-center">After you place the order, send it to us on WhatsApp to confirm stock and payment.</p>
</form>`);
  const form = $('#checkoutForm', box);
  const upd = () => {
    const m = payVal(form), d = form.delivery.value;
    $('#payNote', box).innerHTML = payNote(m, cartTotal());
    $('#refWrap', box).classList.toggle('hidden', m !== 'pochi');
    $('#addrWrap', box).classList.toggle('hidden', d === 'pickup');
    $('#delivNote', box).textContent = d === 'pickup' ? 'Free pickup. Bring your ID and the order ID.' : 'The delivery fee depends on your location. We confirm it on WhatsApp before you pay.';
  };
  form.addEventListener('change', upd); upd();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => form.elements[n].value.trim();
    const m = payVal(form), d = form.delivery.value;
    setErr(form, 'name', v('name').length < 2 ? 'Enter your full name.' : '');
    setErr(form, 'phone', !okPhone(v('phone')) ? 'Enter a valid phone number.' : '');
    const needEmail = m === 'paypal' || m === 'card';
    setErr(form, 'email', v('email') && !okEmail(v('email')) ? 'Enter a valid email address.' : (needEmail && !v('email') ? 'Email is required for this payment method.' : ''));
    setErr(form, 'address', d !== 'pickup' && v('address').length < 4 ? 'Enter where we should deliver.' : '');
    if ($('[data-err]:not(.hidden)', form)) { firstError(form); return; }
    const id = 'DAI-' + Date.now().toString(36).slice(-5).toUpperCase() + Math.floor(Math.random() * 90 + 10);
    const order = {
      id, date: new Date().toISOString(),
      items: Object.entries(cart).map(([pid, q]) => ({id: pid, name: byId(pid).name, price: byId(pid).price, qty: q})),
      total: cartTotal(),
      customer: {name: v('name'), phone: v('phone'), email: v('email')},
      delivery: d, address: v('address'), pay: m, ref: m === 'pochi' ? v('ref').toUpperCase() : '', notes: v('notes'),
      user: session ? session.id : null
    };
    orders.unshift(order); store.set('orders', orders);
    cart = {}; saveCart();
    showOrderDone(order);
  });
}
function orderText(o) {
  return `*New order ${o.id}*\n` + o.items.map(i => `• ${i.name} x${i.qty} – ${kes(i.price * i.qty)}`).join('\n') +
    `\n*Total:* ${kes(o.total)}\n*Name:* ${o.customer.name}\n*Phone:* ${o.customer.phone}` + (o.customer.email ? `\n*Email:* ${o.customer.email}` : '') +
    `\n*Delivery:* ${DELIV[o.delivery]}` + (o.address ? `\n*Address:* ${o.address}` : '') +
    `\n*Payment:* ${PAY[o.pay].label}` + (o.ref ? `\n*M-PESA code:* ${o.ref}` : '') + (o.notes ? `\n*Notes:* ${o.notes}` : '');
}
function showOrderDone(o) {
  const box = openModal(`<div class="p-6 text-center">
<div class="w-14 h-14 mx-auto rounded-full bg-mpesa-green/10 text-mpesa-green flex items-center justify-center">${icon('check_circle', 'text-4xl')}</div>
<h3 class="mt-3 text-headline-md font-headline-md text-price-primary">Order placed</h3>
<p class="text-body-sm text-secondary mt-1">Order ID <b class="text-price-primary">${o.id}</b></p>
<div class="mt-4 text-left p-3 bg-surface-subtle border border-surface-border rounded-lg text-body-sm space-y-1">
${o.items.map(i => `<div class="flex justify-between gap-3"><span class="text-secondary">${esc(i.name)} × ${i.qty}</span><span class="font-semibold">${kes(i.price * i.qty)}</span></div>`).join('')}
<div class="flex justify-between pt-2 border-t border-surface-border font-bold text-price-primary"><span>Total</span><span>${kes(o.total)}</span></div>
</div>
<div class="mt-3 text-left p-3 bg-surface-container-low border border-surface-border rounded-lg text-body-sm text-secondary">${payNote(o.pay, o.total)}</div>
<p class="mt-3 text-body-sm text-secondary">Last step: send this order to us on WhatsApp so we can confirm stock and payment.</p>
<a class="mt-3 h-12 bg-mpesa-green text-white rounded-lg text-label-md font-bold flex items-center justify-center gap-2 hover:opacity-90" href="${waLink(orderText(o))}" rel="noopener" target="_blank">${icon('chat', 'text-lg')}<span>Send order on WhatsApp</span></a>
<div class="mt-2 grid grid-cols-2 gap-2"><button class="h-10 border border-surface-border rounded-lg text-label-md font-bold text-price-primary hover:bg-surface-subtle" data-track="${o.id}" type="button">Track order</button><button class="h-10 border border-surface-border rounded-lg text-label-md font-bold text-price-primary hover:bg-surface-subtle" data-close-modal type="button">Keep shopping</button></div>
</div>`);
  box.addEventListener('click', e => { const t = e.target.closest('[data-track]'); if (t) openTrack(t.dataset.track); });
}

/* ---------- Order tracking ---------- */
function openTrack(prefill) {
  const box = openModal(`<div class="p-5 sm:p-6">
<h3 class="text-headline-md font-headline-md text-price-primary pr-8">Track your order</h3>
<p class="text-body-sm text-secondary mt-1">Enter the order ID from your confirmation (for example DAI-AB12345).</p>
<form class="mt-4 flex gap-2" id="trackForm"><input class="${inputCls} uppercase" id="trackId" placeholder="Order ID" value="${esc(prefill || '')}"/><button class="h-11 px-5 bg-primary-container text-white rounded-lg text-label-md font-bold flex-shrink-0" type="submit">Track</button></form>
<div class="mt-4" id="trackResult"></div></div>`);
  const run = () => {
    const id = $('#trackId', box).value.trim().toUpperCase(), out = $('#trackResult', box);
    if (!id) { out.innerHTML = ''; return; }
    const o = orders.find(x => x.id === id);
    if (!o) { out.innerHTML = `<div class="p-3 bg-tertiary-fixed/40 rounded-lg text-body-sm text-on-surface">We could not find <b>${esc(id)}</b> on this device. If you ordered on another phone, send the order ID on WhatsApp and we will check it for you.<a class="mt-3 h-10 border border-mpesa-green text-mpesa-green rounded-lg text-label-md font-bold flex items-center justify-center gap-2" href="${waLink('Hello Daisolve, please check the status of order ' + id)}" rel="noopener" target="_blank">${icon('chat', 'text-lg')}<span>Ask on WhatsApp</span></a></div>`; return; }
    const steps = [['Order received', 'We have your order details.', true], ['Payment confirmation', 'We confirm your payment after you send the order on WhatsApp.', false],
      [o.delivery === 'pickup' ? 'Ready for collection' : 'Out for delivery', o.delivery === 'pickup' ? 'Collect at Jamia Shopping Mall, Nairobi CBD.' : 'Your phone is dispatched after payment is confirmed.', false], [o.delivery === 'pickup' ? 'Collected' : 'Delivered', '', false]];
    out.innerHTML = `<div class="p-3 bg-surface-subtle border border-surface-border rounded-lg text-body-sm"><div class="flex justify-between"><b class="text-price-primary">${o.id}</b><span class="text-secondary">${new Date(o.date).toLocaleDateString('en-KE', {day: 'numeric', month: 'short', year: 'numeric'})}</span></div><p class="text-secondary mt-1">${o.items.map(i => esc(i.name) + ' × ' + i.qty).join(', ')} · ${kes(o.total)}</p><p class="text-secondary">Payment: ${PAY[o.pay].label}</p></div>
<ol class="mt-4 space-y-3">${steps.map((s, i) => `<li class="flex gap-3"><span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s[2] ? 'bg-mpesa-green text-white' : (i === 1 ? 'bg-primary-container text-white' : 'bg-surface-border text-secondary')}">${s[2] ? '✓' : i + 1}</span><span><b class="block text-label-md text-price-primary">${s[0]}</b><span class="text-xs text-secondary">${s[1]}</span></span></li>`).join('')}</ol>
<a class="mt-4 h-10 border border-mpesa-green text-mpesa-green rounded-lg text-label-md font-bold flex items-center justify-center gap-2 hover:bg-mpesa-green hover:text-white transition-colors" href="${waLink(orderText(o))}" rel="noopener" target="_blank">${icon('chat', 'text-lg')}<span>Send order details on WhatsApp</span></a>`;
  };
  $('#trackForm', box).addEventListener('submit', e => { e.preventDefault(); run(); });
  if (prefill) run();
}

/* ---------- Account (stored on this device) ---------- */
/* ---------- Database accounts + reviews (Supabase Auth) ---------- */
const AUTH_ERR = {
  invalid_credentials: 'Incorrect email or password.', email_not_confirmed: 'Please confirm your email first. Open the link we sent you (check spam too), then sign in.',
  user_already_exists: 'This email already has an account. Sign in instead.', weak_password: 'Use at least 6 characters.',
  over_email_send_rate_limit: 'Too many attempts. Please wait a few minutes and try again.', over_request_rate_limit: 'Too many attempts. Please wait a few minutes and try again.',
  email_address_invalid: 'Enter a valid email address.', signup_disabled: 'Sign up is currently unavailable.'
};
async function sbFetch(path, opts, token) {
  const S = window.DAI_SUPABASE;
  if (!S) throw Object.assign(new Error('Could not reach the database. Please refresh and try again.'), {code: 'offline'});
  const o = Object.assign({}, opts); o.headers = Object.assign({apikey: S.key, Authorization: 'Bearer ' + (token || S.key), 'Content-Type': 'application/json'}, o.headers);
  let r; try { r = await fetch(S.url + path, o); } catch (e) { throw Object.assign(new Error('No internet connection. Please try again.'), {code: 'offline'}); }
  let d = null; try { d = await r.json(); } catch (e) {}
  if (!r.ok) {
    const code = (d && (d.error_code || d.code)) || '', msg = (d && (d.msg || d.message || d.error_description)) || '';
    const e = new Error(AUTH_ERR[code] || (/already registered/i.test(msg) ? AUTH_ERR.user_already_exists : /not confirmed/i.test(msg) ? AUTH_ERR.email_not_confirmed : /invalid login/i.test(msg) ? AUTH_ERR.invalid_credentials : 'Something went wrong. Please try again.'));
    e.code = code || (/not confirmed/i.test(msg) ? 'email_not_confirmed' : /invalid login/i.test(msg) ? 'invalid_credentials' : /already registered/i.test(msg) ? 'user_already_exists' : ''); e.status = r.status; throw e;
  }
  return d;
}
function setSession(d) {
  const u = d.user || {}, m = u.user_metadata || {};
  session = {id: u.id, name: m.name || (u.email || 'Customer').split('@')[0], phone: m.phone || '', email: u.email, token: d.access_token, refresh: d.refresh_token, exp: Math.floor(Date.now() / 1000) + (d.expires_in || 3600)};
  store.set('session', session); updateAccountLabel();
}
function clearSession() { session = null; store.set('session', null); updateAccountLabel(); }
async function getToken() {
  if (!session || !session.token) return null;
  if (session.exp - 60 > Date.now() / 1000) return session.token;
  try {
    const d = await sbFetch('/auth/v1/token?grant_type=refresh_token', {method: 'POST', body: JSON.stringify({refresh_token: session.refresh})});
    setSession(d); return session.token;
  } catch (e) { if (e.code !== 'offline') clearSession(); return null; }
}
async function verifySession() {
  if (!session) return;
  const t = await getToken(); if (!t) { if (session && !session.token) clearSession(); return; }
  try { await sbFetch('/auth/v1/user', {method: 'GET'}, t); }
  catch (e) { if (e.status === 401 || e.status === 403) clearSession(); }
}
let afterAuth = null, afterAuthInfo = null;   // what to do once signed in (e.g. open the review form), and a description of it we can save
/* The confirmation email link sends people back to the page they signed up on with the session in the URL hash.
   Grab it now (before the page's own hash routing runs) and clean the address bar. */
const AUTH_HASH = /access_token=|error_code=|[#&]error=/.test(location.hash) ? location.hash : '';
if (AUTH_HASH) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
async function finishEmailConfirm() {
  if (!AUTH_HASH) return;
  const q = new URLSearchParams(AUTH_HASH.replace(/^#/, ''));
  if (q.get('error') || !q.get('access_token')) { toast('That confirmation link has expired or was already used. Try signing in.'); openAccount('in'); return; }
  try {
    const u = await sbFetch('/auth/v1/user', {method: 'GET'}, q.get('access_token'));
    setSession({access_token: q.get('access_token'), refresh_token: q.get('refresh_token'), expires_in: +q.get('expires_in') || 3600, user: u});
  } catch (e) { toast('We could not finish signing you in. Please sign in with your email and password.'); openAccount('in'); return; }
  toast(`Email confirmed. Welcome, ${session.name.split(' ')[0]}!`);
  const pend = store.get('pending', null); store.set('pending', null);
  if (pend && Date.now() - pend.t < 864e5 && pend.kind === 'review' && currentProduct && currentProduct.id === pend.pid) openReviewForm(currentProduct);
  else if ($('#accountPage')) accountView();
}
function updateAccountLabel() {
  const l = $('a[href="#account"] span.text-label-md'); if (l) l.textContent = session ? session.name.split(' ')[0] : 'Account';
}
function mountAccount(html) {
  const prev = $('#accountPage');
  if (!prev) return openModal(html);
  const box = prev.cloneNode(false); prev.replaceWith(box); box.innerHTML = html;
  return box;
}
function openAccount(tab) {
  if (session) return accountView();
  tab = tab || 'in';
  const box = mountAccount(`<div class="p-5 sm:p-6">
<h3 class="text-headline-md font-headline-md text-price-primary pr-8">${tab === 'in' ? 'Sign in' : 'Create your account'}</h3>
<p class="text-body-sm text-secondary mt-1">Save your details for faster checkout and see your orders in one place.</p>
<form class="mt-4 space-y-3" id="authForm" novalidate="">
${tab === 'up' ? fld('Full name', 'name', 'text', 'autocomplete="name"') + fld('Phone number', 'phone', 'tel', 'autocomplete="tel"') : ''}
${fld('Email', 'id', 'email', 'autocomplete="username"')}
${fld('Password', 'pw', 'password', `autocomplete="${tab === 'in' ? 'current-password' : 'new-password'}" minlength="6"`)}
<button class="w-full h-11 bg-primary-container text-white rounded-lg text-label-md font-bold hover:bg-primary active:scale-95 transition" type="submit">${tab === 'in' ? 'Sign in' : 'Create account'}</button>
</form>
<p class="mt-4 text-body-sm text-secondary text-center">${tab === 'in' ? 'New here?' : 'Already registered?'} <button class="text-primary font-bold underline" data-auth-tab="${tab === 'in' ? 'up' : 'in'}" type="button">${tab === 'in' ? 'Create an account' : 'Sign in'}</button></p>
${afterAuth ? '<p class="mt-3 text-body-sm text-primary text-center font-bold">Sign in to write your review.</p>' : ''}</div>`);
  box.addEventListener('click', e => { const t = e.target.closest('[data-auth-tab]'); if (t) openAccount(t.dataset.authTab); });
  const form = $('#authForm', box);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const v = n => form.elements[n] ? form.elements[n].value.trim() : '';
    const btn = $('button[type="submit"]', form), label = btn.textContent;
    const fail = (name, err) => { setErr(form, name, err.message); firstError(form); btn.disabled = false; btn.textContent = label; };
    let d;
    if (tab === 'up') {
      setErr(form, 'name', v('name').length < 2 ? 'Enter your full name.' : '');
      setErr(form, 'phone', !okPhone(v('phone')) ? 'Enter a valid phone number.' : '');
      setErr(form, 'id', !okEmail(v('id')) ? 'Enter a valid email address.' : '');
      setErr(form, 'pw', v('pw').length < 6 ? 'Use at least 6 characters.' : '');
      if ($('[data-err]:not(.hidden)', form)) { firstError(form); return; }
      btn.disabled = true; btn.textContent = 'Creating account...';
      try { d = await sbFetch('/auth/v1/signup?redirect_to=' + encodeURIComponent(location.origin + location.pathname + location.search), {method: 'POST', body: JSON.stringify({email: v('id').toLowerCase(), password: v('pw'), data: {name: v('name'), phone: v('phone')}})}); }
      catch (err) { fail(err.code === 'weak_password' ? 'pw' : 'id', err); return; }
      const u = d.user || d;
      if (u && Array.isArray(u.identities) && !u.identities.length) { fail('id', new Error(AUTH_ERR.user_already_exists)); return; }
      if (!d.access_token) {   // email confirmation is switched on
        store.set('pending', afterAuthInfo ? Object.assign({t: Date.now()}, afterAuthInfo) : null);
        box.innerHTML = `<div class="p-6 text-center"><span class="material-symbols-outlined text-5xl text-mpesa-green">mark_email_read</span><h3 class="mt-2 text-headline-md font-headline-md text-price-primary">Check your email</h3><p class="mt-2 text-body-md text-secondary">Your account is created. We sent a confirmation link to <b>${esc(v('id'))}</b>. Open it and you will be signed in and brought straight back to this page.</p><button class="mt-5 h-11 px-6 bg-primary-container text-white rounded-lg text-label-md font-bold hover:bg-primary" data-auth-tab="in" type="button">Go to sign in</button></div>`;
        return;
      }
    } else {
      setErr(form, 'id', !okEmail(v('id')) ? 'Enter your email address.' : '');
      setErr(form, 'pw', !v('pw') ? 'Enter your password.' : '');
      if ($('[data-err]:not(.hidden)', form)) { firstError(form); return; }
      btn.disabled = true; btn.textContent = 'Signing in...';
      try { d = await sbFetch('/auth/v1/token?grant_type=password', {method: 'POST', body: JSON.stringify({email: v('id').toLowerCase(), password: v('pw')})}); }
      catch (err) { fail(err.code === 'email_not_confirmed' ? 'id' : 'pw', err); return; }
    }
    setSession(d);
    toast(`Welcome, ${session.name.split(' ')[0]}`);
    const next = afterAuth; afterAuth = null; afterAuthInfo = null;
    if (next) { closeModal(); next(); } else accountView();
  });
}
/* ---------- Customer reviews (stored in the database) ---------- */
const starRow = (n, c = 'text-sm') => Array.from({length: 5}, (_, i) => `<span class="material-symbols-outlined ${c} text-tertiary-container" style="font-variation-settings:'FILL' ${i < n ? 1 : 0};">star</span>`).join('');
const niceDate = d => { try { return new Date(d).toLocaleDateString('en-KE', {day: 'numeric', month: 'short', year: 'numeric'}); } catch (e) { return ''; } };
async function loadDbReviews(pid) {
  const box = $('#dbReviews'); if (!box) return;
  try {
    const rows = await sbFetch('/rest/v1/reviews?select=author_name,rating,body,created_at&order=created_at.desc&limit=100&product_id=eq.' + encodeURIComponent(pid), {method: 'GET'});
    if (!rows || !rows.length) { box.innerHTML = ''; return; }
    const avg = rows.reduce((t, r) => t + r.rating, 0) / rows.length;
    box.innerHTML = `<div class="mt-4 pt-4 border-t border-surface-border"><h3 class="text-label-md font-bold text-price-primary">Reviews from our customers <span class="text-secondary font-normal">(${rows.length} · ${avg.toFixed(1)} average)</span></h3>
<div class="divide-y divide-surface-border">${rows.map(r => `<div class="py-4"><div class="flex justify-between items-start gap-3"><div><span class="font-bold text-body-md text-price-primary">${esc(r.author_name)}</span><div class="flex items-center mt-1">${starRow(r.rating)}</div></div><span class="text-outline text-body-sm whitespace-nowrap">${esc(niceDate(r.created_at))}</span></div><p class="text-body-md text-on-surface mt-2 leading-relaxed whitespace-pre-line">${esc(r.body)}</p></div>`).join('')}</div></div>`;
  } catch (e) { /* reviews are optional: leave the page as is */ }
}
function startReview(p) {
  if (!session || !session.token) { afterAuth = () => openReviewForm(p); afterAuthInfo = {kind: 'review', pid: p.id}; openAccount('in'); return; }
  openReviewForm(p);
}
function openReviewForm(p) {
  const box = openModal(`<form class="p-5 sm:p-6 space-y-3" id="reviewForm" novalidate="">
<h3 class="text-headline-md font-headline-md text-price-primary pr-8">Review ${esc(p.name)}</h3>
<p class="text-body-sm text-secondary">Posting as <b>${esc(session.name)}</b>.</p>
<div><span class="block text-label-md mb-1">Your rating</span><div class="flex gap-1" id="rvStars" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map(n => `<button aria-label="${n} star${n > 1 ? 's' : ''}" class="p-0.5" data-star="${n}" type="button"><span class="material-symbols-outlined text-3xl text-tertiary-container" style="font-variation-settings:'FILL' 0;">star</span></button>`).join('')}</div><p class="text-xs text-danger mt-1 hidden" data-err="rating"></p></div>
<div><label class="block text-label-md mb-1" for="rv_body">Your review</label><textarea class="${inputCls} h-32 py-2" id="rv_body" maxlength="1500" name="body" placeholder="What did you like or dislike about this phone?"></textarea><p class="text-xs text-danger mt-1 hidden" data-err="body"></p></div>
<button class="w-full h-11 bg-primary-container text-white rounded-lg text-label-md font-bold hover:bg-primary active:scale-95 transition" type="submit">Post review</button></form>`);
  let rating = 0;
  const paint = n => $$('#rvStars [data-star]', box).forEach((b, i) => { b.firstChild.style.fontVariationSettings = `'FILL' ${i < n ? 1 : 0}`; });
  $('#rvStars', box).addEventListener('click', e => { const b = e.target.closest('[data-star]'); if (b) { rating = +b.dataset.star; paint(rating); setErr($('#reviewForm', box), 'rating', ''); } });
  const form = $('#reviewForm', box);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const body = form.elements.body.value.trim();
    setErr(form, 'rating', rating ? '' : 'Choose a star rating.');
    setErr(form, 'body', body.length < 5 ? 'Write at least a few words.' : '');
    if ($('[data-err]:not(.hidden)', form)) return;
    const btn = $('button[type="submit"]', form); btn.disabled = true; btn.textContent = 'Posting...';
    try {
      const tk = await getToken(); if (!tk) throw Object.assign(new Error('Please sign in again.'), {code: 'not_signed_in'});
      await sbFetch('/rest/v1/reviews?on_conflict=product_id,user_id', {method: 'POST', headers: {Prefer: 'resolution=merge-duplicates,return=minimal'}, body: JSON.stringify({product_id: p.id, rating, body})}, tk);
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Post review';
      if (err.code === 'not_signed_in') { clearSession(); closeModal(); afterAuth = () => openReviewForm(p); afterAuthInfo = {kind: 'review', pid: p.id}; openAccount('in'); toast('Please sign in again'); return; }
      setErr(form, 'body', err.message); return;
    }
    closeModal(); toast('Thank you! Your review is live.'); loadDbReviews(p.id);
    const sec = $('#reviews'); if (sec) sec.scrollIntoView({behavior: 'smooth', block: 'start'});
  });
}
function accountView() {
  const mine = orders.filter(o => o.user === session.id);
  const box = mountAccount(`<div class="p-5 sm:p-6">
<div class="flex items-center gap-3 pr-8"><span class="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center text-xl font-bold">${esc(session.name.charAt(0).toUpperCase())}</span><div><h3 class="text-headline-sm font-headline-sm text-price-primary">${esc(session.name)}</h3><p class="text-xs text-secondary">${esc(session.email)} · ${esc(session.phone)}</p></div></div>
<h4 class="mt-5 text-label-md font-label-md text-price-primary">Your orders</h4>
<div class="mt-2 space-y-2">${mine.length ? mine.map(o => `<button class="w-full text-left p-3 border border-surface-border rounded-lg hover:bg-surface-subtle" data-track="${o.id}" type="button"><span class="flex justify-between text-label-md"><b class="text-price-primary">${o.id}</b><span>${kes(o.total)}</span></span><span class="text-xs text-secondary">${o.items.map(i => esc(i.name)).join(', ')}</span></button>`).join('') : '<p class="text-body-sm text-secondary p-3 bg-surface-subtle rounded-lg">No orders yet. Orders you place while signed in appear here.</p>'}</div>
<div class="mt-4 grid grid-cols-2 gap-2"><button class="h-10 border border-surface-border rounded-lg text-label-md font-bold text-price-primary hover:bg-surface-subtle" data-act="wish" type="button">Wishlist (${wish.length})</button><button class="h-10 border border-surface-border rounded-lg text-label-md font-bold text-price-primary hover:bg-surface-subtle" data-act="track" type="button">Track an order</button></div>
<button class="mt-2 w-full h-10 text-danger text-label-md font-bold hover:bg-error-container rounded-lg" data-signout type="button">Sign out</button></div>`);
  box.addEventListener('click', e => {
    const t = e.target.closest('[data-track]'); if (t) openTrack(t.dataset.track);
    if (e.target.closest('[data-signout]')) { const tk = session && session.token; if (tk) sbFetch('/auth/v1/logout', {method: 'POST'}, tk).catch(() => {}); clearSession(); closeModal(); toast('You have signed out'); if ($('#accountPage')) openAccount(); }
  });
}

/* ---------- Trade-in & compare ---------- */
function openTradeIn() {
  const box = openModal(`<form class="p-5 sm:p-6 space-y-3" id="tradeForm" novalidate="">
<h3 class="text-headline-md font-headline-md text-price-primary pr-8">Trade in your phone</h3>
<p class="text-body-sm text-secondary">Tell us about your current phone. We confirm the final value after a quick inspection at Jamia Shopping Mall.</p>
<div class="grid grid-cols-2 gap-3">
<div><label class="block text-label-md mb-1" for="t_brand">Brand</label><select class="${inputCls}" id="t_brand" name="brand">${['Samsung', 'Apple', 'Tecno', 'Infinix', 'Xiaomi', 'Oppo', 'Vivo', 'Nokia', 'Other'].map(b => `<option>${b}</option>`).join('')}</select></div>
<div>${fld('Model', 'model', 'text', 'placeholder="e.g. Galaxy A52"')}</div>
<div><label class="block text-label-md mb-1" for="t_cond">Condition</label><select class="${inputCls}" id="t_cond" name="cond"><option>Like new</option><option>Good, light scratches</option><option>Fair, visible wear</option><option>Cracked screen or damaged</option></select></div>
<div><label class="block text-label-md mb-1" for="t_up">I want to buy</label><select class="${inputCls}" id="t_up" name="up">${products.map(p => `<option>${esc(p.name)} (${kes(p.price)})</option>`).join('')}</select></div>
</div>
${fld('Your name', 'name', 'text', 'autocomplete="name"', session ? session.name : '')}
${fld('Phone / WhatsApp', 'phone', 'tel', 'autocomplete="tel"', session ? session.phone : '')}
<button class="w-full h-11 bg-mpesa-green text-white rounded-lg text-label-md font-bold flex items-center justify-center gap-2 hover:opacity-90" type="submit">${icon('chat', 'text-lg')}<span>Request valuation on WhatsApp</span></button></form>`);
  const form = $('#tradeForm', box);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => form.elements[n].value.trim();
    setErr(form, 'model', v('model').length < 2 ? 'Enter your phone model.' : '');
    setErr(form, 'name', v('name').length < 2 ? 'Enter your name.' : '');
    setErr(form, 'phone', !okPhone(v('phone')) ? 'Enter a valid phone number.' : '');
    if ($('[data-err]:not(.hidden)', form)) { firstError(form); return; }
    const t = `Hello Daisolve, I would like a trade-in valuation.\nMy phone: ${v('brand')} ${v('model')} (${v('cond')})\nI want to buy: ${v('up')}\nName: ${v('name')}\nPhone: ${v('phone')}`;
    window.open(waLink(t), '_blank', 'noopener');
    closeModal(); toast('Opening WhatsApp with your valuation request');
  });
}
function openCompare() {
  const rows = [['Price', kes(byId('tecno-camon-30-pro-5g').price), kes(byId('infinix-note-40-pro').price)], ['Memory', '12GB RAM · 512GB', '8GB RAM · 256GB'], ['Display', '6.78" curved AMOLED, 120Hz', '6.78" 3D-curved AMOLED, 120Hz'], ['Main camera', '50MP Sony IMX890 with OIS', '108MP'], ['Battery', '5000mAh', '5000mAh'], ['Charging', '70W wired', '70W wired + 20W wireless MagCharge pad in the box'], ['Network', '5G', '4G']];
  const box = openModal(`<div class="p-5 sm:p-6"><h3 class="text-headline-md font-headline-md text-price-primary pr-8">Tecno Camon 30 Pro 5G vs Infinix Note 40 Pro</h3>
<div class="mt-4 overflow-x-auto"><table class="w-full text-body-sm"><thead><tr class="text-left text-price-primary"><th class="py-2 pr-3 w-24"></th><th class="py-2 pr-3">Camon 30 Pro 5G</th><th class="py-2">Note 40 Pro</th></tr></thead><tbody>${rows.map(r => `<tr class="border-t border-surface-border align-top"><td class="py-2 pr-3 font-semibold text-price-primary">${r[0]}</td><td class="py-2 pr-3 text-secondary">${r[1]}</td><td class="py-2 text-secondary">${r[2]}</td></tr>`).join('')}</tbody></table></div>
<p class="mt-3 text-xs text-secondary">The Camon is the pick for night photography. The Note 40 Pro costs less and includes a wireless charging pad.</p>
<div class="mt-4 grid grid-cols-2 gap-2"><button class="h-10 bg-primary-container text-white rounded-lg text-label-md font-bold" data-cmp-add="tecno-camon-30-pro-5g" type="button">Add Camon</button><button class="h-10 bg-primary-container text-white rounded-lg text-label-md font-bold" data-cmp-add="infinix-note-40-pro" type="button">Add Note 40 Pro</button></div></div>`, true);
  box.addEventListener('click', e => { const b = e.target.closest('[data-cmp-add]'); if (b) { addToCart(b.dataset.cmpAdd); closeModal(); } });
}

/* ---------- Articles & info pages ---------- */
function articleBox() { location.href = '/blog'; }
function articleList() { location.href = '/blog'; }
const li = a => `<ul class="list-disc pl-5 space-y-1.5">${a.map(x => `<li>${x}</li>`).join('')}</ul>`;
const INFO = {
  warranty: ['Warranty policy', `<p>Every phone is brand sealed and covered by the manufacturer's warranty, usually 1–2 years depending on brand and model. Apple phones carry the official 1-year Apple warranty.</p>${li(['Claims are handled through the brand\'s certified service centres (for example Carlcare for Tecno and Infinix, and Samsung service centres).', 'Keep your receipt and the original box.', 'Physical damage, liquid damage and unauthorised repairs are not covered.', 'If your phone has a fault on arrival, message us on WhatsApp with your order ID and we will help you through the claim.'])}`],
  delivery: ['Same-day Nairobi delivery', `${li(['Nairobi: delivery within about 3 hours once your payment is confirmed.', 'Outside Nairobi: we dispatch by parcel to your town, anywhere in Kenya.', 'International shipping is available on request.', 'The delivery fee depends on your location. We confirm it on WhatsApp before you pay.', 'Free collection at Jamia Shopping Mall, Nairobi CBD. Bring your ID and order ID.'])}<p class="mt-3">Open Mon – Sat 8:00 AM – 7:30 PM and Sun 10:00 AM – 4:00 PM.</p>`],
  trade: ['Trade-in program', `<p>Bring your current phone, get its value as credit toward a new one, and pay the balance by M-PESA Pochi, bank transfer, card or PayPal. We inspect the screen, body, battery and function, and confirm the final value at the shop.</p><button class="mt-4 h-11 w-full bg-primary-container text-white rounded-lg text-label-md font-bold" data-act="trade" type="button">Request a valuation</button>`],
  terms: ['Terms of service', li(['Prices are in Kenya shillings (KSh) and depend on stock. We confirm availability before you pay.', 'An order is confirmed once we have confirmed your payment.', 'We accept M-PESA Pochi la Biashara, bank transfer, Visa, Mastercard, PayPal and other international providers on request.', 'You may inspect your phone and check its IMEI and serial number when you collect or receive it.', 'Warranty is provided by the manufacturer under the warranty policy.', 'Questions? Call or WhatsApp +254 790 835039.'])],
  privacy: ['Privacy policy', `<p>We collect your name, phone number, email and delivery address only to process your order and support you afterwards. We do not sell your details.</p>${li(['Your cart and wishlist are saved in your browser. Your account details and reviews are stored securely in our database.', 'When you send an order on WhatsApp, it is handled under WhatsApp\'s own terms.', 'Card details are never entered or stored on this website.', 'We use cookies and similar browser storage to keep you signed in, remember your cart and wishlist, and remember your cookie choice. We do not use advertising cookies. <button class="text-primary font-bold underline" data-cookie-settings type="button">Change your cookie choice</button>.', 'To have your details removed, message us on WhatsApp.'])}`]
};
function openInfo(key) {
  const [title, body] = INFO[key];
  openModal(`<div class="p-5 sm:p-6"><h3 class="text-headline-md font-headline-md text-price-primary pr-8">${title}</h3><div class="mt-3 text-body-md text-secondary leading-relaxed">${body}</div></div>`);
}
function openSitemap() {
  const links = [['Home', 'top'], ['Shop all phones', 'catalogue'], ['Brands', 'brands'], ['Deals', 'deals'], ['Blog', 'blog'], ['About us', 'about'], ['Contact', 'contact']];
  const box = openModal(`<div class="p-5 sm:p-6"><h3 class="text-headline-md font-headline-md text-price-primary pr-8">Sitemap</h3><div class="mt-3 grid grid-cols-2 gap-2">${links.map(l => `<button class="text-left px-3 py-2.5 border border-surface-border rounded-lg text-label-md font-semibold text-price-primary hover:bg-surface-subtle" data-go="${l[1]}" type="button">${l[0]}</button>`).join('')}</div></div>`);
  box.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (!b) return; closeModal(); b.dataset.go === 'top' ? goTop() : scrollToId(b.dataset.go); });
}

/* ---------- Action router ---------- */
const ACTIONS = {
  shop() { closeModal(); closeDrawers(); if (!catalogueVisible()) { location.href = '/shop'; return; } clearFilters(); render(); scrollToId('catalogue'); },
  cart: openCart, wish: openWish, account: () => openAccount(), track: () => openTrack(), trade: openTradeIn, compare: openCompare,
  contact() { closeModal(); closeDrawers(); scrollToId('contact'); }
};
function act(name) { closeNavDrawer(); (ACTIONS[name] || (() => {}))(); }

const LABELS = [
  [/^Buy iPhone 15 Pro$/, () => { addToCart('apple-iphone-15-pro-max', 1, true); openCart(); }],
  [/^View Apple Store$/, () => { clearFilters(); setFilters({brands: ['apple']}); }],
  [/^Order Now$/, () => { addToCart('tecno-camon-30-pro-5g', 1, true); openCart(); }],
  [/^Grab Deal$/, () => { addToCart('infinix-note-40-pro', 1, true); openCart(); }],
  [/^Compare Specs$/, openCompare],
  [/^Check Trade-In Value$/, openTradeIn],
  [/^Explore 20\d\d Models$/, () => { clearFilters(); setFilters({sort: 'newest'}); setSortUI('newest'); }],
  [/^View Budget Picks$/, () => { clearFilters(); setFilters({cat: 'under20k', sort: 'low-high'}); setSortUI('low-high'); }],
  [/^Discover Flagships$/, () => { clearFilters(); setFilters({cat: 'flagship', sort: 'high-low'}); setSortUI('high-low'); }],
  [/^Grab Deals Now$/, () => { clearFilters(); setFilters({sort: 'discount'}); setSortUI('discount'); }],
  [/^(All Brands|View All \d+ Phones|View All Phones)$/, () => ACTIONS.shop()],
  [/^Warranty Policy$/, () => openInfo('warranty')],
  [/^Same-Day Nairobi Delivery$/, () => openInfo('delivery')],
  [/^Trade-In Program$/, () => openInfo('trade')],
  [/^Terms of Service$/, () => openInfo('terms')],
  [/^Privacy Policy$/, () => openInfo('privacy')],
  [/^Sitemap$/, openSitemap],
  [/^Order Tracking$/, () => openTrack()],
  [/^Customer Support$/, () => ACTIONS.contact()],
  [/^Samsung Kenya$/, () => { clearFilters(); setFilters({brands: ['samsung']}); }],
  [/^Apple iPhones$/, () => { clearFilters(); setFilters({brands: ['apple']}); }],
  [/^Tecno Mobile$/, () => { clearFilters(); setFilters({brands: ['tecno']}); }],
  [/^Infinix Kenya$/, () => { clearFilters(); setFilters({brands: ['infinix']}); }],
  [/^Xiaomi Redmi$/, () => { clearFilters(); setFilters({brands: ['xiaomi']}); }],
  [/^Oppo & Vivo$/, () => { clearFilters(); setFilters({brands: ['oppo', 'vivo']}); }]
];
const labelOf = el => { const c = el.cloneNode(true); $$('.material-symbols-outlined', c).forEach(i => i.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); };

function init() {
  const grid = $('#productGrid');
  if (grid) readProducts(); else loadStaticProducts();
  updateBadges();
  verifySession();

  // sort option + tabs ids
  const sel = $('#sortSelect');
  if (sel && !$('option[value="discount"]', sel)) sel.insertAdjacentHTML('beforeend', '<option value="discount">Biggest Discount</option>');
  if (sel) sel.addEventListener('change', () => { state.sort = sel.value; render(); });
  $$('.filter-tab').forEach(t => t.addEventListener('click', () => { state.cat = t.dataset.category; state.shown = 8; render(); }));
  const viewAll = $$('#catalogue a').find(a => /View All/.test(a.textContent)); if (viewAll) viewAll.id = 'viewAllLink';

  // filter bar + empty state
  if (grid) grid.insertAdjacentHTML('beforebegin', '<div class="hidden flex flex-wrap items-center gap-2 mb-4" id="filterBar"></div>');
  if (grid) grid.insertAdjacentHTML('afterend', `<div class="hidden text-center py-12" id="emptyState">${icon('search_off', 'text-5xl text-outline-variant')}<p class="mt-2 text-headline-sm font-headline-sm text-price-primary">No phones match your search</p><p class="text-body-sm text-secondary">Try a different name, or ask us on WhatsApp and we will source it.</p><div class="mt-4 flex justify-center gap-2"><button class="h-10 px-4 border border-surface-border rounded-lg text-label-md font-bold" data-clear-filters type="button">Clear filters</button><a class="h-10 px-4 bg-mpesa-green text-white rounded-lg text-label-md font-bold flex items-center gap-2" href="${waLink('Hello Daisolve, I am looking for a phone I could not find on your website.')}" rel="noopener" target="_blank">${icon('chat', 'text-lg')}<span>WhatsApp us</span></a></div></div>`);

  // brand chips
  $$('.brand-chip').forEach(c => c.addEventListener('click', () => {
    const b = c.dataset.brand;
    state.brands = state.brands.includes(b) ? [] : [b]; state.shown = 8; render();
    if (state.brands.length) scrollToId('catalogue');
  }));

  // load more
  if ($('#loadMoreBtn')) $('#loadMoreBtn').addEventListener('click', () => {
    const btn = $('#loadMoreBtn');
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-lg">sync</span><span>Loading…</span>';
    setTimeout(() => { state.shown += PAGE; btn.innerHTML = '<span class="material-symbols-outlined text-lg">sync</span><span>Load More Phones</span>'; render(); }, 400);
  });

  // product grid delegation
  if (grid) grid.addEventListener('click', e => {
    const card = e.target.closest('.product-card'); if (!card) return;
    const id = card.dataset.id;
    if (e.target.closest('.wishlist-btn')) { toggleWish(id); return; }
    if (e.target.closest('.add-cart-btn')) {
      addToCart(id);
      const b = e.target.closest('.add-cart-btn'), orig = b.innerHTML;
      b.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span><span>Added</span>';
      b.classList.replace('bg-primary-container', 'bg-mpesa-green');
      setTimeout(() => { b.innerHTML = orig; b.classList.replace('bg-mpesa-green', 'bg-primary-container'); }, 1200);
      return;
    }
    if (e.target.closest('a')) return;
    openQuickView(id);
  });

  // top-level shells
  document.body.insertAdjacentHTML('beforeend', `
<div class="fixed inset-0 bg-price-primary/60 backdrop-blur-sm z-[60] hidden" id="ovl"></div>
<aside aria-label="Shopping cart" class="fixed inset-y-0 right-0 w-[26rem] max-w-full bg-white z-[65] shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col" id="cartDrawer">
<div class="p-4 border-b border-surface-border flex items-center justify-between"><h3 class="text-headline-sm font-headline-sm text-price-primary">Your cart (<span id="cartDrawerCount">0</span>)</h3><button aria-label="Close cart" class="p-2 text-secondary hover:text-price-primary" data-close-drawers type="button">${icon('close')}</button></div>
<div class="flex-1 overflow-y-auto" id="cartBody"></div>
<div class="hidden p-4 border-t border-surface-border space-y-2" id="cartFoot">
<div class="flex justify-between text-label-md font-bold text-price-primary"><span>Subtotal</span><span id="cartSubtotal"></span></div>
<p class="text-xs text-secondary">Free pickup at Jamia Shopping Mall. Delivery fees are confirmed by location on WhatsApp.</p>
<button class="w-full h-12 bg-primary-container text-white rounded-lg text-label-md font-bold hover:bg-primary active:scale-95 transition" data-act-checkout type="button">Checkout</button>
<a class="h-11 border border-mpesa-green text-mpesa-green rounded-lg text-label-md font-bold flex items-center justify-center gap-2 hover:bg-mpesa-green hover:text-white transition-colors" data-cart-wa href="#" rel="noopener" target="_blank">${icon('chat', 'text-lg')}<span>Order on WhatsApp</span></a>
</div></aside>
<aside aria-label="Wishlist" class="fixed inset-y-0 right-0 w-[26rem] max-w-full bg-white z-[65] shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col" id="wishDrawer">
<div class="p-4 border-b border-surface-border flex items-center justify-between"><h3 class="text-headline-sm font-headline-sm text-price-primary">Wishlist</h3><button aria-label="Close wishlist" class="p-2 text-secondary hover:text-price-primary" data-close-drawers type="button">${icon('close')}</button></div>
<div class="flex-1 overflow-y-auto" id="wishBody"></div></aside>
<div class="fixed inset-0 z-[70] hidden items-end sm:items-center justify-center sm:p-4" id="modalRoot"><div class="absolute inset-0 bg-price-primary/60 backdrop-blur-sm" id="modalBg"></div><div id="modalBox"></div></div>
<div class="hidden fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 z-[90] bg-price-primary text-white text-body-sm font-medium px-4 py-3 rounded-lg shadow-xl max-w-[90vw] flex items-center" id="toast" role="status"></div>
<a aria-label="Chat with Daisolve on WhatsApp" class="fixed right-4 bottom-20 md:bottom-6 z-[45] w-12 h-12 rounded-full bg-mpesa-green text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform" href="${waLink('Hello Daisolve, I would like to ask about a phone.')}" rel="noopener" target="_blank">${icon('chat', 'text-2xl')}</a>`);

  $('#cartDrawer').addEventListener('click', e => {
    const b = e.target.closest('[data-cart-act]');
    if (b) {
      const id = b.dataset.id, a = b.dataset.cartAct;
      if (a === 'inc') cart[id] = Math.min(10, (cart[id] || 0) + 1);
      if (a === 'dec') { cart[id] = (cart[id] || 1) - 1; if (cart[id] <= 0) delete cart[id]; }
      if (a === 'del') delete cart[id];
      if (a === 'clear') cart = {};
      saveCart(); return;
    }
    if (e.target.closest('[data-act-checkout]')) openCheckout();
  });
  $('#cartDrawer').addEventListener('click', e => { if (e.target.closest('[data-cart-wa]')) e.target.closest('[data-cart-wa]').href = waLink(cartText()); }, true);
  $('#wishDrawer').addEventListener('click', e => {
    const b = e.target.closest('[data-wish-act]'), q = e.target.closest('[data-qv]');
    if (b) { if (b.dataset.wishAct === 'cart') addToCart(b.dataset.id); else toggleWish(b.dataset.id); }
    else if (q) openQuickView(q.dataset.qv);
  });
  const wpg = $('#wishPage');
  if (wpg) wpg.addEventListener('click', e => {
    const b = e.target.closest('[data-wish-act]');
    if (b) { if (b.dataset.wishAct === 'cart') addToCart(b.dataset.id); else toggleWish(b.dataset.id); }
  });
  $('#ovl').addEventListener('click', closeDrawers);
  $('#modalBg').addEventListener('click', () => closeModal());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawers(); closeNavDrawer(); } });

  // global delegation
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-close-modal]')) { closeModal(); return; }
    if (t.closest('[data-close-drawers]')) { closeDrawers(); return; }
    if (t.closest('[data-clear-filters]')) { clearFilters(); render(); return; }
    const copy = t.closest('[data-copy]');
    if (copy) { navigator.clipboard && navigator.clipboard.writeText(copy.dataset.copy).then(() => toast('Number copied'), () => toast('Copy failed. Number: ' + copy.dataset.copy)); return; }
    const a = t.closest('[data-act]'); if (a) { act(a.dataset.act); return; }
    const q = t.closest('[data-qv]:not(#wishDrawer *)'); if (q) { openQuickView(q.dataset.qv); return; }
    const el = t.closest('a, button'); if (!el) return;
    if (el.dataset.open === 'checkout-or-shop') { cartCount() ? openCheckout() : ACTIONS.shop(); return; }
    const label = labelOf(el);
    for (const [re, fn] of LABELS) { if (re.test(label) && !el.closest('#modalBox')) { e.preventDefault(); closeNavDrawer(); fn(); return; } }
    const href = el.getAttribute('href');
    if (el.tagName === 'A' && href && href.startsWith('#')) {
      e.preventDefault();
      closeNavDrawer(); closeDrawers(); closeModal();
      const map = {'#cart': 'cart', '#wishlist': 'wish', '#account': 'account', '#tracking': 'track', '#support': 'contact'};
      if (map[href]) { act(map[href]); setBottomNav(href === '#wishlist' ? 'wishlist' : href === '#account' ? 'account' : ''); return; }
      if (href === '#') { goTop(); return; }
      if (href === '#catalogue') { clearFilters(); render(); }
      setBottomNav(href === '#catalogue' ? 'shop' : href === '#brands' ? 'brands' : '');
      scrollToId(href.slice(1));
    }
  });

  // search
  const searchRows = [[$('#searchInput'), 'desk'], [$('#mobileSearchRow input'), 'mob']];
  searchRows.forEach(([inp]) => {
    if (!inp) return;
    const wrap = inp.parentElement, btn = $('button', wrap);
    const dd = document.createElement('div');
    dd.className = 'hidden absolute left-0 right-0 top-full mt-1 bg-white border border-surface-border rounded-lg shadow-lg z-50 overflow-hidden';
    wrap.appendChild(dd);
    const run = () => {
      const q = inp.value.trim(); dd.classList.add('hidden');
      if (!q) { toast('Type a phone or brand to search'); return; }
      clearFilters(); setFilters({q});
      $('#mobileSearchRow').classList.add('hidden');
    };
    inp.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase();
      if (q.length < 2) { dd.classList.add('hidden'); return; }
      const hits = products.filter(p => (p.name + ' ' + p.brand).toLowerCase().includes(q)).slice(0, 5);
      dd.innerHTML = hits.length ? hits.map(p => `<button class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface-subtle" data-sugg="${p.id}" type="button"><img alt="" class="w-9 h-9 object-contain" src="${p.img}"/><span class="flex-1 text-body-sm font-semibold text-price-primary">${esc(p.name)}</span><span class="text-xs text-secondary">${kes(p.price)}</span></button>`).join('') + `<button class="w-full px-3 py-2 text-left text-xs font-bold text-primary border-t border-surface-border hover:bg-surface-subtle" data-sugg-all type="button">See all results for “${esc(inp.value.trim())}”</button>` : `<p class="px-3 py-3 text-body-sm text-secondary">No phones match “${esc(inp.value.trim())}”.</p>`;
      dd.classList.remove('hidden');
    });
    dd.addEventListener('click', e => {
      const s = e.target.closest('[data-sugg]');
      if (s) { dd.classList.add('hidden'); inp.value = ''; openQuickView(s.dataset.sugg); }
      if (e.target.closest('[data-sugg-all]')) run();
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    if (btn) btn.addEventListener('click', run);
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) dd.classList.add('hidden'); });
  });
  $('#mobileSearchToggle').addEventListener('click', () => {
    const r = $('#mobileSearchRow'); r.classList.toggle('hidden');
    if (!r.classList.contains('hidden')) $('input', r).focus();
  });

  // mobile drawer
  const nd = $('#navDrawer'), ov = $('#drawerOverlay');
  $('#mobileMenuBtn').addEventListener('click', () => { nd.classList.remove('-translate-x-full'); ov.classList.remove('hidden'); });
  $('#closeDrawerBtn').addEventListener('click', closeNavDrawer);
  ov.addEventListener('click', closeNavDrawer);

  // newsletter
  const nf = $('#newsletterForm'), ns = $('#newsletterSuccess');
  if (nf) nf.addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#newsletterEmail').value.trim();
    if (!okEmail(v)) { ns.classList.remove('hidden'); ns.lastChild.textContent = ' Enter a valid email address.'; return; }
    const subs = store.get('subs', []);
    const dup = subs.includes(v.toLowerCase());
    if (!dup) { subs.push(v.toLowerCase()); store.set('subs', subs); }
    nf.reset(); ns.classList.remove('hidden');
    ns.lastChild.textContent = dup ? ' This email is already subscribed.' : " Thank you! You're subscribed to Daisolve phone deal alerts.";
  });

  // contact form
  const cf = $('#contactForm');
  if (cf) cf.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => cf.elements[n].value.trim();
    setErr(cf, 'name', v('name').length < 2 ? 'Enter your name.' : '');
    setErr(cf, 'phone', v('phone') && !okPhone(v('phone')) ? 'Enter a valid phone number.' : '');
    setErr(cf, 'message', v('message').length < 3 ? 'Tell us what you need.' : '');
    if ($('[data-err]:not(.hidden)', cf)) { firstError(cf); return; }
    window.open(waLink(`Hello Daisolve, my name is ${v('name')}${v('phone') ? ' (' + v('phone') + ')' : ''}.\n${v('message')}`), '_blank', 'noopener');
    cf.reset(); toast('Opening WhatsApp with your message');
  });

  // wa links with data-wa
  $$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); });

  updateAccountLabel();
  const qs = new URLSearchParams(location.search);
  if (qs.get('q')) state.q = qs.get('q');
  if (qs.get('brand')) state.brands = qs.get('brand').toLowerCase().split(',').filter(Boolean);
  if (['flagship', 'midrange', 'under20k', '5g'].includes(qs.get('cat'))) state.cat = qs.get('cat');
  if (['low-high', 'high-low', 'popular', 'discount'].includes(qs.get('sort'))) { state.sort = qs.get('sort'); setSortUI(state.sort); }
  render();
  const h = location.hash;
  if (h === '#checkout') openCheckout(); else if (h === '#cart') openCart(); else if (h === '#wishlist') openWish(); else if (h === '#account') openAccount(); else if (h === '#tracking') openTrack();
  setBottomNav();
  renderProductPage();
  if ($('#wishPage')) renderWish();
  if ($('#accountPage')) openAccount();
  finishEmailConfirm();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

