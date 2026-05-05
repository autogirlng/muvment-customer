import { MetadataRoute } from "next";
import { SEO_DEFAULTS } from "@/helpers/metadata";

export default function robots(): MetadataRoute.Robots {
  const env = process.env.NEXT_PUBLIC_VERCEL_URL || "";
  const isProduction =
    env.includes("muvment.ng") || process.env.NODE_ENV === "production";

  // Block all crawling in non-production to protect staging/preview URLs
  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Protected authenticated routes
          "/dashboard/",
          // Booking transaction flows (not useful to index)
          "/booking/checkout/",
          "/booking/create/",
          "/booking/success",
          "/booking/*/special-checkout",
          // Thin/private pages
          "/booking/details/*/reviews",
          // Auth utility pages (not indexable)
          "/auth/account-verification",
          "/auth/reset-password",
          // Payment & post-booking flows
          "/payment/",
          "/pending_payment/",
          "/review/",
          // Internal utilities
          "/Network-checker/",
        ],
      },
    ],
    sitemap: `${SEO_DEFAULTS.baseUrl}/sitemap.xml`,
  };
}
