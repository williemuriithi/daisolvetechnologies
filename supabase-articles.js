/* Blog articles from Supabase. Load after supabase-catalog.js */
(function () {
  var S = window.DAI_SUPABASE || {};
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function mapA(r) {
    var rt = String(r.read_time || '').trim();
    return {id: r.id, title: r.title || '', ex: r.excerpt || '', cat: r.category || 'guide', tag: r.tag || '',
      read: /^\d+$/.test(rt) ? rt + ' min' : rt, body: r.body || '', img: r.img || '', feat: !!r.featured,
      foot: r.footer || '', author: r.author || '', published: r.published !== false, created: r.created_at};
  }
  function fmtDate(d) { try { return new Date(d).toLocaleDateString('en-KE', {day:'numeric', month:'short', year:'numeric'}); } catch (e) { return ''; } }
  /* body text -> safe HTML: blank line = new paragraph, "## " = heading, "- " lines = bullet list */
  function render(text) {
    return String(text || '').split(/\n\s*\n/).map(function (b) {
      b = b.trim(); if (!b) return '';
      if (/^## /.test(b)) return '<h3 class="text-lg font-bold text-price-primary mt-6 mb-2">' + esc(b.slice(3)) + '</h3>';
      var ls = b.split('\n');
      if (ls.every(function (l) { return /^\s*- /.test(l); })) return '<ul class="list-disc pl-5 space-y-1.5 my-3">' + ls.map(function (l) { return '<li>' + esc(l.replace(/^\s*- /, '')) + '</li>'; }).join('') + '</ul>';
      return '<p class="my-3">' + ls.map(esc).join('<br>') + '</p>';
    }).join('');
  }
  function load(cb) {
    fetch(S.url + '/rest/v1/articles?select=*&published=eq.true&order=created_at.desc', {headers: {apikey: S.key, Authorization: 'Bearer ' + S.key}})
      .then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) { cb(rows.map(mapA)); }).catch(function () { cb([]); });
  }
  window.daiArticles = {map: mapA, esc: esc, date: fmtDate, render: render, load: load};
})();
