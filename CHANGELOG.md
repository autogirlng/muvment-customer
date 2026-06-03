# Muvment Customer — v1.4.0

**Release type:** Minor (bundled SEO cleanup pass)

**Slug:** seo-cleanup-pass

## Summary

Closes out the remaining SEO audit items in a single deploy. Five fixes bundled together:

1. LocalBusiness schema address update (Opebi office, phone, postal code, correct coordinates)
2. Blog Footer URL bug fix (`?city=lagosundefined`)
3. Sitemap cleanup (removed auth pages, real vehicle update dates)
4. Keyword cleanup (removed self-drive references, fixed misleading error message)
5. Additional JSON-LD schema on `/blog`, `/impact`, `/partner-with-us`, `/booking/explore`

All TypeScript validation passes. No new dependencies introduced.

---

## Fix 1: LocalBusiness schema with real address

### `src/helpers/schema.tsx`

**Three places updated** with the actual Opebi office details:

1. `Organization.contactPoint` (line 43-50): added `telephone: "+2348167474165"`
2. `localBusiness()` (line 99-130): full address overhaul
3. `contactPage().mainEntity` (line 262-309): same full address overhaul

### Before

```typescript
address: {
  "@type": "PostalAddress",
  addressLocality: "Victoria Island",
  addressRegion: "Lagos",
  addressCountry: "NG",
},
geo: { "@type": "GeoCoordinates", latitude: 6.4281, longitude: 3.4219 },
```

### After

```typescript
telephone: "+2348167474165",
address: {
  "@type": "PostalAddress",
  streetAddress: "10 Anuoluwapo Close, Opebi",
  addressLocality: "Ikeja",
  addressRegion: "Lagos",
  postalCode: "100281",
  addressCountry: "NG",
},
geo: { "@type": "GeoCoordinates", latitude: 6.5836, longitude: 3.3528 },
```

The geo coordinates were previously pointing at Victoria Island (6.4281, 3.4219). They now point at Opebi, Ikeja (6.5836, 3.3528). Postal code 100281 is confirmed for the Opebi area.

The `contactPage()` description text was also updated from "visit us in Victoria Island, Lagos" to "visit us at 10 Anuoluwapo Close, Opebi, Ikeja, Lagos".

---

## Fix 2: Blog Footer `?city=lagosundefined` bug

### `src/components/HomeComponent/Footer.tsx`

The issue: when the Footer is rendered on blog pages without a `bookingTypeID` prop, the internal `useEffect` fetches booking types from the API. If the API returns a value that gets cast to the literal string "undefined", the URL builder appends it as `&bookingType=undefined`, producing broken city links.

**Two guards added.**

### Guard 1: at the source (useEffect)

```typescript
// Before
if (data.dropdownOptions?.length > 0) {
  setBookingType(data.dropdownOptions[0].value);
}

// After
if (data.dropdownOptions?.length > 0) {
  const value = data.dropdownOptions[0].value;
  if (value && value !== "undefined") {
    setBookingType(value);
  }
}
```

### Guard 2: at the URL template

```typescript
// Before
href={`${navLink.link}${bookingType ? `&bookingType=${bookingType}` : ""}`}

// After
href={`${navLink.link}${
  bookingType && bookingType !== "undefined"
    ? `&bookingType=${bookingType}`
    : ""
}`}
```

Both guards together ensure the bug cannot reappear from either layer.

---

## Fix 3: Sitemap cleanup

### `src/app/sitemap.ts`

### Removed from staticRoutes

Three low-value auth pages that shouldn't be in search results:

- `/auth/forgot-password`
- `/auth/login`
- `/auth/register`

Removing these gets them out of the sitemap. They were already disallowed in `robots.ts`, but the inconsistency between sitemap (including them) and robots (disallowing them) sends a confusing signal to Google. Removing from sitemap aligns both files.

### Vehicle entries now use real timestamps

```typescript
// Before
const vehicleEntries = (vehiclesJson?.data?.content || [])
  .filter((v: any) => v.slug)
  .map((v: any) => ({
    url: `${APP_URL}/booking/details/${v.slug}`,
    lastModified: new Date(),  // always current time
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

// After
const vehicleEntries = (vehiclesJson?.data?.content || [])
  .filter((v: any) => v.slug)
  .map((v: any) => ({
    url: `${APP_URL}/booking/details/${v.slug}`,
    lastModified: new Date(v.updatedAt || v.createdAt || Date.now()),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));
```

Google uses `lastModified` to prioritize recrawling. When every URL has the same timestamp, the signal is meaningless. Now vehicles that were actually updated recently get the right recrawl priority.

---

## Fix 4: Keyword cleanup + appClient error message

### `src/helpers/metadata.ts`

Removed "Self drive car rental Nigeria" from `SEO_DEFAULTS.keywords`. Replaced with "Monthly car rental Lagos".

### `src/app/layout.tsx`

Removed "Self drive car rental" from the keywords array. Replaced with "Monthly car rental Lagos".

These are spread across every page via `generatePageMetadata`. Muvment no longer offers self-drive, so the keyword was creating false intent signal for users searching that term.

### `src/controllers/connnector/appClient.ts`

Fixed misleading error message in two places (lines 24 and 86):

```typescript
// Before
throw new Error("NEXT_PUBLIC_BASE_URL is not defined");

// After
throw new Error("NEXT_PUBLIC_API_URL is not defined");
```

The code reads `process.env.NEXT_PUBLIC_API_URL` but the error message referenced `NEXT_PUBLIC_BASE_URL`, which doesn't exist anywhere. This was a quiet trap for any developer setting up the project locally.

