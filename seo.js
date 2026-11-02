/* Daisolve SEO helper.
   Product pages (/shop/<id>) and blog articles (/blog/<id>) are rendered in the browser from Supabase,
   so their title, description, canonical, Open Graph tags and JSON-LD are written here once the data is known.
   Googlebot renders JavaScript, so it sees the final values.
   Load BEFORE site.js / the blog script. */
(function () {
  var ORIGIN = 'https://www.daisolvetechnologies.co.ke';
  var DEFAULT_IMG = ORIGIN + '/og-image.jpg';

  function meta(attr, key, val) {
    var m = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m); }
    m.setAttribute('content', val);
  }
  function link(rel, href) {
    var l = document.head.querySelector('link[rel="' + rel + '"]');
    if (!l) { l = document.createElement('link'); l.rel = rel; document.head.appendChild(l); }
    l.href = href;
  }
  function abs(u) {
    if (!u) return DEFAULT_IMG;
    if (/^https?:/i.test(u)) return u;
    return ORIGIN + (u.charAt(0) === '/' ? '' : '/') + u;
  }
  function clip(s, n) {
    s = String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (s.length <= n) return s;
    return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
  }

  /* o: {title, desc, path, image, type, noindex, jsonld:[...], extra:{og:property:value}} */
  function set(o) {
    if (o.title) {
      document.title = o.title;
      meta('property', 'og:title', o.title);
      meta('name', 'twitter:title', o.title);
    }
    if (o.desc) {
      var d = clip(o.desc, 158);
      meta('name', 'description', d);
      meta('property', 'og:description', d);
      meta('name', 'twitter:description', d);
    }
    if (o.path) {
      var url = ORIGIN + o.path;
      link('canonical', url);
      meta('property', 'og:url', url);
    }
    var img = abs(o.image);
    meta('property', 'og:image', img);
    meta('name', 'twitter:image', img);
    meta('property', 'og:type', o.type || 'website');
    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'robots', o.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1');
    if (o.extra) Object.keys(o.extra).forEach(function (k) { meta('property', k, o.extra[k]); });

    if (o.jsonld && o.jsonld.length) {
      /* replace any earlier structured data on this page (the static /blog or /shop shell) */
      Array.prototype.slice.call(document.head.querySelectorAll('script[type="application/ld+json"]')).forEach(function (n) { n.remove(); });
    }
    (o.jsonld || []).forEach(function (obj) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-dai-ld', '1');
      s.text = JSON.stringify(obj);
      document.head.appendChild(s);
    });
  }

  function noindex() { meta('name', 'robots', 'noindex,follow'); }

  window.daiSEO = { ORIGIN: ORIGIN, set: set, noindex: noindex, abs: abs, clip: clip };
})();
