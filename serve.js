// Local test server with the same clean URLs.  Run:  node serve.js   then open http://127.0.0.1:3000/home
const http = require('http'), fs = require('fs'), path = require('path');
const BR = 'samsung|apple|nokia|redmi|realmi|oppo|tecno|infinix|itel|villaon|vivo|honor|zte|modio|elimutab';
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon'};
function route(p) {
  p = p.replace(/\/+$/, '') || '/';
  if (p === '/') return {redirect: '/home'};
  let m;
  if (p === '/home') return {file: 'index.html'};
  if (p === '/shop') return {file: 'shop.html'};
  if (/^\/shop\/[^/]+$/.test(p)) return {file: 'product-default.html'};
  if (p === '/brands') return {file: 'brands.html'};
  if ((m = p.match(new RegExp('^/brands/(' + BR + ')$')))) return {file: m[1] + '.html'};
  if (p === '/blog' || /^\/blog\/[^/]+$/.test(p)) return {file: 'blog.html'};
  if ((m = p.match(/^\/(wishlist|account|checkout|admin)$/))) return {file: m[1] + '.html'};
  return {file: p.slice(1)};
}
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const r = route(u);
  if (r.redirect) { res.writeHead(301, {Location: r.redirect}); return res.end(); }
  const f = path.join(__dirname, r.file);
  if (!f.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'}); return res.end(fs.existsSync(path.join(__dirname, '404.html')) ? fs.readFileSync(path.join(__dirname, '404.html')) : 'Not found'); }
    res.writeHead(200, {'Content-Type': types[path.extname(f)] || 'application/octet-stream'}); res.end(d);
  });
}).listen(3000, () => console.log('Daisolve running at http://127.0.0.1:3000/home'));
