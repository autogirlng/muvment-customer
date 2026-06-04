import { MetadataRoute } from "next";
import { SEO_DEFAULTS } from "@/helpers/metadata";

const APP_URL = SEO_DEFAULTS.baseUrl;
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "https://api-muvment.up.railway.app"}/api/v1`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const env = process.env.NEXT_PUBLIC_VERCEL_URL || "";
  const isProduction =
    env.includes("muvment.ng") || process.env.NODE_ENV === "production";

  if (!isProduction) {
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
      fetch(`${API_URL}/blog-posts?page=0&size=2000`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${API_URL}/public/vehicles/search?page=0&size=2000`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${API_URL}/public/service-pricing-showcase`, {
        next: { revalidate: 3600 },
      }),
    ]);

    if (!blogsRes.ok)
      console.error(`Sitemap: blogs fetch failed ${blogsRes.status}`);
    if (!vehiclesRes.ok)
      console.error(`Sitemap: vehicles fetch failed ${vehiclesRes.status}`);
    if (!showcaseRes.ok)
      console.error(`Sitemap: showcase fetch failed ${showcaseRes.status}`);

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

    // Exclude posts whose slug is a UUID (unpublished or legacy posts without a proper slug)
    const UUID_PATTERN =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const blogEntries = (blogsJson?.data?.content || [])
      .filter((post: any) => post.slug && !UUID_PATTERN.test(post.slug))
      .map((post: any) => ({
        url: `${APP_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    const vehicleEntries = (vehiclesJson?.data?.content || [])
      .filter((v: any) => v.slug)
      .map((v: any) => ({
        url: `${APP_URL}/booking/details/${v.slug}`,
        lastModified: new Date(v.updatedAt || v.createdAt || Date.now()),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

    const showcaseEntries = (showcaseJson?.data || []).map((item: any) => ({
      url: `${APP_URL}/booking/${item.slug}/special-pricing`,
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
    console.error("[Sitemap] Unexpected error:", error);
    return staticRoutes;
  }
}
