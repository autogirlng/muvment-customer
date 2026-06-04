# Changelog

## v1.5.1 - Service pricing showcase image transform

### Problem
After v1.5.0, mobile PageSpeed sat at 87. The remaining drag was about 5 MB of
full-size PNGs served straight from Cloudinary on the home page. They all came
from the service pricing showcase cards.

The showcase card was rendering Cloudinary images with `unoptimized` set, so
next/image passed the raw delivery URL through untouched. Each card pulled the
original file:

- Basic SUV: 846 KiB
- Other tiers: 2,114 KiB, 1,188 KiB, 875 KiB

For contrast, the vehicle cards in FindNewListing and TopVech already ran their
URLs through a Cloudinary transform and came down to roughly 40 to 75 KiB each.

### Fix
Apply the same Cloudinary transform (`f_auto,q_auto,w_600`) to the showcase card
images so Cloudinary delivers a compressed AVIF/WebP at display width instead of
the original PNG. Each showcase image drops from several hundred KB or more to
roughly 40 to 60 KiB.

The transform helper existed as two identical local copies (FindNewListing and
TopVech). Moved it into one shared module so the showcase card and the existing
cards all use the same function and it cannot drift again.

### Changes

**New file**
- `src/utils/cloudinary.ts`
  Single `optimizeCloudinaryUrl` helper. Rewrites Cloudinary delivery URLs to
  `f_auto,q_auto,w_600` and leaves non-Cloudinary URLs alone.

**`src/components/general/Servicepricingcard.tsx`**
- Before: `return data.imageUrl || "/images/default-car.png";`
- After: `return optimizeCloudinaryUrl(data.imageUrl || "") || "/images/default-car.png";`
- Added `import { optimizeCloudinaryUrl } from "@/utils/cloudinary";`
- The `unoptimized` flag stays as is. With a pre-transformed URL, Cloudinary
  serves the small compressed file directly.

**`src/components/HomeComponent/FindNewListing.tsx`**
- Removed the local `optimizeCloudinaryUrl` definition.
- Added `import { optimizeCloudinaryUrl } from "@/utils/cloudinary";`
- Behaviour unchanged.

**`src/components/HomeComponent/TopVech.tsx`**
- Removed the local `optimizeCloudinaryUrl` definition.
- Added `import { optimizeCloudinaryUrl } from "@/utils/cloudinary";`
- Behaviour unchanged.

### Verification
- `npx tsc --noEmit`: clean.
- `next build`: compiles and type-checks. (In a no-network environment the build
  stops at the Google Fonts fetch step, which is unrelated to these changes.)
- No visual change. The images look the same, they are just delivered smaller.

### Expected result
- Home page Cloudinary payload: about 5 MB down to a few hundred KB.
- Mobile PageSpeed: 87 toward 90+.
- Desktop already at 95.

### Deploy

```bash
SRC=~/Downloads/muvment-customer-v1.5.1-showcase-image-transform
DEST=~/muvment-customer

mkdir -p "$DEST/src/utils"
cp "$SRC/src/utils/cloudinary.ts"                              "$DEST/src/utils/cloudinary.ts"
cp "$SRC/src/components/general/Servicepricingcard.tsx"        "$DEST/src/components/general/Servicepricingcard.tsx"
cp "$SRC/src/components/HomeComponent/FindNewListing.tsx"      "$DEST/src/components/HomeComponent/FindNewListing.tsx"
cp "$SRC/src/components/HomeComponent/TopVech.tsx"             "$DEST/src/components/HomeComponent/TopVech.tsx"
cp "$SRC/CHANGELOG.md"                                         "$DEST/CHANGELOG.md"

cd "$DEST"
npx tsc --noEmit
npm run build

git add .
git commit -m "v1.5.1: transform service pricing showcase images via Cloudinary, share helper"
git push origin perf/v1.5.0-performance-pass
```

This continues on the same branch into the staging PR. If the PR is already open,
the push updates it.
