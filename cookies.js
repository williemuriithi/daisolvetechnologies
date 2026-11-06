/* Cookie notice. Remembers the visitor's choice in a first-party cookie (dai_consent) for 180 days.
   Essential storage (sign-in, cart, wishlist) always works. Anything optional added later, such as analytics,
   must check  window.DAI_CONSENT.allows('analytics')  before it runs. Not loaded by admin.html. */
(function () {
  var NAME = 'dai_consent', DAYS = 180;
  function getCookie() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + NAME + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function setCookie(v) {
    document.cookie = NAME + '=' + encodeURIComponent(v) + '; max-age=' + DAYS * 86400 + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  }
  var C = window.DAI_CONSENT = {
    value: getCookie(),                      /* '' (not chosen yet), 'all' or 'essential' */
    allows: function (cat) { return cat === 'essential' || C.value === 'all'; }
  };
  var box;
  function close() { if (box) { box.remove(); box = null; } }
  function choose(v) { C.value = v; setCookie(v); close(); document.dispatchEvent(new CustomEvent('dai-consent', {detail: v})); }
  function privacy() {
    var l = Array.prototype.slice.call(document.querySelectorAll('a,button')).filter(function (x) { return x.textContent.trim() === 'Privacy Policy'; })[0];
    if (l) l.click();
  }
  function show() {
    if (box) return;
    box = document.createElement('div');
    box.id = 'cookieBar'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Cookie notice');
    box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:72px;z-index:60;max-width:460px;background:#fff;color:#1a1c1e;border:1px solid #d9dce1;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.2);padding:16px;font:14px/1.45 Inter,system-ui,sans-serif';
    if (window.innerWidth >= 768) box.style.bottom = '16px';
    box.innerHTML = '<div style="font-weight:700;font-size:15px;margin-bottom:4px">We use cookies</div>' +
      '<p style="margin:0 0 12px;color:#4b5058">We use cookies and similar storage to keep you signed in and remember your cart and wishlist. Choose whether we may also use optional cookies to improve the site. <a href="#" data-ck-more style="color:#1769ff;text-decoration:underline">Privacy policy</a></p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" data-ck="all" style="flex:1;min-width:130px;height:42px;border:0;border-radius:10px;background:#1769ff;color:#fff;font-weight:700;cursor:pointer">Accept all</button>' +
      '<button type="button" data-ck="essential" style="flex:1;min-width:130px;height:42px;border:1px solid #c5c9d0;border-radius:10px;background:#fff;color:#1a1c1e;font-weight:700;cursor:pointer">Essential only</button></div>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]'); if (b) { choose(b.dataset.ck); return; }
      if (e.target.closest('[data-ck-more]')) { e.preventDefault(); privacy(); }
    });
    document.body.appendChild(box);
  }
  window.daiCookieSettings = function () { show(); };
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-cookie-settings]')) { e.preventDefault(); var x = document.querySelector('[data-close-modal]'); if (x) x.click(); show(); } });
  function ready(f) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', f) : f(); }
  ready(function () { if (!C.value) show(); });
})();
