# Changelog

## v1.5.2 - SEO audit fixes (code side)

These cover the audit items that live in the codebase. The remaining items live
in the blog CMS content or are infrastructure or product decisions, listed at
the bottom.

### Multiple H1 tags
Three templates rendered more than one H1, which the audit flagged across the
vehicle pages, the blog, and the FAQ page.

- `src/components/pagesComponent/VehicleDetailsClient .tsx`
  The "Add Booking Details" section heading was an H1. Changed to H2. The
  vehicle name stays the single H1. Fixes the 318 `/booking` pages.
- `src/components/blogComponent/Blogdetailsclient.tsx`
  The "Blog" banner label was an H1 alongside the post title H1. Changed the
  banner to a styled span so the post title is the only H1. Fixes the blog
  template side. Any extra H1 still flagged on a post comes from the post body
  HTML in the CMS, not this template.
- `src/app/faq/FAQPageClient.tsx`
  The heading was split into two H1 tags ("Frequently Asked" and "Questions").
  Merged into one H1 with two spans. Same visual, one H1.

### Vehicle page meta description too short
- `src/app/booking/details/[id]/page.tsx`
  The generated description was short for vehicles with short names. Lengthened
  it and made it reflect the chauffeur-and-fuel model:
  Before: `Rent {name} ({year}) in {city}. {type} with {seats} seats. Book instantly with flexible pricing.`
  After: `Rent {name} ({year}) in {city} with a professional chauffeur and fuel. {type} seating {seats}, available for hourly, daily, and monthly hire. Book instantly with flexible pricing on Muvment.`

### Broken internal link in code
- `src/components/HomeComponent/RideSelection.tsx`
  The "Explore Electric Cars" button pointed at `/explore/categories?type=SUVElectric`,
  which is not a real route and returned 404. Repointed to `/explore?category=Electric`,
  which is the valid explore route.

### Verification
- `npx tsc --noEmit`: clean.
- Each touched template now has exactly one H1.
- `next build` compiles. In a no-network environment it stops at the Google
  Fonts fetch step, which is unrelated to these changes.

### Deploy

```bash
SRC=~/Downloads/muvment-customer-v1.5.2-seo-audit-fixes
DEST=~/muvment-customer

cp "$SRC/src/app/faq/FAQPageClient.tsx"                            "$DEST/src/app/faq/FAQPageClient.tsx"
cp "$SRC/src/app/booking/details/[id]/page.tsx"                   "$DEST/src/app/booking/details/[id]/page.tsx"
cp "$SRC/src/components/pagesComponent/VehicleDetailsClient .tsx" "$DEST/src/components/pagesComponent/VehicleDetailsClient .tsx"
cp "$SRC/src/components/blogComponent/Blogdetailsclient.tsx"      "$DEST/src/components/blogComponent/Blogdetailsclient.tsx"
cp "$SRC/src/components/HomeComponent/RideSelection.tsx"          "$DEST/src/components/HomeComponent/RideSelection.tsx"
cp "$SRC/CHANGELOG.md"                                            "$DEST/CHANGELOG.md"

cd "$DEST"
git fetch origin
git checkout staging
git pull origin staging
git checkout -b perf/v1.5.2-seo-audit-fixes
npx tsc --noEmit
npm run build
git add .
git commit -m "v1.5.2: SEO audit fixes - single H1 per template, longer vehicle meta description, fix broken explore link"
git push -u origin perf/v1.5.2-seo-audit-fixes
```

Note the filename `VehicleDetailsClient .tsx` has a space in it. The quotes in the
cp command above handle it. Keep them.

### Not in this release (handled elsewhere)

Blog CMS content (apply in the blog editor, find and replace):
- Wrong blog slugs that 404:
  - /blog/best-suv-rental-lagos -> /blog/best-suvs-to-rent-in-lagos-toyota-prado-vs-land-cruiser-vs-highlander-vs-lexus-gx-2026-xrnqzj
  - /blog/mmia-airport-pickup-guide -> /blog/murtala-muhammed-airport-pickup-your-stress-free-guide-to-arriving-in-lagos-2026-g3imd1
  - /blog/make-money-with-your-car-nigeria -> /blog/make-money-with-your-car-in-nigeria-a-realistic-guide-to-hosting-on-muvment-83dzfq
  - /blog/detty-december-lagos -> /blog/detty-december-in-lagos-complete-transportation-survival-guide-for-diaspora-r3yrcj
- Marketing URLs that are not real routes:
  - /become-a-host -> /partner-with-us
  - /airport-pickup-lagos -> the MMIA blog post above
  - /wedding-car-rental-lagos -> /blog/wedding-car-hire-in-lagos-2026-prices-top-cars-booking-tips-mv9by4
  - /long-term-rental and /cars -> /explore
  - /explore/cities/{city} -> /explore?city={City}
  - /explore/categories?type=truck -> /explore?category=Truck
- Any http:// internal links in the policy pages and post bodies -> https://

Developer or product:
- Orphan pages: the 322 `/booking` vehicle pages and the blog posts have no
  internal links a crawler can follow. Add server-rendered internal links into
  vehicle pages (for example from the explore listing) so they are reachable.
- Special pricing pages: H1 and most text are gated behind client data, so the
  crawler sees no H1 and low word count. Render a server-side heading on
  `/booking/[id]/special-pricing`.
- Home page title shows as too short or mismatched in search. Confirm the
  rendered title matches the metadata.
- The http to https to www redirect chain is handled at the host or CDN, not in
  this repo.
- Decide whether `/explore/cities/*` and the marketing URLs should be built as
  real pages or just unlinked.
