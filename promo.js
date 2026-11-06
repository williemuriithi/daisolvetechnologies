/* Black November sale: discounts every phone and shows a countdown popup on the home page.
   Load right after supabase-catalog.js and before shop.js / site.js. Not loaded by admin.html,
   so the dashboard always shows and saves the real (undiscounted) prices.
   To change the sale: edit PCT and END below. After END the sale switches itself off. */
(function () {
  var PCT = 10;                                        /* percent off every phone */
  var END = Date.parse('2026-11-20T08:30:00+03:00');   /* two weeks after launch, Nairobi time */
  var active = function () { return Date.now() < END; };
  window.DAI_PROMO = {name: 'Black November', percent: PCT, end: END, active: active};
  if (!active()) return;

  /* 1. take PCT off every phone; the original price becomes the crossed-out price */
  (window.DAI_CATALOG || []).forEach(function (p) {
    if (p.promo || !(p.price > 0)) return;
    var orig = p.price;
    p.old = Math.max(p.old || 0, orig);
    p.price = Math.round(orig * (100 - PCT) / 100 / 10) * 10;
    p.promo = true;
  });

  /* 2. popup with countdown, home page only, on every page load */
  function ready(f) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', f) : f(); }
  ready(function () {
    if (!document.body || document.body.dataset.page !== 'home') return;
    setTimeout(show, 900);
  });

  function show() {
    if (!active()) return;
    var css = document.createElement('style');
    css.textContent = '#bnOv{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px;animation:bnF .25s ease}' +
      '@keyframes bnF{from{opacity:0}to{opacity:1}}@keyframes bnP{from{transform:translateY(16px) scale(.97);opacity:0}to{transform:none;opacity:1}}' +
      '#bnBox{position:relative;width:100%;max-width:440px;background:#0b0b0d;color:#fff;border:1px solid #f5b301;border-radius:20px;padding:28px 22px 22px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:bnP .35s ease;font-family:Inter,system-ui,sans-serif;max-height:94vh;overflow:auto}' +
      '#bnBox .bnX{position:absolute;top:10px;right:12px;width:34px;height:34px;border:0;border-radius:50%;background:#1d1d22;color:#fff;font-size:20px;line-height:1;cursor:pointer}' +
      '#bnBox .bnK{display:inline-block;background:#f5b301;color:#000;font-weight:800;font-size:11px;letter-spacing:.12em;padding:4px 10px;border-radius:999px}' +
      '#bnBox h2{margin:12px 0 0;font-size:34px;line-height:1.05;font-weight:900;letter-spacing:-.01em}#bnBox h2 span{color:#f5b301;display:block}' +
      '#bnBox .bnO{margin:14px 0 4px;font-size:56px;font-weight:900;color:#f5b301;line-height:1}#bnBox .bnO small{font-size:18px;color:#fff;font-weight:700;display:block;margin-top:4px}' +
      '#bnBox p{margin:10px 0 0;color:#c9c9d1;font-size:14px}' +
      '#bnT{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0 6px}#bnT div{background:#17171b;border:1px solid #2a2a31;border-radius:12px;padding:10px 0}' +
      '#bnT b{display:block;font-size:26px;font-weight:800;font-variant-numeric:tabular-nums;color:#fff}#bnT span{font-size:10px;letter-spacing:.1em;color:#9a9aa5;text-transform:uppercase}' +
      '#bnBox .bnC{display:block;margin-top:16px;background:#f5b301;color:#000;font-weight:800;font-size:15px;padding:14px;border-radius:12px;text-decoration:none}#bnBox .bnC:hover{background:#ffc933}' +
      '#bnBox .bnN{margin-top:10px;background:none;border:0;color:#9a9aa5;font-size:13px;cursor:pointer;text-decoration:underline}';
    document.head.appendChild(css);
    var ov = document.createElement('div'); ov.id = 'bnOv';
    var endTxt = new Date(END).toLocaleString('en-KE', {weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi'});
    ov.innerHTML = '<div id="bnBox" role="dialog" aria-modal="true" aria-labelledby="bnH"><button class="bnX" aria-label="Close" type="button">&times;</button>' +
      '<span class="bnK">LIMITED TIME</span><h2 id="bnH">BLACK<span>NOVEMBER SALES</span></h2>' +
      '<div class="bnO">' + PCT + '% OFF<small>on every phone in the shop</small></div>' +
      '<p>Prices are already marked down. Sale ends in:</p>' +
      '<div id="bnT"><div><b data-u="d">00</b><span>Days</span></div><div><b data-u="h">00</b><span>Hours</span></div><div><b data-u="m">00</b><span>Mins</span></div><div><b data-u="s">00</b><span>Secs</span></div></div>' +
      '<p style="font-size:12px;margin-top:4px">Ends ' + endTxt + '</p>' +
      '<a class="bnC" href="/shop">Shop the sale</a><button class="bnN" type="button">Maybe later</button></div>';
    document.body.appendChild(ov);
    var timer;
    function close() { clearInterval(timer); ov.remove(); css.remove(); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.bnX,.bnN')) close(); });
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    function tick() {
      var left = Math.max(0, END - Date.now()), s = Math.floor(left / 1000);
      var v = {d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60};
      Object.keys(v).forEach(function (k) { var el = ov.querySelector('[data-u="' + k + '"]'); if (el) el.textContent = two(v[k]); });
      if (!left) close();
    }
    tick(); timer = setInterval(tick, 1000);
    var c = ov.querySelector('.bnC'); if (c) c.focus({preventScroll: true});
  }
})();
