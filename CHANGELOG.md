# Muvment Customer — v1.4.1

**Release type:** Patch (metadata cleanup, address casing, sitemap filter, alt text improvements)

**Slug:** metadata-cleanup

## Summary

Closes the remaining SEO items from the audit. Six fixes bundled together:

1. Title duplication on About Us, Contact Us, and other pages
2. Contact Us meta-description still saying Victoria Island
3. Contact Us body address casing fix
4. Contact Us keywords still containing Victoria Island
5. Stale UUID-based blog URL in sitemap
6. Founder image alt text improvement
7. RideSelection EV section alt texts improvement

(Items 5 from the open list — stale self-drive keywords on cached pages — auto-resolves when those page files change, which they do in this patch.)

All TypeScript validation passes. No new dependencies.

---

## Fix 1: Title duplication on multiple pages

### `src/helpers/metadata.ts`

**Issue:** Live production showed `About Us | Muvment by Autogirl | Muvment by Autogirl` and `Contact Us | Muvment by Autogirl | Muvment by Autogirl` in browser tabs and search results. Brand name doubled.

**Root cause:** `generatePageMetadata` was setting `title: { absolute: fullTitle }` where `fullTitle` already included the brand suffix. The layout's `title.template` configuration was still appending the brand to the absolute value in some static-build scenarios.

**Fix:** changed the return value from:

```typescript
title: { absolute: fullTitle },
```

to:

```typescript
title,
```

Now the page-level metadata returns just the page name (e.g., "About Us") and the layout's `template: "%s | Muvment by Autogirl"` adds the brand suffix exactly once. Single brand always, on every page, consistently.

OG title and Twitter title still use `fullTitle` (the version with brand suffix included) because those don't go through the template.

---

## Fix 2: Contact Us description with correct address

### `src/app/contact-us/page.tsx`

**Issue:** Page-level meta-description still said "Visit us at Victoria Island, Lagos" even after v1.4.0 updated the LocalBusiness schema and body content. This description shows in Google search result snippets.

**Fix:** updated the description string:

```typescript
description:
  "Get in touch with Muvment by Autogirl. We're here to help with your car rental needs. Visit us at 10 Anuoluwapo Close, Opebi, Ikeja, Lagos or reach out via phone, email, or social media.",
```

---

## Fix 3: Address casing in Contact Us body

### `src/components/pagesComponent/ContactUsClient.tsx` line 157

**Issue:** Hardcoded address in the contact card displayed as `10 ANUOLUWAPO close, opebi, ikeja`. Wrong casing, unprofessional.

**Fix:** corrected to:

```
10 Anuoluwapo Close, Opebi, Ikeja, Lagos
```

Proper title case throughout, full city included.

---

## Fix 4: Contact Us keywords cleanup

### `src/app/contact-us/page.tsx`

**Issue:** Keywords array still contained `"Victoria Island"`.

**Fix:** replaced with `"Opebi Ikeja"`:

```typescript
keywords: [
  "contact Autogirl",
  "Muvment contact",
  "car rental support Nigeria",
  "Autogirl customer service",
  "Lagos car rental contact",
  "Opebi Ikeja",
],
```

---

## Fix 5: Sitemap filter for stale UUID blog URLs

### `src/app/sitemap.ts`

**Issue:** Old blog URL `https://www.muvment.ng/blog/14087ba2-c082-4618-8970-e80f7dfbf4ad` was still in the sitemap and returned "Post Not Found" when crawled. The API was returning a post whose slug was a raw UUID (likely an unpublished or legacy post that should have been removed or given a proper slug).

**Fix:** added a regex filter that excludes posts whose slug matches the UUID pattern:

```typescript
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const blogEntries = (blogsJson?.data?.content || [])
  .filter((post: any) => post.slug && !UUID_PATTERN.test(post.slug))
  .map(...);
```

This is a frontend safeguard so that any future posts without a proper slug (or legacy posts that were never reslugged) won't pollute the sitemap. The backend should still be fixed to either give those posts proper slugs or filter them from the public API response, but this protects against the broken URLs reaching Google crawlers.

---

## Fix 6: Founder image alt text improvement

### `src/components/AboutUsComponent/OurStory.tsx` line 54

**Before:**
```html
<img src="/images/image9.png" alt="Founder" />
```

**After:**
```html
<img src="/images/image9.png" alt="Chinazom Arinze, CEO and co-founder of Muvment by Autogirl" />
```

