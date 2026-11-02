(() => {
'use strict';
const WA = '254790835039';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const kes = n => 'KSh ' + Number(n).toLocaleString('en-KE');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const waLink = t => 'https://wa.me/' + WA + (t ? '?text=' + encodeURIComponent(t) : '');
const store = {
  get(k, d) { try { const v = localStorage.getItem('dai_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('dai_' + k, JSON.stringify(v)); } catch (e) {} }
};
const icon = (n, c = '') => `<span class="material-symbols-outlined ${c}">${n}</span>`;

/* ---------- data ---------- */
const C = (window.DAI_CATALOG || []).map((p, i) => Object.assign({rank: i, pop: p.rating * p.reviews}, p));
const byId = id => C.find(p => p.id === id);
const pct = p => p.old > p.price ? Math.round((p.old - p.price) / p.old * 100) : 0;
const art = p => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${p.color}'/><stop offset='1' stop-color='#10213D'/></linearGradient></defs><rect x='60' y='12' width='80' height='176' rx='15' fill='#0b1c30'/><rect x='65' y='18' width='70' height='164' rx='11' fill='url(#g)'/><text x='100' y='104' font-family='Arial' font-size='10' font-weight='700' fill='white' text-anchor='middle'>${p.brand.toUpperCase()}</text><text x='100' y='120' font-family='Arial' font-size='8' fill='white' fill-opacity='.85' text-anchor='middle'>${p.short}</text></svg>`);
const imgOf = p => p.img || art(p);
const PAGE_SIZE = 12;
const BRANDS = [...new Set(C.map(p => p.brand))].sort((a, b) => C.filter(p => p.brand === b).length - C.filter(p => p.brand === a).length || a.localeCompare(b));
const RAMS = [4, 6, 8, 12, 16];
const STORES = [[64, '64GB'], [128, '128GB'], [256, '256GB'], [512, '512GB'], [1024, '1TB']];
const BRACKETS = [['Under 20K', null, 20000], ['20K - 40K', 20000, 40000], ['40K - 80K', 40000, 80000], ['Flagship 80K+', 80000, null]];
const TAGS = {cam: 'Flagship Cameras', battery: 'Long Battery Life', deal: 'Clearance Deals'};
const INFO = {
  warranty: ['Warranty policy', '<p>Every phone is brand sealed and covered by the manufacturer warranty, usually 1–2 years depending on brand. Apple phones carry the official 1-year Apple warranty.</p><ul class="list-disc pl-5 mt-2 space-y-1"><li>Claims go through the brand\'s certified service centres.</li><li>Keep your receipt and the original box.</li><li>Physical or liquid damage is not covered.</li><li>If a phone has a fault on arrival, message us on WhatsApp with your order ID.</li></ul>'],
  delivery: ['Same-day Nairobi delivery', '<ul class="list-disc pl-5 space-y-1"><li>Nairobi: about 3 hours once payment is confirmed.</li><li>Outside Nairobi: parcel dispatch to your town.</li><li>The delivery fee depends on your location and is confirmed on WhatsApp before you pay.</li><li>Free collection at Jamia Shopping Mall, Nairobi CBD.</li></ul><p class="mt-2">Open Mon – Sat 8:00 AM – 7:30 PM, Sun 10:00 AM – 4:00 PM.</p>'],
  trade: ['Trade-in program', '<p>Bring your current phone and get its value as credit toward a new one. We inspect the screen, body, battery and function at Jamia Shopping Mall and confirm the final value there.</p><a class="mt-4 h-11 bg-mpesa-green text-white rounded-lg text-label-md font-bold flex items-center justify-center gap-2" href="' + waLink('Hello Daisolve, I would like a trade-in valuation.') + '" rel="noopener" target="_blank">Request a valuation on WhatsApp</a>'],
  terms: ['Terms of service', '<ul class="list-disc pl-5 space-y-1"><li>Prices are in Kenya shillings and depend on stock. We confirm availability before you pay.</li><li>An order is confirmed once we have confirmed your payment.</li><li>We accept M-PESA Pochi la Biashara, bank transfer, Visa, Mastercard and PayPal.</li><li>You may inspect the phone and check its IMEI and serial number on collection or delivery.</li></ul>'],
  privacy: ['Privacy policy', '<p>We collect your name, phone number, email and delivery address only to process your order and support you afterwards. We do not sell your details. Your cart and wishlist are saved in your browser on this device, and card details are never entered on this website.</p>'],
  returns: ['Returns & exchanges', '<ul class="list-disc pl-5 space-y-1"><li>Check the phone, IMEI and serial number when you collect or receive it.</li><li>If it arrives faulty, contact us on WhatsApp with your order ID and we will arrange a replacement or warranty claim.</li><li>Phones with physical or liquid damage cannot be exchanged.</li></ul>']
};

/* ---------- state ---------- */
let cart = store.get('cart', {});
let wish = store.get('wish', []);
const S = {brands: [], min: null, max: null, rams: [], stores: [], nets: [], stock: false, q: '', tag: null, sort: 'newest', page: 1};
const fresh = () => Object.assign(S, {brands: [], min: null, max: null, rams: [], stores: [], nets: [], stock: false, q: '', tag: null, sort: 'newest', page: 1});

function matches(p) {
  if (S.brands.length && !S.brands.includes(p.brand.toLowerCase())) return false;
  if (S.min != null && p.price < S.min) return false;
  if (S.max != null && p.price > S.max) return false;
  if (S.rams.length && !S.rams.includes(p.ram)) return false;
  if (S.stores.length && !S.stores.includes(p.storage)) return false;
  if (S.nets.length && !S.nets.includes(p.net)) return false;
  if (S.tag === 'deal' ? pct(p) < 9 : S.tag && !p.tags.includes(S.tag)) return false;
  if (S.q) {
    const hay = (p.name + ' ' + p.brand + ' ' + p.chips.join(' ')).toLowerCase();
    if (!S.q.toLowerCase().split(/\s+/).every(w => hay.includes(w))) return false;
  }
  return true;
}
const SORT = {
  newest: (a, b) => a.rank - b.rank, 'low-high': (a, b) => a.price - b.price, 'high-low': (a, b) => b.price - a.price,
  discount: (a, b) => pct(b) - pct(a), popular: (a, b) => b.pop - a.pop
};
const visible = () => C.filter(matches).sort(SORT[S.sort] || SORT.newest);
function activeCount() {
  return S.brands.length + (S.min != null || S.max != null ? 1 : 0) + S.rams.length + S.stores.length + S.nets.length + (S.q ? 1 : 0) + (S.tag ? 1 : 0);
}

/* ---------- rendering ---------- */
function card(p) {
  const d = pct(p), w = wish.includes(p.id);
  const left = p.badge ? `<span class="absolute top-1.5 left-1.5 ${p.badgeCls} text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">${esc(p.badge)}</span>` : d ? `<span class="absolute top-1.5 left-1.5 bg-tertiary-container text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">-${d}% OFF</span>` : '';
  const right = p.corner ? `<span class="absolute top-1.5 right-1.5 bg-mpesa-green text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">${esc(p.corner)}</span>` : '';
  const stars = Array.from({length: 5}, (_, i) => `<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">${p.rating >= i + 0.75 ? 'star' : p.rating >= i + 0.25 ? 'star_half' : 'star_outline'}</span>`).join('');
  return `<div class="bg-surface-canvas rounded-xl border border-surface-border p-3 flex flex-col justify-between hover:shadow-lg hover:border-primary-container/40 transition-all duration-200 group">
<div>
<div class="relative w-full aspect-square bg-surface-subtle rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2 cursor-pointer" data-qv="${p.id}">
${left}${right}
<img alt="${esc(p.name)}" class="object-contain w-full h-full group-hover:scale-105 transition-transform duration-200" src="${imgOf(p)}"/>
<button aria-label="${w ? 'Remove from wishlist' : 'Add to wishlist'}" class="absolute bottom-1.5 right-1.5 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center ${w ? 'text-danger' : 'text-secondary'} hover:text-danger shadow-sm active:scale-90 transition-all" data-wish="${p.id}" type="button"><span class="material-symbols-outlined text-[16px]"${w ? ` style="font-variation-settings: 'FILL' 1;"` : ''}>favorite</span></button>
</div>
<div class="flex items-center gap-1.5 mb-1"><span class="text-[10px] font-bold text-primary uppercase tracking-wider">${esc(p.brand)}</span><span class="text-secondary text-[10px]">•</span><span class="text-[10px] text-mpesa-green font-semibold flex items-center gap-0.5">${p.dot ? '<span class="w-1.5 h-1.5 rounded-full bg-mpesa-green"></span> ' : ''}${esc(p.sub)}</span></div>
<h3 class="text-body-md font-headline-sm text-price-primary line-clamp-2 mb-1 group-hover:text-primary transition-colors cursor-pointer" data-qv="${p.id}">${esc(p.name)}</h3>
<div class="flex items-center gap-1 mb-2 flex-wrap">${p.chips.map(c => `<span class="text-[11px] font-semibold text-secondary bg-surface-subtle px-1.5 py-0.5 rounded border border-surface-border">${esc(c)}</span>`).join('')}</div>
<div class="flex items-center gap-1 mb-2"><div class="flex text-amber-500 text-[14px]">${stars}</div><span class="text-body-sm text-secondary font-medium">${p.rating.toFixed(1)} (${p.reviews})</span></div>
</div>
<div><div class="mb-2.5">${p.old > p.price ? `<div class="text-[12px] text-price-strikethrough line-through">${kes(p.old)}</div>` : '<div class="text-[12px]">&nbsp;</div>'}<div class="text-price-display-mobile md:text-price-display font-price-display text-price-primary font-extrabold">${kes(p.price)}</div></div>
<div class="flex items-center gap-1.5"><button class="flex-1 bg-primary-container hover:bg-primary text-white py-2 rounded-lg text-label-md font-label-md flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm" data-add="${p.id}" type="button">${icon('shopping_cart', 'text-[16px]')}<span>Add to Cart</span></button>
<a class="p-2 bg-surface-subtle border border-surface-border text-mpesa-green hover:bg-surface-container rounded-lg active:scale-95 transition-all" href="${waLink(`Hello Daisolve, I am interested in the ${p.name} (${kes(p.price)}). Is it available?`)}" rel="noopener" target="_blank" title="Order on WhatsApp">${icon('chat', 'text-[18px]')}</a></div></div>
</div>`;
}

const chk = 'rounded border-outline-variant text-primary focus:ring-primary-container w-4 h-4';
const optBtn = (on, f, v, label, big) => `<button class="${big ? 'px-3 py-1.5' : 'px-2.5 py-1'} text-label-sm border rounded-lg ${on ? 'border-primary bg-primary text-white font-bold' : 'border-surface-border bg-surface-subtle hover:border-primary-container'}" data-f="${f}" data-v="${v}" type="button">${label}</button>`;
const bracketOn = b => S.min === b[1] && S.max === b[2];
function panel(kind) {
  const sheet = kind === 'sheet';
  const brands = sheet
    ? `<div class="grid grid-cols-2 gap-2 text-body-sm">${BRANDS.map(b => { const on = S.brands.includes(b.toLowerCase()); return `<label class="flex items-center gap-2 p-2 rounded-lg bg-surface-subtle border ${on ? 'border-primary text-primary font-bold' : 'border-surface-border text-price-primary'}"><input ${on ? 'checked' : ''} class="rounded text-primary focus:ring-primary w-4 h-4" data-f="brand" type="checkbox" value="${b.toLowerCase()}"/><span>${b} (${C.filter(p => p.brand === b).length})</span></label>`; }).join('')}</div>`
    : `<div class="space-y-2 max-h-48 overflow-y-auto pr-1">${BRANDS.map(b => `<label class="flex items-center justify-between text-body-md text-on-surface cursor-pointer"><span class="flex items-center gap-2"><input ${S.brands.includes(b.toLowerCase()) ? 'checked' : ''} class="${chk}" data-f="brand" type="checkbox" value="${b.toLowerCase()}"/><span>${b}</span></span><span class="text-body-sm text-secondary font-medium">${C.filter(p => p.brand === b).length}</span></label>`).join('')}</div>`;
  const inp = 'w-full text-body-sm py-1.5 px-2 bg-surface-subtle border border-surface-border rounded-lg text-price-primary';
  const price = `<div class="grid grid-cols-2 gap-2 mb-2"><div><span class="text-[11px] text-secondary font-medium uppercase">Min</span><input class="${inp}" data-f="min" inputmode="numeric" placeholder="0" type="text" value="${S.min != null ? S.min.toLocaleString('en-KE') : ''}"/></div><div><span class="text-[11px] text-secondary font-medium uppercase">Max</span><input class="${inp}" data-f="max" inputmode="numeric" placeholder="Any" type="text" value="${S.max != null ? S.max.toLocaleString('en-KE') : ''}"/></div></div>
<div class="grid grid-cols-2 gap-1.5 pt-1">${BRACKETS.map((b, i) => `<button class="text-[11px] py-1 px-2 rounded ${bracketOn(b) ? 'bg-primary-fixed text-primary font-bold' : 'bg-surface-subtle text-secondary hover:bg-surface-container font-medium'} text-left" data-f="bracket" data-v="${i}" type="button">${b[0]}</button>`).join('')}</div>`;
  const ram = `<div class="flex flex-wrap gap-1.5">${RAMS.map(r => optBtn(S.rams.includes(r), 'ram', r, r + 'GB', sheet)).join('')}</div>`;
  const stor = `<div class="flex flex-wrap gap-1.5">${STORES.map(s => optBtn(S.stores.includes(s[0]), 'storage', s[0], s[1], sheet)).join('')}</div>`;
  const net = `<div class="space-y-1.5"><label class="flex items-center gap-2 text-body-sm text-on-surface cursor-pointer"><input ${S.nets.includes('5g') ? 'checked' : ''} class="${chk}" data-f="net" type="checkbox" value="5g"/><span>5G Ready (Ultra-fast)</span></label><label class="flex items-center gap-2 text-body-sm text-on-surface cursor-pointer"><input ${S.nets.includes('4g') ? 'checked' : ''} class="${chk}" data-f="net" type="checkbox" value="4g"/><span>4G LTE</span></label></div>`;
  const h = t => `<h4 class="text-label-md font-label-md text-price-primary mb-2.5">${t}</h4>`;
  if (sheet) return `<div>${h('Smartphone Brand')}${brands}</div><div>${h('Price Limit (KSh)')}${price}</div><div>${h('RAM Size')}${ram}</div><div>${h('Internal Storage')}${stor}</div><div>${h('Network')}${net}</div>`;
  return `<div class="flex items-center justify-between pb-3 border-b border-surface-border"><h3 class="text-headline-sm font-headline-sm text-price-primary">Filters</h3><button class="text-label-sm font-label-sm text-primary hover:underline" data-clear type="button">Reset All</button></div>
<div>${h('Brand')}${brands}</div><div class="pt-4 border-t border-surface-border">${h('Price (KSh)')}${price}</div><div class="pt-4 border-t border-surface-border">${h('RAM Capacity')}${ram}</div><div class="pt-4 border-t border-surface-border">${h('Internal Storage')}${stor}</div><div class="pt-4 border-t border-surface-border">${h('Network')}${net}</div>
<div class="pt-4 border-t border-surface-border text-body-sm text-secondary flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-mpesa-green"></span>All listed phones are in stock for immediate dispatch</div>`;
}

function pills() {
  const out = [];
  const pill = (label, rm) => `<span class="inline-flex items-center gap-1.5 bg-surface-container text-price-primary px-2.5 py-1 rounded-full text-label-sm font-label-sm">${esc(label)}<button aria-label="Remove filter" class="hover:text-danger text-secondary flex items-center" data-remove="${rm}" type="button"><span class="material-symbols-outlined text-[14px]">close</span></button></span>`;
  if (S.q) out.push(pill('Search: ' + S.q, 'q'));
  S.brands.forEach(b => out.push(pill('Brand: ' + b.charAt(0).toUpperCase() + b.slice(1), 'brand:' + b)));
  if (S.min != null || S.max != null) out.push(pill('Price: ' + (S.min != null && S.max != null ? `${kes(S.min)} – ${kes(S.max)}` : S.min != null ? `From ${kes(S.min)}` : `Under ${kes(S.max)}`), 'price'));
  S.rams.forEach(r => out.push(pill('RAM: ' + r + 'GB', 'ram:' + r)));
  S.stores.forEach(s => out.push(pill('Storage: ' + STORES.find(x => x[0] === s)[1], 'storage:' + s)));
  S.nets.forEach(n => out.push(pill('Network: ' + n.toUpperCase(), 'net:' + n)));
  if (S.tag) out.push(pill(TAGS[S.tag], 'tag'));
  const box = $('#activePills');
  box.classList.toggle('hidden', !out.length); box.classList.toggle('flex', !!out.length);
  box.innerHTML = out.length ? '<span class="text-secondary font-medium text-[11px] uppercase tracking-wider">Active:</span>' + out.join('') + '<button class="text-label-sm font-label-sm text-primary hover:underline ml-1" data-clear type="button">Clear All</button>' : '';
}

function pager(total, pages, start, end) {
  $('#pagerText').textContent = total ? `Showing ${start + 1}–${end} of ${total} Devices` : 'No devices found';
  const p = total ? Math.round(end / total * 100) : 0;
  $('#pagerPct').textContent = p + '%'; $('#pagerBar').style.width = p + '%';
  const btn = $('#loadNextBtn'); btn.classList.toggle('hidden', S.page >= pages);
  $('span:last-child', btn).textContent = `Load Next ${Math.min(PAGE_SIZE, total - end)} Smartphone${total - end === 1 ? '' : 's'}`;
  const num = n => `<button class="w-9 h-9 rounded-lg ${n === S.page ? 'bg-primary text-white font-bold shadow-sm' : 'border border-surface-border text-price-primary hover:bg-surface-subtle font-medium'} text-body-sm flex items-center justify-center" data-page="${n}" type="button">${n}</button>`;
  const arrow = (dir, dis) => `<button aria-label="${dir < 0 ? 'Previous page' : 'Next page'}" class="w-9 h-9 rounded-lg border border-surface-border text-secondary hover:bg-surface-subtle flex items-center justify-center disabled:opacity-40" ${dis ? 'disabled' : ''} data-page="${S.page + dir}" type="button">${icon(dir < 0 ? 'chevron_left' : 'chevron_right', 'text-[18px]')}</button>`;
  $('#pagerNums').innerHTML = pages > 1 ? arrow(-1, S.page === 1) + Array.from({length: pages}, (_, i) => num(i + 1)).join('') + arrow(1, S.page === pages) : '';
  $('#pagerBox').classList.toggle('hidden', !total);
}

function render() {
  const list = visible(), pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (S.page > pages) S.page = pages;
  const start = (S.page - 1) * PAGE_SIZE, end = Math.min(list.length, start + PAGE_SIZE);
  $('#productGrid').innerHTML = list.slice(start, end).map(card).join('');
  $('#emptyState').classList.toggle('hidden', list.length > 0);
  $('#countBadge').textContent = C.length;
  $('#resultsText').textContent = list.length ? `Showing ${start + 1}–${end} of ${list.length} phones` : 'No phones found';
  const n = activeCount();
  $('#filterCountBadge').textContent = n; $('#filterCountBadge').classList.toggle('hidden', !n);
  $('#sheetTitle').textContent = n ? `Filters (${n} Active)` : 'Filters';
  $('#applyFiltersBtn').textContent = `Apply Filters (${list.length})`;
  $('#sortSelect').value = S.sort;
  $('#sidebarFilters').innerHTML = panel('side');
  const sb = $('#sheetBody'), st = sb.scrollTop; sb.innerHTML = panel('sheet'); sb.scrollTop = st;
  pills(); pager(list.length, pages, start, end);
  $$('#brandChips button').forEach(b => { const on = S.brands.includes(b.dataset.brand); b.className = 'flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-sm border transition-transform active:scale-95 ' + (on ? 'bg-primary text-white border-primary' : 'bg-surface-canvas text-price-primary border-surface-border hover:border-primary-container'); $('span:last-child', b).className = 'text-[11px] font-' + (on ? 'bold bg-white/20 text-white' : 'semibold bg-surface-subtle text-secondary') + ' px-2 py-0.5 rounded-full'; });
  [$('#searchDesk'), $('#searchMob')].forEach(i => { if (i && i.value.trim() !== S.q) i.value = S.q; });
}

/* ---------- toast & modal ---------- */
let tt;
function toast(msg, label, fn) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>` + (label ? `<button class="ml-3 font-bold text-mpesa-green underline" id="toastAct" type="button">${esc(label)}</button>` : '');
  t.classList.remove('hidden'); t.classList.add('flex');
  if (label) $('#toastAct').onclick = () => { t.classList.add('hidden'); fn(); };
  clearTimeout(tt); tt = setTimeout(() => { t.classList.add('hidden'); t.classList.remove('flex'); }, 3200);
}
function lock(on) { document.body.style.overflow = on ? 'hidden' : ''; }
function openModal(html) {
  const root = $('#modalRoot'); $('#modalBox').innerHTML = `<button aria-label="Close" class="absolute top-3 right-3 p-1.5 rounded-full text-secondary hover:bg-surface-subtle" data-close-modal type="button">${icon('close')}</button>` + html;
  root.classList.remove('hidden'); root.classList.add('flex'); lock(true);
}
function closeModal() { const r = $('#modalRoot'); r.classList.add('hidden'); r.classList.remove('flex'); if ($('#cartDrawer').classList.contains('translate-x-full')) lock(false); }
/* product click -> separate product page (was a quick-view modal) */
function quickView(id) { if (byId(id)) location.href = '/shop/' + encodeURIComponent(id); }

/* ---------- cart & wishlist ---------- */
const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
const cartTotal = () => Object.entries(cart).reduce((t, [id, q]) => t + (byId(id) ? byId(id).price * q : 0), 0);
function badges() {
  const c = cartCount(), w = wish.length;
  [['#cartBadge', c], ['#wishBadge', w], ['#mobileWishlistBadge', w]].forEach(([s, n]) => { const el = $(s); if (el) { el.textContent = n; el.style.display = n ? 'flex' : 'none'; } });
  $('#cartTotalLbl').textContent = kes(cartTotal());
}
function saveCart() { store.set('cart', cart); badges(); renderCart(); }
function addToCart(id, qty = 1, quiet) {
  const p = byId(id); if (!p) return;
  cart[id] = Math.min(10, (cart[id] || 0) + qty); saveCart();
  if (!quiet) toast(`${p.name} added to cart`, 'View cart', openCart);
}
function toggleWish(id) {
  const p = byId(id), i = wish.indexOf(id);
  if (i > -1) { wish.splice(i, 1); toast('Removed from wishlist'); } else { wish.push(id); toast(`${p.name} saved to wishlist`, 'View', () => { location.href = '/wishlist'; }); }
  store.set('wish', wish); badges(); render();
}
function renderCart() {
  const items = Object.entries(cart).map(([id, q]) => ({p: byId(id), q})).filter(x => x.p);
  const body = $('#cartBody'), foot = $('#cartFoot');
  $('#cartDrawerCount').textContent = cartCount();
  if (!items.length) {
    body.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-center p-8">${icon('shopping_bag', 'text-6xl text-outline-variant')}<p class="mt-3 text-headline-sm font-headline-sm text-price-primary">Your cart is empty</p><p class="text-body-sm text-secondary mt-1">Pick a phone and it will show up here.</p><button class="mt-4 h-10 px-5 bg-primary-container text-white rounded-lg text-label-md font-bold" data-close-cart type="button">Keep browsing</button></div>`;
    foot.classList.add('hidden'); return;
  }
  body.innerHTML = '<div class="px-4">' + items.map(({p, q}) => `<div class="flex gap-3 py-3 border-b border-surface-border"><img alt="" class="w-16 h-16 object-contain bg-surface-subtle rounded-lg p-1" src="${imgOf(p)}"/><div class="flex-1 min-w-0"><p class="text-label-md font-label-md text-price-primary leading-tight">${esc(p.name)}</p><p class="text-xs text-secondary">${esc(p.chips.join(' · '))}</p><div class="mt-2 flex items-center justify-between"><div class="flex items-center border border-surface-border rounded-lg"><button aria-label="Decrease quantity" class="w-8 h-8 flex items-center justify-center hover:bg-surface-subtle" data-cart="dec" data-id="${p.id}" type="button">${icon('remove', 'text-base')}</button><span class="w-8 text-center text-label-md font-bold">${q}</span><button aria-label="Increase quantity" class="w-8 h-8 flex items-center justify-center hover:bg-surface-subtle" data-cart="inc" data-id="${p.id}" type="button">${icon('add', 'text-base')}</button></div><span class="text-label-md font-bold text-price-primary">${kes(p.price * q)}</span></div></div><button aria-label="Remove" class="self-start p-1 text-secondary hover:text-danger" data-cart="del" data-id="${p.id}" type="button">${icon('delete', 'text-lg')}</button></div>`).join('') + '<button class="mt-3 text-xs text-secondary underline" data-cart="clear" type="button">Clear cart</button></div>';
  foot.classList.remove('hidden'); $('#cartSubtotal').textContent = kes(cartTotal());
  $('#cartWa').href = waLink('Hello Daisolve, I would like to order:\n' + items.map(({p, q}) => `• ${p.name} x${q} – ${kes(p.price * q)}`).join('\n') + `\nTotal: ${kes(cartTotal())}\nPlease confirm availability.`);
}
function openCart() { closeModal(); renderCart(); $('#ovl').classList.remove('hidden'); $('#cartDrawer').classList.remove('translate-x-full'); lock(true); }
function closeCart() { $('#ovl').classList.add('hidden'); $('#cartDrawer').classList.add('translate-x-full'); lock(false); }

/* ---------- filters ---------- */
const toggle = (arr, v) => { const i = arr.indexOf(v); i > -1 ? arr.splice(i, 1) : arr.push(v); };
const numOf = v => { const d = String(v).replace(/\D/g, ''); return d ? +d : null; };
function setFilter(el) {
  const f = el.dataset.f;
  if (f === 'brand') toggle(S.brands, el.value);
  else if (f === 'net') toggle(S.nets, el.value);
  else if (f === 'ram') toggle(S.rams, +el.dataset.v);
  else if (f === 'storage') toggle(S.stores, +el.dataset.v);
  else if (f === 'min') S.min = numOf(el.value);
  else if (f === 'max') S.max = numOf(el.value);
  else if (f === 'bracket') { const b = BRACKETS[+el.dataset.v]; if (bracketOn(b)) { S.min = null; S.max = null; } else { S.min = b[1]; S.max = b[2]; } }
  S.page = 1; render();
}
function applyPreset(k) {
  fresh();
  if (k === 'budget5g') { S.nets = ['5g']; S.max = 30000; S.sort = 'low-high'; }
  else if (k === 'deal') { S.tag = 'deal'; S.sort = 'discount'; }
  else S.tag = k;
  render(); scrollCatalog();
}
function scrollCatalog() { const m = $('main'); if (m) window.scrollTo({top: m.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth'}); }
function removeFilter(key) {
  const [k, v] = key.split(':');
  if (k === 'q') S.q = ''; else if (k === 'brand') S.brands = S.brands.filter(x => x !== v); else if (k === 'price') { S.min = null; S.max = null; }
  else if (k === 'ram') S.rams = S.rams.filter(x => x !== +v); else if (k === 'storage') S.stores = S.stores.filter(x => x !== +v);
  else if (k === 'net') S.nets = S.nets.filter(x => x !== v); else if (k === 'tag') S.tag = null;
  S.page = 1; render();
}

/* ---------- drawers ---------- */
function sheet(open) {
  const s = $('#filterBottomSheet'), c = $('#filterDrawerContent');
  s.classList.toggle('pointer-events-none', !open); s.classList.toggle('opacity-0', !open); s.classList.toggle('opacity-100', open);
  c.classList.toggle('translate-y-full', !open); lock(open);
}
function sideNav(open) {
  const s = $('#sideNavDrawer'), c = $('#sideNavContent');
  s.classList.toggle('pointer-events-none', !open); s.classList.toggle('opacity-0', !open); s.classList.toggle('opacity-100', open);
  c.classList.toggle('-translate-x-full', !open); lock(open);
}

function init() {
  // extra containers
  document.body.insertAdjacentHTML('beforeend', `
<div class="fixed inset-0 bg-price-primary/60 backdrop-blur-sm z-[60] hidden" id="ovl"></div>
<aside aria-label="Shopping cart" class="fixed inset-y-0 right-0 w-[26rem] max-w-full bg-white z-[65] shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col" id="cartDrawer">
<div class="p-4 border-b border-surface-border flex items-center justify-between"><h3 class="text-headline-sm font-headline-sm text-price-primary">Your cart (<span id="cartDrawerCount">0</span>)</h3><button aria-label="Close cart" class="p-2 text-secondary hover:text-price-primary" data-close-cart type="button">${icon('close')}</button></div>
<div class="flex-1 overflow-y-auto" id="cartBody"></div>
<div class="hidden p-4 border-t border-surface-border space-y-2" id="cartFoot"><div class="flex justify-between text-label-md font-bold text-price-primary"><span>Subtotal</span><span id="cartSubtotal"></span></div><p class="text-xs text-secondary">Free pickup at Jamia Shopping Mall. Delivery fees are confirmed by location on WhatsApp.</p>
<a class="w-full h-12 bg-primary-container text-white rounded-lg text-label-md font-bold hover:bg-primary flex items-center justify-center" href="/home#checkout">Checkout</a>
<a class="h-11 border border-mpesa-green text-mpesa-green rounded-lg text-label-md font-bold flex items-center justify-center gap-2 hover:bg-mpesa-green hover:text-white transition-colors" href="#" id="cartWa" rel="noopener" target="_blank">${icon('chat', 'text-lg')}<span>Order on WhatsApp</span></a></div></aside>
<div class="fixed inset-0 z-[70] hidden items-end sm:items-center justify-center sm:p-4" id="modalRoot"><div class="absolute inset-0 bg-price-primary/60 backdrop-blur-sm" data-close-modal></div><div class="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl" id="modalBox"></div></div>
<div class="hidden fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 z-[90] bg-price-primary text-white text-body-sm font-medium px-4 py-3 rounded-lg shadow-xl max-w-[90vw] items-center" id="toast" role="status"></div>
<a aria-label="Chat with Daisolve on WhatsApp" class="fixed right-4 bottom-20 md:bottom-6 z-[45] w-12 h-12 rounded-full bg-mpesa-green text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform" href="${waLink('Hello Daisolve, I would like to ask about a phone.')}" rel="noopener" target="_blank">${icon('chat', 'text-2xl')}</a>`);

  // brand chips
  $('#brandChips').innerHTML = BRANDS.map(b => `<button class="flex-shrink-0" data-brand="${b.toLowerCase()}" type="button"><span class="font-bold text-label-md">${b}</span><span>${C.filter(p => p.brand === b).length} Models</span></button>`).join('');

  // URL filters from other pages
  const q = new URLSearchParams(location.search);
  if (q.get('q')) S.q = q.get('q');
  if (q.get('brand')) S.brands = q.get('brand').toLowerCase().split(',').filter(Boolean);
  else if (window.PAGE_BRANDS && window.PAGE_BRANDS.length) S.brands = window.PAGE_BRANDS.slice();
  const cat = q.get('cat');
  if (cat === 'flagship') S.min = 80000; else if (cat === 'midrange') { S.min = 20000; S.max = 80000; } else if (cat === 'under20k') S.max = 20000; else if (cat === '5g') S.nets = ['5g'];
  if (SORT[q.get('sort')]) S.sort = q.get('sort');

  badges(); renderCart(); render();

  // header
  $('#wishBtn').addEventListener('click', () => { location.href = '/wishlist'; });
  $('#accBtn').addEventListener('click', () => { location.href = '/account'; });
  $('#cartBtn').addEventListener('click', openCart);
  [$('#searchDesk'), $('#searchMob')].forEach(i => {
    i.addEventListener('input', () => { S.q = i.value.trim(); S.page = 1; render(); });
    i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); scrollCatalog(); } });
  });
  $('#sortSelect').addEventListener('change', e => { S.sort = e.target.value; S.page = 1; render(); });
  $('#filterSheetToggle').addEventListener('click', () => sheet(true));
  $('#closeFilterSheet').addEventListener('click', () => sheet(false));
  $('#filterBackdrop').addEventListener('click', () => sheet(false));
  $('#applyFiltersBtn').addEventListener('click', () => { sheet(false); scrollCatalog(); });
  $('#resetFiltersBtn').addEventListener('click', () => { fresh(); render(); });
  $('#drawerToggleBtn').addEventListener('click', () => sideNav(true));
  $('#closeSideNav').addEventListener('click', () => sideNav(false));
  $('#sideNavBackdrop').addEventListener('click', () => sideNav(false));
  $('#loadNextBtn').addEventListener('click', () => { S.page++; render(); scrollCatalog(); });

  // filter panels: checkboxes, price inputs
  ['#sidebarFilters', '#sheetBody'].forEach(s => $(s).addEventListener('change', e => { const el = e.target.closest('[data-f]'); if (el && (el.type === 'checkbox' || el.dataset.f === 'min' || el.dataset.f === 'max')) setFilter(el); }));
  ['#sidebarFilters', '#sheetBody'].forEach(s => $(s).addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input[type=text]')) e.target.blur(); }));

  document.addEventListener('click', e => {
    const t = e.target;
    let el;
    if ((el = t.closest('button[data-f]'))) { setFilter(el); return; }
    if (t.closest('[data-close-modal]')) { closeModal(); return; }
    if (t.closest('[data-close-cart]') || t.closest('#ovl')) { closeCart(); return; }
    if ((el = t.closest('[data-wish]'))) { e.stopPropagation(); const id = el.dataset.wish, re = el.hasAttribute('data-reopen'); toggleWish(id); if (re) quickView(id); return; }
    if ((el = t.closest('[data-add]'))) { addToCart(el.dataset.add); if (el.hasAttribute('data-close-after')) closeModal(); else { const old = el.innerHTML; el.innerHTML = icon('check', 'text-[16px]') + '<span>Added</span>'; setTimeout(() => { el.innerHTML = old; }, 1100); } return; }
    if ((el = t.closest('[data-buy]'))) { addToCart(el.dataset.buy, 1, true); location.href = '/home#checkout'; return; }
    if (t.closest('a')) { const a = t.closest('a'); if (!a.hasAttribute('data-brand-link') && !a.hasAttribute('data-info')) return; }
    if ((el = t.closest('[data-qv]'))) { quickView(el.dataset.qv); return; }
    if ((el = t.closest('[data-cart]'))) {
      const id = el.dataset.id, a = el.dataset.cart;
      if (a === 'inc') cart[id] = Math.min(10, (cart[id] || 0) + 1);
      if (a === 'dec') { cart[id] = (cart[id] || 1) - 1; if (cart[id] <= 0) delete cart[id]; }
      if (a === 'del') delete cart[id];
      if (a === 'clear') cart = {};
      saveCart(); return;
    }
    if ((el = t.closest('[data-brand]'))) { const b = el.dataset.brand; S.brands = S.brands.includes(b) && S.brands.length === 1 ? [] : [b]; S.page = 1; render(); return; }
    if ((el = t.closest('[data-brand-link]'))) { e.preventDefault(); fresh(); S.brands = el.dataset.brandLink.split(','); render(); scrollCatalog(); return; }
    if ((el = t.closest('[data-info]'))) { e.preventDefault(); const [title, body] = INFO[el.dataset.info]; openModal(`<div class="p-5 sm:p-6"><h3 class="text-headline-md font-headline-md text-price-primary pr-8">${title}</h3><div class="mt-3 text-body-md text-secondary leading-relaxed">${body}</div></div>`); return; }
    if ((el = t.closest('[data-preset]'))) { applyPreset(el.dataset.preset); return; }
    if ((el = t.closest('[data-remove]'))) { removeFilter(el.dataset.remove); return; }
    if (t.closest('[data-clear]')) { fresh(); render(); return; }
    if ((el = t.closest('button[data-page]'))) { if (!el.disabled) { S.page = +el.dataset.page; render(); scrollCatalog(); } return; }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeCart(); sheet(false); sideNav(false); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-preset]')) { e.preventDefault(); applyPreset(e.target.dataset.preset); }
  });
  if (location.hash === '#cart') openCart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
