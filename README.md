# Daisolve Technologies website
Static HTML + Tailwind CDN + vanilla JS, Supabase for data. Hosted on Truehost (cPanel / Apache).
Deploy: push to `main`, then in cPanel > Git Version Control > Manage > Update from Remote > Deploy HEAD Commit.

SEO: see SEO-NOTES.md. `seo.js` sets per-product/per-article meta + JSON-LD, `sitemap.php` serves /sitemap.xml, `robots.txt` is in the root.

Customer accounts + reviews: run `supabase-customers-reviews.sql` once in the Supabase SQL Editor. Signup/login/reviews go through its RPC functions (no email verification). Not deployed to cPanel.
