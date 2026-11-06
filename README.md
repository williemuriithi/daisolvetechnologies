# Daisolve Technologies website
Static HTML + Tailwind CDN + vanilla JS, Supabase for data. Hosted on Truehost (cPanel / Apache).
Deploy: push to `main`, then in cPanel > Git Version Control > Manage > Update from Remote > Deploy HEAD Commit.

SEO: see SEO-NOTES.md. `seo.js` sets per-product/per-article meta + JSON-LD, `sitemap.php` serves /sitemap.xml, `robots.txt` is in the root.

Accounts + reviews + admin lock: run `supabase-customers-reviews.sql` once in the Supabase SQL Editor (not deployed to cPanel). Admin emails live in that file (`is_admin()`) and in admin.html (`ADMIN_EMAILS`).
Black November sale: `promo.js` (edit PCT and END at the top). It marks every phone down and shows the home-page countdown popup; it switches itself off after END.
