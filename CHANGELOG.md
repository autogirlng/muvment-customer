# Changelog

## v1.5.6 - Vehicle page titles and sitemap

### Vehicle page title too long (32 pages)
The vehicle title was `{name} - Rent in {city}` and the layout appended
" | Muvment by Autogirl", pushing it past 60 characters. Added a titleAbsolute
option to generatePageMetadata and used it on vehicle pages, so the title is the
descriptive `{name} - Rent in {city}` without the brand suffix. This keeps the
"Rent in {city}" keywords and stays under 60.
- `src/helpers/metadata.ts`: new optional `titleAbsolute` flag. When true, the
  title is emitted as `{ absolute: title }` (no template suffix). Default false,
  so every other page is unchanged.
- `src/app/booking/details/[id]/page.tsx`: passes `titleAbsolute: true`.

### Sitemap: missing indexable page
- `src/app/sitemap.ts`: added `/impact`, which was indexable but absent from the
  sitemap.

### Not changed, and why
- The remaining "Indexable page not in sitemap" entries and all three
  "Non-canonical page in sitemap" entries need the exact URL lists from Ahrefs.
  Every page already self-canonicals, so the non-canonical ones cannot be
  inferred from the code. Export those two issue lists and they can be handled
  precisely.
- The home page "title too short" and "title mismatch" are not a code fault. The
  title is a reasonable length once the brand suffix is included, and the
  mismatch is Google rewriting the SERP title, which is not controlled in code.

### Verification
- `npx tsc --noEmit`: clean.

### Deploy

```bash
SRC=~/Downloads/muvment-customer-v1.5.6-titles-sitemap
DEST=~/muvment-customer

cp "$SRC/src/helpers/metadata.ts"               "$DEST/src/helpers/metadata.ts"
cp "$SRC/src/app/sitemap.ts"                     "$DEST/src/app/sitemap.ts"
cp "$SRC/src/app/booking/details/[id]/page.tsx" "$DEST/src/app/booking/details/[id]/page.tsx"
cp "$SRC/CHANGELOG.md"                           "$DEST/CHANGELOG.md"

cd "$DEST"
git stash
git fetch origin
git checkout staging
git pull origin staging
git checkout -b fix/v1.5.6-titles-sitemap
npx tsc --noEmit
npm run build
git add .
git commit -m "v1.5.6: vehicle title under length limit via absolute title, add /impact to sitemap"
git push -u origin fix/v1.5.6-titles-sitemap
```
