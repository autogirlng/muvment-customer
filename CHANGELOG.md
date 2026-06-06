# Muvment Customer, v1.10.2 (blog share link fix)

## Summary

Fixes the share button on a blog post sharing the wrong link.

## What changed

### src/components/blogComponent/Blogdetailsclient.tsx

- The share URL was taken from window.location.href, which was resolving to
  https://www.muvment.ng/blog (the blog index) instead of the post.
- It now builds the canonical post URL from the post slug and the site base
  URL, so sharing always produces the correct absolute post link
  (https://www.muvment.ng/blog/<slug>), regardless of how the page was reached
  or which environment it runs on.

## Validation

- TypeScript: tsc --noEmit clean.
- Build: next build compiled successfully.

## Files changed

- src/components/blogComponent/Blogdetailsclient.tsx

## Deploy (Git Bash)

```bash
cd ~/Downloads
ZIP=$(ls -t *blog-share-fix*.zip 2>/dev/null | head -1)
echo "Using: $ZIP"
unzip -o "$ZIP" -d muvment-customer-v1.10.2-blog-share-fix/

cd ~/muvment-customer
git checkout staging
git pull origin staging
git checkout -b fix/v1.10.2-blog-share-link

cp ~/Downloads/muvment-customer-v1.10.2-blog-share-fix/src/components/blogComponent/Blogdetailsclient.tsx ~/muvment-customer/src/components/blogComponent/Blogdetailsclient.tsx
cp ~/Downloads/muvment-customer-v1.10.2-blog-share-fix/CHANGELOG.md ~/muvment-customer/CHANGELOG.md

git status
npx tsc --noEmit
npm run build
git add .
git commit -m "v1.10.2: fix blog share link (use canonical post URL, not window.location)"
git push -u origin fix/v1.10.2-blog-share-link
gh pr create --base staging --head fix/v1.10.2-blog-share-link --title "Fix blog share link (v1.10.2)" --body "Share button was sharing the blog index URL instead of the post. Build the canonical post URL from the slug and site base URL so the correct absolute post link is shared."
```

git status should show only Blogdetailsclient.tsx and CHANGELOG.md.
