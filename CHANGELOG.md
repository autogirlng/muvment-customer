# Changelog

## v1.5.3 - Vehicle meta description length

### Problem
v1.5.2 lengthened the vehicle page meta description to clear the "too short"
flag, but it overshot the 160 character limit (about 191 characters), so the
vehicle pages flipped from "too short" to "too long" in the next crawl. Net
count got worse.

### Fix
Trimmed the description to land in the 120 to 155 range. Dropped "and fuel",
"available for", and the trailing "Book instantly with flexible pricing" so it
stays descriptive without going over.

`src/app/booking/details/[id]/page.tsx`
- Before (~191 chars): `Rent {name} ({year}) in {city} with a professional chauffeur and fuel. {type} seating {seats}, available for hourly, daily, and monthly hire. Book instantly with flexible pricing on Muvment.`
- After (~130 chars): `Rent {name} ({year}) in {city} with a professional chauffeur. {type} seating {seats}. Hourly, daily, and monthly hire on Muvment.`

### Verification
- `npx tsc --noEmit`: clean.

### Deploy

```bash
SRC=~/Downloads/muvment-customer-v1.5.3-meta-description-length
DEST=~/muvment-customer

cp "$SRC/src/app/booking/details/[id]/page.tsx" "$DEST/src/app/booking/details/[id]/page.tsx"
cp "$SRC/CHANGELOG.md"                          "$DEST/CHANGELOG.md"

cd "$DEST"
git fetch origin
git checkout staging
git pull origin staging
git checkout -b fix/v1.5.3-meta-description-length
npx tsc --noEmit
npm run build
git add .
git commit -m "v1.5.3: trim vehicle meta description to stay within length limit"
git push -u origin fix/v1.5.3-meta-description-length
```
