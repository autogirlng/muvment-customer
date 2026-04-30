import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const APP_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
  const isProduction = APP_URL === "https://muvment.ng";

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/booking/checkout/",
        "/booking/create/",
        "/booking/success",
        "/booking/*/special-checkout",
        "/booking/details/*/reviews",
        "/auth/account-verification",
        "/payment/",
        "/pending_payment/",
        "/review/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
