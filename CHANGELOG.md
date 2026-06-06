# Muvment Customer, v1.10.1 (Contact Us refinements, Opebi address, success state)

Note (v1.10.1): the Contact Us navbar now matches the Terms and Privacy pages (no search bar), and the "Reach us" details card is now sticky on scroll on large screens, the way the policy table of contents behaves.

## Summary

Builds on the v1.9.0 animation and Contact Us work. Switches the office address
to the Opebi address across the site, rewrites the Contact Us form heading,
adds a proper success state after sending, and lays the page out as two columns
(contact details beside the form) on larger screens.

## What changed in this version

### Office address (now Opebi)

Updated everywhere it appears so the page, the structured data, and the privacy
policy all match:
- Contact Us page (the details column).
- Contact Us metadata description and keywords.
- LocalBusiness and ContactPage structured data in src/helpers/schema.tsx (the
  geo coordinates already pointed at Opebi, so they now match the text).
- The write-to address in the Privacy Policy.

New address used: 10 Anuoluwapo Close, Opebi, Ikeja, Lagos.

### Contact Us page (src/components/pagesComponent/ContactUsClient.tsx)

- New form heading and subheading: "Send us a message" with a short, plain line
  inviting a booking question, a general question, or feedback.
- New success state: after a message sends, the form is replaced by a clear
  confirmation (a green check, a short thank-you, and a "Send another message"
  button that returns to a fresh form). The toast still fires as well.
- The navbar now matches the Terms and Privacy pages (plain, no search bar).
- The "Reach us" details card is sticky on scroll on large screens, like the policy table of contents.
- Two-column layout on large screens: the contact details (address, mail,
  phone) sit in a card beside the form, instead of stacked above it. On smaller
  screens it stacks naturally.
- The form keeps the same fields, validation, submit endpoint and payload, and
  the entrance animation, accessible labels, social link names, and error
  handling added in v1.9.0.

## Carried from v1.9.0 (included so this deploys as one complete update)

- Reduce-motion-aware entrance animations on the FAQ, Terms, Privacy, and
  Contact Us pages, and the booking call to action.
- Contact Us footer, canonical support email (info@muvment.ng), visible phone,
  accessible form labels and social links, and form error/submit handling.
- FAQ meta description em dash replaced with a colon.

## Validation

- TypeScript: tsc --noEmit clean.
- Build: next build compiled successfully. /faq, /contact-us,
  /policy/terms-conditions, and /policy/privacy-policy all prerender as static.
- The Opebi address is present in both the visible Contact Us output and its
  structured data.

## Files changed

- src/components/pagesComponent/ContactUsClient.tsx
- src/app/contact-us/page.tsx
- src/helpers/schema.tsx
- src/components/pagesComponent/PrivacyPolicyClient.tsx
- src/components/general/Reveal.tsx
- src/components/general/BookingCTA.tsx
- src/components/pagesComponent/PolicyLayout.tsx
- src/app/faq/FAQPageClient.tsx
- src/app/faq/layout.tsx
- src/data/faq.ts
- src/components/HomeComponent/FAQ.tsx

## Deploy (Git Bash)

```bash
cd ~/Downloads
unzip -o muvment-customer-v1.10.1-contact-refinements.zip -d muvment-customer-v1.10.1-contact-refinements/

cd ~/muvment-customer
git checkout staging
git pull origin staging
git checkout -b feat/v1.10.1-contact-refinements

mkdir -p ~/muvment-customer/src/data
mkdir -p ~/muvment-customer/src/components/general

cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/components/pagesComponent/ContactUsClient.tsx ~/muvment-customer/src/components/pagesComponent/ContactUsClient.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/app/contact-us/page.tsx ~/muvment-customer/src/app/contact-us/page.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/helpers/schema.tsx ~/muvment-customer/src/helpers/schema.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/components/pagesComponent/PrivacyPolicyClient.tsx ~/muvment-customer/src/components/pagesComponent/PrivacyPolicyClient.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/components/pagesComponent/PolicyLayout.tsx ~/muvment-customer/src/components/pagesComponent/PolicyLayout.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/components/general/Reveal.tsx ~/muvment-customer/src/components/general/Reveal.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/components/general/BookingCTA.tsx ~/muvment-customer/src/components/general/BookingCTA.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/app/faq/FAQPageClient.tsx ~/muvment-customer/src/app/faq/FAQPageClient.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/app/faq/layout.tsx ~/muvment-customer/src/app/faq/layout.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/data/faq.ts ~/muvment-customer/src/data/faq.ts
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/src/components/HomeComponent/FAQ.tsx ~/muvment-customer/src/components/HomeComponent/FAQ.tsx
cp ~/Downloads/muvment-customer-v1.10.1-contact-refinements/CHANGELOG.md ~/muvment-customer/CHANGELOG.md

git status
npx tsc --noEmit
npm run build
git add .
git commit -m "v1.10.1: Opebi address site-wide, Contact Us new heading, success state, two-column layout"
git push -u origin feat/v1.10.1-contact-refinements
gh pr create --base staging --head feat/v1.10.1-contact-refinements --title "Contact Us refinements and Opebi address (v1.10.1)" --body "Switch office address to Opebi across the page, metadata, schema, and privacy policy. Contact Us: new heading and subheading, success state after sending, two-column layout (details beside form). Carries the v1.9.0 animations and Contact Us overhaul so this deploys as one complete update."
```

`git status` should list the changed files, not "nothing to commit".
