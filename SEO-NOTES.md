# SEO notes for daisolvetechnologies.co.ke

## What was done in this package
**Every public page**: keyword titles under 60 characters, unique meta descriptions, canonical, Open Graph + Twitter cards (new 1200x630 `og-image.jpg`), robots meta, favicon set (ico, 32, 192, apple-touch), `lang="en-KE"`, preconnect to Supabase.
**Home**: single H1, `MobilePhoneStore` + `WebSite` (sitelinks search box) JSON-LD with address, phone and opening hours, a crawlable "Buy genuine smartphones in Kenya" text block with links to all 15 brand pages, and a visible FAQ with matching `FAQPage` schema. Blog-card images now have real `alt` text (they used `data-alt`, which Google ignores).
**Shop / Brands / 15 brand pages**: `CollectionPage` + `BreadcrumbList` schema, rewritten titles/descriptions.
**Product pages (`/shop/<id>`)**: `seo.js` writes title, description, canonical, OG tags, `Product` (price in KES, availability, brand, images) and `BreadcrumbList` JSON-LD from the live product data. Unknown product URLs are set to `noindex` (no soft-404s).
**Blog articles (`/blog/<id>`)**: title, description (from the excerpt), canonical, OG tags and `Article` + `BreadcrumbList` JSON-LD. Unknown article ids are `noindex`.
**Private pages** (account, checkout, wishlist) are `noindex`; admin was already.
**Technical**: `robots.txt`, live `sitemap.xml` (served by `sitemap.php`; lists every product and published article from Supabase, cached 1 hour), trailing-slash 301s, gzip, browser caching, security headers, lazy-loaded images.
**Deploy**: `.cpanel.yml` now also copies images/icons, `robots.txt` and `sitemap.php`.

## Do these after deploying (this is where ranking actually moves)
1. **Google Search Console**: add the property `https://www.daisolvetechnologies.co.ke`, submit `https://www.daisolvetechnologies.co.ke/sitemap.xml`, then request indexing for /home, /shop and the top brand pages.
2. **Google Business Profile** (biggest lever for "phone shop Nairobi" / "phones near me"): claim it, use the exact name/address/phone shown on the site (Jamia Shopping Mall, Nairobi CBD, +254 790 835039), add photos, hours, and ask happy customers for reviews.
3. **Check the sitemap**: open `/sitemap.xml`. It should list /shop/<product> and /blog/<article> URLs. If only 19 static URLs appear, the server could not reach Supabase (check PHP curl is enabled in cPanel).
4. **Content**: publish a blog post a week targeting what Kenyans search ("best phones under 20,000 in Kenya", "Samsung A15 vs Tecno Spark 20", "how to spot a fake phone"). Give every product a unique 2-3 sentence description in Supabase.
5. **Backlinks and citations**: Kenyan business directories, Facebook/Instagram/TikTok profiles (then add them to `sameAs` in the home JSON-LD), tech blogs, local partners.
6. **Speed**: the site loads Tailwind from its CDN in the browser, which slows first paint (a ranking factor). Compiling Tailwind to a static CSS file is the best next technical step. The first-visit blocking request to Supabase in `supabase-catalog.js` is the second.

## Honest expectations
Nobody can guarantee position #1. Google decides rankings, and "buy phones Kenya" is contested by Jumia, Kilimall, Phones Store Kenya and others. This package fixes the technical and on-page basics so Google can crawl, understand and show the site well. Realistic first wins are the brand name, "<brand> phones Jamia Nairobi", and long-tail product queries; plan for 2-4 months of consistent content and reviews for the bigger terms.

## Decisions to know about
- Star ratings were removed from the product schema. The old code marked up `rating`/`reviews` from the database; Google can penalise review markup that isn't from real customer reviews. Re-add `aggregateRating` in `site.js` only if those numbers are genuine.
- The homepage canonical stays `/home` (as before; `/` 301s to it). Changing it would need a site-wide link change.
