import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_VERCEL_URL || "https://muvment.ng";
const API_URL = "https://api-muvment-prod.up.railway.app/api/v1";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isProduction = APP_URL === "https://muvment.ng";

  if (!isProduction) {
    console.log(
      "Sitemap generation blocked: Non-production environment detected.",
    );
    return [];
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/auth/forgot-password`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${APP_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/booking/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/booking/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${APP_URL}/partner-with-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${APP_URL}/policy/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/policy/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const [blogsRes, vehiclesRes, showcaseRes] = await Promise.all([
      fetch(`${API_URL}/blog-posts?page=0&size=100`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${API_URL}/public/vehicles/search?page=0&size=100`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${API_URL}/public/service-pricing-showcase`, {
        next: { revalidate: 3600 },
      }),
    ]);

    const blogsJson =
      blogsRes.ok &&
      blogsRes.headers.get("content-type")?.includes("application/json")
        ? await blogsRes.json()
        : null;

    const vehiclesJson =
      vehiclesRes.ok &&
      vehiclesRes.headers.get("content-type")?.includes("application/json")
        ? await vehiclesRes.json()
        : null;

    const showcaseJson =
      showcaseRes.ok &&
      showcaseRes.headers.get("content-type")?.includes("application/json")
        ? await showcaseRes.json()
        : null;

    const blogEntries = (blogsJson?.data?.content || []).map((post: any) => ({
      url: `${APP_URL}/blog/${post.id}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const vehicleEntries = (vehiclesJson?.data?.content || []).map(
      (v: any) => ({
        url: `${APP_URL}/booking/details/${v.id}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }),
    );

    const showcaseEntries = (showcaseJson?.data || []).map((item: any) => ({
      url: `${APP_URL}/booking/${item.servicePricingId}/special-pricing`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...blogEntries,
      ...vehicleEntries,
      ...showcaseEntries,
    ];
  } catch (error) {
    console.error("Sitemap error:", error);
    return staticRoutes;
  }
}
