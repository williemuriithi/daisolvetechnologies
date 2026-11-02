<?php
/* Live XML sitemap, served at /sitemap.xml (see .htaccess).
   Lists the main pages, every brand page, every product (/shop/<id>) and every published blog article,
   read from Supabase so new products and posts appear automatically. Cached for 1 hour.
   If Supabase cannot be reached it still returns the static pages. */
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');
header('X-Robots-Tag: noindex');

$origin = 'https://www.daisolvetechnologies.co.ke';
$sb  = getenv('DAI_SB_URL') ?: 'https://jqheuhswyjvyvlkpncky.supabase.co';
$key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaGV1aHN3eWp2eXZsa3BuY2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjEzMjMsImV4cCI6MjEwODkzNzMyM30.3dZzaxGfE9QgDBSRnA9_c0yTmDYKf-tqbAccRmpoNGg';
$cache = sys_get_temp_dir() . '/dai_sitemap_' . md5($sb) . '.xml';

if (is_file($cache) && (time() - filemtime($cache)) < 3600) { readfile($cache); exit; }

function dai_get($url, $key) {
    $h = ['apikey: ' . $key, 'Authorization: Bearer ' . $key];
    if (function_exists('curl_init')) {
        $c = curl_init($url);
        curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $h, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4]);
        $r = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
        if ($r === false || $code !== 200) return null;
    } else {
        $ctx = stream_context_create(['http' => ['header' => implode("\r\n", $h), 'timeout' => 8]]);
        $r = @file_get_contents($url, false, $ctx);
        if ($r === false) return null;
    }
    $j = json_decode($r, true);
    return is_array($j) ? $j : null;
}
function x($s) { return htmlspecialchars($s, ENT_XML1 | ENT_QUOTES, 'UTF-8'); }
function dai_url($loc, $freq, $prio, $lastmod = null, $img = null, $imgTitle = null) {
    $o = "  <url>\n    <loc>" . x($loc) . "</loc>\n";
    if ($lastmod) $o .= "    <lastmod>" . x($lastmod) . "</lastmod>\n";
    $o .= "    <changefreq>$freq</changefreq>\n    <priority>$prio</priority>\n";
    if ($img && preg_match('#^https?://#i', $img)) {
        $o .= "    <image:image><image:loc>" . x($img) . "</image:loc>";
        if ($imgTitle) $o .= "<image:title>" . x($imgTitle) . "</image:title>";
        $o .= "</image:image>\n";
    }
    return $o . "  </url>\n";
}

$today = gmdate('Y-m-d');
$out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" .
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";
$out .= dai_url("$origin/home", 'daily', '1.0', $today);
$out .= dai_url("$origin/shop", 'daily', '0.9', $today);
$out .= dai_url("$origin/brands", 'weekly', '0.8', $today);
foreach (['samsung','apple','nokia','redmi','realmi','oppo','tecno','infinix','itel','villaon','vivo','honor','zte','modio','elimutab'] as $b) {
    $out .= dai_url("$origin/brands/$b", 'daily', '0.8', $today);
}
$out .= dai_url("$origin/blog", 'weekly', '0.7', $today);

$ok = true;
$products = dai_get("$sb/rest/v1/products?select=id,name,img&order=sort_order.asc&limit=5000", $key);
if ($products === null) { $ok = false; $products = []; }
foreach ($products as $p) {
    if (empty($p['id'])) continue;
    $out .= dai_url("$origin/shop/" . rawurlencode($p['id']), 'weekly', '0.8', $today, $p['img'] ?? null, $p['name'] ?? null);
}
$articles = dai_get("$sb/rest/v1/articles?select=id,title,img,created_at&published=eq.true&order=created_at.desc&limit=5000", $key);
if ($articles === null) { $ok = false; $articles = []; }
foreach ($articles as $a) {
    if (empty($a['id'])) continue;
    $lm = !empty($a['created_at']) ? substr($a['created_at'], 0, 10) : null;
    $out .= dai_url("$origin/blog/" . rawurlencode($a['id']), 'monthly', '0.6', $lm, $a['img'] ?? null, $a['title'] ?? null);
}
$out .= "</urlset>\n";

/* only cache a complete sitemap, so a short Supabase outage is not remembered for an hour */
if ($ok) { @file_put_contents($cache, $out, LOCK_EX); }
echo $out;
