import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (APP_URL !== "https://muvment.ng") {
    return [];
  }

  try {
    const [blogsRes, vehiclesRes] = await Promise.all([
      fetch(`${API_URL}/blog-posts`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/public/vehicles/search?page=0&size=100`, {
        next: { revalidate: 3600 },
      }),
    ]);

    const blogsData = await blogsRes.json();
    const vehiclesData = await vehiclesRes.json();

    const blogEntries = (blogsData.data?.content || []).map((post: any) => ({
      url: `${APP_URL}/blog/${post.id}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const vehicleEntries = (vehiclesData.data?.content || []).flatMap(
      (v: any) => [
        {
          url: `${APP_URL}/booking/details/${v.id}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
        {
          url: `${APP_URL}/booking/${v.id}/special-pricing`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.6,
        },
      ],
    );

    const staticRoutes: MetadataRoute.Sitemap = [
      { url: `${APP_URL}/about-us`, changeFrequency: "yearly", priority: 0.5 },
      {
        url: `${APP_URL}/auth/forgot-password`,
        changeFrequency: "monthly",
        priority: 0.4,
      },
      {
        url: `${APP_URL}/auth/login`,
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${APP_URL}/auth/register`,
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${APP_URL}/auth/reset-password`,
        changeFrequency: "monthly",
        priority: 0.4,
      },
      { url: `${APP_URL}/blog`, changeFrequency: "daily", priority: 0.7 },
      {
        url: `${APP_URL}/booking/explore`,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${APP_URL}/booking/search`,
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: `${APP_URL}/contact-us`,
        changeFrequency: "yearly",
        priority: 0.5,
      },
      { url: `${APP_URL}/explore`, changeFrequency: "daily", priority: 1.0 },
      { url: `${APP_URL}/faq`, changeFrequency: "monthly", priority: 0.6 },
      {
        url: `${APP_URL}/partner-with-us`,
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${APP_URL}/policy/privacy-policy`,
        changeFrequency: "monthly",
        priority: 0.3,
      },
      {
        url: `${APP_URL}/policy/terms-conditions`,
        changeFrequency: "monthly",
        priority: 0.3,
      },
    ];

    return [...staticRoutes, ...blogEntries, ...vehicleEntries];
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    return [{ url: APP_URL, lastModified: new Date() }];
  }
}