Descriptive alt text helps with:
- Image search SEO (the founder's name becomes searchable)
- Screen reader accessibility
- Google's understanding of who the company's founder is

---

## Fix 7: RideSelection EV section alt texts

### `src/components/HomeComponent/RideSelection.tsx` lines 52, 63, 74

**Before** (generic, low SEO value):
- `alt="Premium Electric Car"`
- `alt="Luxury EV Interior"`
- `alt="Fast Charging"`

**After** (descriptive, service-specific):
- `alt="Premium electric chauffeured car rental in Lagos"`
- `alt="Luxury electric vehicle interior with leather seating"`
- `alt="Fast-charging electric vehicle in Muvment Nigeria rental fleet"`

These alt texts now communicate both the visual content AND the service context, which helps both image search and accessibility.

---

## Files changed

```
src/app/contact-us/page.tsx
src/app/sitemap.ts
src/components/AboutUsComponent/OurStory.tsx
src/components/HomeComponent/RideSelection.tsx
src/components/pagesComponent/ContactUsClient.tsx
src/helpers/metadata.ts
```

6 files. No new dependencies. No config changes.

## What this patch unlocks (side benefit)

Because four of these files are static-rendered pages or used by static-rendered pages, this patch will trigger a fresh static build of:

- `/about-us` (uses metadata.ts via generatePageMetadata, plus OurStory component)
- `/contact-us` (page.tsx and ContactUsClient.tsx both change)
- `/` homepage (uses RideSelection component, plus metadata.ts)

This resolves the issue where those pages were serving stale meta-keywords ("Self drive car rental Nigeria") from old static builds, because the fresh build will pick up the v1.4.0 metadata.ts changes (which have "Monthly car rental Lagos").

## Verification

TypeScript compilation: clean, zero errors (`npx tsc --noEmit`)

Title pattern: pages using `generatePageMetadata` will now show single-brand titles in browser tabs and search results.

Build status: not run locally due to sandbox network restrictions on Google Fonts. Build should succeed on your machine where Google Fonts is reachable.

---

## After deploying

### Verify the title fix

Visit these pages and check the browser tab title:

- `https://www.muvment.ng/about-us` → should be "About Us | Muvment by Autogirl" (single brand)
- `https://www.muvment.ng/contact-us` → should be "Contact Us | Muvment by Autogirl" (single brand)
- `https://www.muvment.ng/faq` → should be "FAQ | Muvment by Autogirl" (single brand)
- `https://www.muvment.ng/impact` → should be "Our Impact | Muvment by Autogirl" (single brand)
- `https://www.muvment.ng/partner-with-us` → should be "Partner With Us | Muvment by Autogirl" (single brand)

### Verify the Contact Us address

- Body text should show: "10 Anuoluwapo Close, Opebi, Ikeja, Lagos" (proper casing)
- View page source, find meta description: should mention "10 Anuoluwapo Close, Opebi, Ikeja, Lagos"
- View page source, meta-keywords: should NOT contain "Victoria Island"

### Verify sitemap

Visit `https://www.muvment.ng/sitemap.xml`. Search for "14087ba2". Should find zero matches.

---

## Deploy

```bash
cd ~/Downloads
unzip -o muvment-customer-v1.4.1-metadata-cleanup.zip

cp muvment-customer-v1.4.1-metadata-cleanup/src/helpers/metadata.ts ~/muvment-customer/src/helpers/metadata.ts
cp muvment-customer-v1.4.1-metadata-cleanup/src/app/contact-us/page.tsx ~/muvment-customer/src/app/contact-us/page.tsx
cp muvment-customer-v1.4.1-metadata-cleanup/src/app/sitemap.ts ~/muvment-customer/src/app/sitemap.ts
cp muvment-customer-v1.4.1-metadata-cleanup/src/components/pagesComponent/ContactUsClient.tsx ~/muvment-customer/src/components/pagesComponent/ContactUsClient.tsx
cp muvment-customer-v1.4.1-metadata-cleanup/src/components/AboutUsComponent/OurStory.tsx ~/muvment-customer/src/components/AboutUsComponent/OurStory.tsx
cp muvment-customer-v1.4.1-metadata-cleanup/src/components/HomeComponent/RideSelection.tsx ~/muvment-customer/src/components/HomeComponent/RideSelection.tsx
cp muvment-customer-v1.4.1-metadata-cleanup/CHANGELOG.md ~/muvment-customer/CHANGELOG.md

cd ~/muvment-customer
npm run build

# Use the team's normal staging-first workflow
git checkout staging
git pull origin staging
git add .
git commit -m "v1.4.1: Metadata cleanup, address casing, sitemap UUID filter, alt text improvements

Title duplication fix: pages using generatePageMetadata now show single
brand suffix instead of doubled (was 'About Us | Muvment by Autogirl |
Muvment by Autogirl', now correctly 'About Us | Muvment by Autogirl').

Contact Us metadata cleanup:
- Description updated from Victoria Island to 10 Anuoluwapo Close, Opebi, Ikeja, Lagos
- Keywords cleaned: Victoria Island replaced with Opebi Ikeja
- Body address casing fixed from '10 ANUOLUWAPO close, opebi, ikeja' to
  '10 Anuoluwapo Close, Opebi, Ikeja, Lagos'

Sitemap UUID filter: added regex to exclude blog posts whose slug is a
raw UUID (these were broken URLs returning 'Post Not Found' to crawlers).

Alt text improvements:
- Founder image: 'Founder' → 'Chinazom Arinze, CEO and co-founder of
  Muvment by Autogirl'
- RideSelection EV section: three generic alts upgraded to descriptive
  SEO-friendly versions

6 files changed. Zero new dependencies. TypeScript validation passes.
"
git push origin staging

# After staging deploy succeeds and is verified, merge to main via PR
```
