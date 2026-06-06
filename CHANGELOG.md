# Muvment Customer, v1.8.1 (FAQ redesign, expanded content, search, booking CTA)

Note (v1.8.1): removed the "Still have questions?" panel at the foot of the FAQ page, since it competed with the booking call to action directly below it. The booking call to action is now the single action at the base of the page.

## Summary

Merged the FAQ page redesign (the gradient hero, the sticky category
navigation, and the bordered accordion layout) with the expanded content set
and the search and booking call to action. The redesign and the content work
had been done separately and one had overwritten the other; this brings them
together into a single page. The Terms and Privacy pages keep the booking call
to action through the shared policy layout, and the FAQ structured data stays
in step with the page.

## What changed in this version

### FAQ page (src/app/faq/FAQPageClient.tsx)

- Kept the redesigned hero: the gradient card with the "Help Center" eyebrow,
  the serif heading, and the supporting line.
- Kept the redesigned body layout: the sticky category dropdown on mobile, the
  sticky category list on desktop, and the bordered accordion cards that
  highlight when open.
- Replaced the page's built-in 9-question list with the approved set of 53
  questions across 13 sections, read from the shared content file so the page
  and the structured data always match.
- Added a search box in the hero. It filters questions and answers as you type,
  hides categories with no match, dims categories in the side list that the
  current search cannot reach, expands every match so the answers read at a
  glance, and shows a contact prompt when nothing matches.
- Removed the image carousel that previously sat between the questions and the
  footer.
- Added the booking call to action before the footer.
- Removed the "Still have questions?" panel so the booking call to action is the only action at the base of the page.

### Booking call to action (src/components/general/BookingCTA.tsx)

- Shared component with a "Book a ride" button (to /booking/search) and a
  "Talk to our team" button (to /contact-us).
- Used before the footer on the FAQ page and, through the shared policy layout,
  on both the Terms and the Privacy pages.

### FAQ content source (src/data/faq.ts)

- Holds all FAQ questions and answers. The FAQ page and the FAQ structured data
  both read from it.

### Structured data (src/helpers/schema.tsx)

- The FAQ schema builds from the shared content file, so it reflects the 53
  live questions.

### Policy layout (src/components/pagesComponent/PolicyLayout.tsx)

- Renders the booking call to action before the footer, which places it on both
  the Terms and the Privacy pages.

### Homepage FAQ block (src/components/HomeComponent/FAQ.tsx)

- Corrected the brand name in the rental-period question (was "AutoGirl", now
  "Muvment").
- Updated the fuel answer to the confirmed refuel minimums (12,000 naira for
  sedans, 20,000 naira for SUVs).

## Content decisions applied

- Cities served: Lagos, Abuja, Benin City, Enugu, Port Harcourt, and Accra
  (Ghana).
- Refuel minimums set to 12,000 naira (sedans) and 20,000 naira (SUVs) on the
  page, the homepage block, and the schema.
- No specific service prices for airport, monthly, or wedding bookings. Those
  answers point customers to book on the site or contact the booking team.
- Monthly rentals: fuel is not included unless requested.
- Vehicle types described generally, pointing to the live categories on the
  homepage.
- Benin Republic travel included as a public question.
- Hosting reduced to a single question that directs hosts to host.muvment.ng.

## Validation

- TypeScript: tsc --noEmit clean.
- Build: next build compiled successfully. /faq, /policy/terms-conditions, and
  /policy/privacy-policy all prerender as static. /faq first-load JS is 287 kB.
- 53 questions across 13 sections, no duplicate ids.
- No em dashes. Only the 12,000 and 20,000 naira figures remain in the FAQ
  content.

## Files changed

- src/app/faq/FAQPageClient.tsx (redesign merged with content, search, CTA)
- src/data/faq.ts
- src/components/general/BookingCTA.tsx
- src/helpers/schema.tsx
- src/components/pagesComponent/PolicyLayout.tsx
- src/components/HomeComponent/FAQ.tsx

## Deploy (Git Bash)

```bash
cd ~/Downloads
unzip -o muvment-customer-v1.8.1-faq-redesign.zip -d muvment-customer-v1.8.1-faq-redesign/

cd ~/muvment-customer
git checkout staging
git pull origin staging
git checkout -b feat/v1.8.1-faq-redesign

mkdir -p ~/muvment-customer/src/data
mkdir -p ~/muvment-customer/src/components/general

cp ~/Downloads/muvment-customer-v1.8.1-faq-redesign/src/app/faq/FAQPageClient.tsx ~/muvment-customer/src/app/faq/FAQPageClient.tsx
cp ~/Downloads/muvment-customer-v1.8.1-faq-redesign/src/data/faq.ts ~/muvment-customer/src/data/faq.ts
cp ~/Downloads/muvment-customer-v1.8.1-faq-redesign/src/components/general/BookingCTA.tsx ~/muvment-customer/src/components/general/BookingCTA.tsx
cp ~/Downloads/muvment-customer-v1.8.1-faq-redesign/src/helpers/schema.tsx ~/muvment-customer/src/helpers/schema.tsx
cp ~/Downloads/muvment-customer-v1.8.1-faq-redesign/src/components/pagesComponent/PolicyLayout.tsx ~/muvment-customer/src/components/pagesComponent/PolicyLayout.tsx
cp ~/Downloads/muvment-customer-v1.8.1-faq-redesign/src/components/HomeComponent/FAQ.tsx ~/muvment-customer/src/components/HomeComponent/FAQ.tsx
cp ~/Downloads/muvment-customer-v1.8.1-faq-redesign/CHANGELOG.md ~/muvment-customer/CHANGELOG.md

git status
npx tsc --noEmit
npm run build
git add .
git commit -m "v1.8.1: merge FAQ redesign with expanded content (53 Qs, 13 sections), add search and booking CTA, sync schema, remove carousel"
git push -u origin feat/v1.8.1-faq-redesign
gh pr create --base staging --head feat/v1.8.1-faq-redesign --title "FAQ redesign with expanded content, search, and booking CTA (v1.8.1)" --body "Merge the FAQ redesign (hero, sticky category nav, bordered accordion) with the approved 53-question content across 13 sections; add search; add booking CTA on FAQ, Terms, and Privacy; sync FAQ structured data with the page; remove the carousel above the FAQ footer; fix homepage FAQ brand name and fuel figures."
```

`git status` should show the two new files (src/data/faq.ts, src/components/general/BookingCTA.tsx) and four modified files, nothing else.

To eyeball before pushing, add `npm run dev` after the `npm run build` line, check the FAQ, Terms, and Privacy pages in the browser, stop with Ctrl+C, then continue.
