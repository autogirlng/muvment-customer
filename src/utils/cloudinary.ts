// Rewrites a Cloudinary delivery URL so the CDN returns a compressed, modern
// format (AVIF/WebP) at a sensible width instead of the full-size original.
// Non-Cloudinary URLs (local assets, fallbacks) are returned untouched.
export const optimizeCloudinaryUrl = (url: string, width = 450): string => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};
