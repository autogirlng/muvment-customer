// Rewrites a Cloudinary delivery URL so the CDN returns a compressed, modern
// format (AVIF/WebP) at a sensible width instead of the full-size original.
// Non-Cloudinary URLs (local assets, fallbacks) are returned untouched.
export const optimizeCloudinaryUrl = (url: string, width = 450): string => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};

// next/image throws "Failed to construct 'URL': Invalid URL" when src is a
// non-empty string that is neither an absolute http(s) URL nor a root-relative
// path. Stored image URLs are not guaranteed to be either, so anything passed to
// next/image goes through here first and falls back when it cannot be rendered.
const isRenderableImageSrc = (url: string): boolean => {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

export const resolveImageSrc = (
  url: string | null | undefined,
  fallback: string,
  width = 450,
): string => {
  const candidate = optimizeCloudinaryUrl((url || "").trim(), width);
  return isRenderableImageSrc(candidate) ? candidate : fallback;
};
