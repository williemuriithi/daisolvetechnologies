/* Loads products from Supabase and replaces window.DAI_CATALOG.
   Load right after catalog.js (static list stays as an offline fallback). */
(function () {
  var URL_ = 'https://jqheuhswyjvyvlkpncky.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaGV1aHN3eWp2eXZsa3BuY2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjEzMjMsImV4cCI6MjEwODkzNzMyM30.3dZzaxGfE9QgDBSRnA9_c0yTmDYKf-tqbAccRmpoNGg';
  var ENDPOINT = URL_ + '/rest/v1/products?select=*&order=sort_order.asc';
  var CK = 'dai_db_catalog';
  window.DAI_SUPABASE = { url: URL_, key: KEY };

  function map(r) {
    return {
      id: r.id, name: r.name, brand: r.brand, price: Number(r.price), old: r.old == null ? null : Number(r.old),
      ram: r.ram, storage: r.storage, net: r.net, tags: r.tags || [], rating: Number(r.rating || 0), reviews: r.reviews || 0,
      chips: r.chips || [], badge: r.badge || '', badgeCls: r.badge_cls || '', corner: r.corner || '', sub: r.sub || '',
      dot: !!r.dot, img: r.img || null, inDom: !!r.in_dom, spec: r.spec || '', cat: r.cat || '', color: r.color || '#1769ff',
      short: r.short || '', details: r.details || undefined, stock: r.stock
    };
  }
  function apply(rows) {
    if (rows && rows.length) window.DAI_CATALOG = rows.map(map);
  }
  function save(rows) { try { localStorage.setItem(CK, JSON.stringify({ t: Date.now(), rows: rows })); } catch (e) {} }
  function headers(x) { x.setRequestHeader('apikey', KEY); x.setRequestHeader('Authorization', 'Bearer ' + KEY); }

  window.DAI_SUPABASE.map = map; window.DAI_SUPABASE.save = save; window.DAI_SUPABASE.endpoint = ENDPOINT;

  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(CK) || 'null'); } catch (e) {}

  if (cached && cached.rows && cached.rows.length) {
    apply(cached.rows);
    /* refresh in background for the next page load */
    try {
      var x = new XMLHttpRequest(); x.open('GET', ENDPOINT, true); headers(x);
      x.onload = function () { if (x.status === 200) { try { var d = JSON.parse(x.responseText); if (d.length) save(d); } catch (e) {} } };
      x.send();
    } catch (e) {}
  } else {
    /* first visit: one blocking request so pages render with live data */
    try {
      var s = new XMLHttpRequest(); s.open('GET', ENDPOINT, false); headers(s); s.send();
      if (s.status === 200) { var rows = JSON.parse(s.responseText); apply(rows); if (rows.length) save(rows); }
    } catch (e) { /* keep static catalog.js */ }
  }
})();