---

## Fix 5: Additional JSON-LD schema on remaining content pages

### `src/helpers/schema.tsx` — two new methods added

#### `blogIndex()`

Returns `Blog` schema for the blog landing page. Includes:

- `@type: Blog`
- name, url, description, inLanguage
- Reference to website and organization
- Breadcrumb (Home → Blog)

#### `genericWebPage({ path, name, description })`

Reusable method for content pages that don't have a more specific schema type. Returns `WebPage` schema with name, url, description, breadcrumb, and website/organization references.

### Pages updated to inject schema

#### `src/app/blog/page.tsx`

Added `<JsonLd schema={SchemaBuilder.blogIndex()} />` to the render output. Blog schema is now visible to crawlers on the blog index page.

#### `src/app/impact/page.tsx`

Added `<JsonLd schema={SchemaBuilder.genericWebPage(...)} />` with impact-specific description.

#### `src/app/partner-with-us/page.tsx`

Added `<JsonLd schema={SchemaBuilder.genericWebPage(...)} />` with partner-specific description.

**Bug also fixed here:** the canonical URL was previously set to `/partner` but the actual route is `/partner-with-us`. Corrected.

#### `src/app/booking/explore/page.tsx`

Added `<JsonLd schema={SchemaBuilder.searchResultsPage({ city, category, path: "/booking/explore" })} />`. Now matches the schema treatment already on `/booking/search` and `/explore`.

---

## Files changed

```
src/app/blog/page.tsx
src/app/booking/explore/page.tsx
src/app/impact/page.tsx
src/app/layout.tsx
src/app/partner-with-us/page.tsx
src/app/sitemap.ts
src/components/HomeComponent/Footer.tsx
src/controllers/connnector/appClient.ts
src/helpers/metadata.ts
src/helpers/schema.tsx
```

10 files, all production code. No config changes. No new dependencies.

## Verification

TypeScript compilation: clean, zero errors (`npx tsc --noEmit`)

Schema validity: All schemas extend existing `SchemaBuilder` patterns that are already in use elsewhere in the codebase. The two new methods (`blogIndex()` and `genericWebPage()`) follow Schema.org spec and use the same `buildBreadcrumb()` helper as existing methods.

Build status: not run locally due to sandbox network restrictions on Google Fonts. Should build cleanly on your machine.

---

## After deploying

### Verify each schema with Google Rich Results Test

For each URL below, paste into https://search.google.com/test/rich-results and confirm the expected schema is detected:

| URL | Expected detected items |
|---|---|
| `https://www.muvment.ng/` | Organization, WebSite, FAQPage |
| `https://www.muvment.ng/blog` | Blog |
| `https://www.muvment.ng/impact` | WebPage |
| `https://www.muvment.ng/partner-with-us` | WebPage |
| `https://www.muvment.ng/booking/explore?city=Lagos` | SearchResultsPage |
| `https://www.muvment.ng/contact-us` | ContactPage, LocalBusiness (with new address) |

### Verify the Footer bug fix

Visit any blog post page. Scroll to the footer. Click any city link. The URL should be clean (`?city=lagos&bookingType=...`), not `?city=lagosundefined`.

### Verify the sitemap

Visit `https://www.muvment.ng/sitemap.xml`. Confirm:

- No `/auth/forgot-password`, `/auth/login`, or `/auth/register` entries
- Vehicle entries have meaningful `lastmod` dates that vary based on when each vehicle was last updated

---

## Deploy

```bash
cd ~/Downloads
unzip -o muvment-customer-v1.4.0-seo-cleanup-pass.zip -d muvment-customer-v1.4.0-seo-cleanup-pass/

cp muvment-customer-v1.4.0-seo-cleanup-pass/src/app/blog/page.tsx ~/muvment-customer/src/app/blog/page.tsx
cp muvment-customer-v1.4.0-seo-cleanup-pass/src/app/booking/explore/page.tsx ~/muvment-customer/src/app/booking/explore/page.tsx
cp muvment-customer-v1.4.0-seo-cleanup-pass/src/app/impact/page.tsx ~/muvment-customer/src/app/impact/page.tsx
cp muvment-customer-v1.4.0-seo-cleanup-pass/src/app/layout.tsx ~/muvment-customer/src/app/layout.tsx
cp muvment-customer-v1.4.0-seo-cleanup-pass/src/app/partner-with-us/page.tsx ~/muvment-customer/src/app/partner-with-us/page.tsx
cp muvment-customer-v1.4.0-seo-cleanup-pass/src/app/sitemap.ts ~/muvment-customer/src/app/sitemap.ts
cp muvment-customer-v1.4.0-seo-cleanup-pass/src/components/HomeComponent/Footer.tsx ~/muvment-customer/src/components/HomeComponent/Footer.tsx
cp muvment-customer-v1.4.0-seo-cleanup-pass/src/controllers/connnector/appClient.ts ~/muvment-customer/src/controllers/connnector/appClient.ts
cp muvment-customer-v1.4.0-seo-cleanup-pass/src/helpers/metadata.ts ~/muvment-customer/src/helpers/metadata.ts
cp muvment-customer-v1.4.0-seo-cleanup-pass/src/helpers/schema.tsx ~/muvment-customer/src/helpers/schema.tsx
cp muvment-customer-v1.4.0-seo-cleanup-pass/CHANGELOG.md ~/muvment-customer/CHANGELOG.md

cd ~/muvment-customer
npm run build

git add .
git commit -m "v1.4.0: SEO cleanup pass (address, footer bug, sitemap, keywords, schema)"
git push origin main
```
