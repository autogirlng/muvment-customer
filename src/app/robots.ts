import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NEXT_PUBLIC_VERCEL_URL === "https://muvment.ng";

  if (!isProd) {
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
    sitemap: `${process.env.NEXT_PUBLIC_VERCEL_URL}/sitemap.xml`,
  };
}
