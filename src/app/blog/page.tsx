import type { Metadata } from "next";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";
import { BlogService } from "@/controllers/BlogService/blogService";
import BlogLandingClient from "@/components/blogComponent/Bloglandingclient";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;

  let title = "Blog – Insights, Stories & Guides";
  let description =
    "Explore our latest articles, guides and stories. Stay informed with expert insights on topics that matter to you.";

  if (params.category) {
    title = `${params.category} Articles | Blog`;
    description = `Read the latest ${params.category} articles from Muvment. Practical guides, pricing breakdowns, and travel tips on car rental and mobility across Nigeria.`;
  }

  if (params.search) {
    title = `Search: "${params.search}" | Blog`;
  }

  return generatePageMetadata({
    title,
    description,
    url: `/blog${params.category ? `?category=${params.category}` : ""}`,
    keywords: [
      "Muvment blog",
      "Car rental tips Nigeria",
      "Autogirl articles",
      "Nigeria driving guides",
      "Car hire advice",
      ...(params.category ? [params.category] : []),
    ],
  });
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [initialPosts, categories] = await Promise.all([
    BlogService.getPosts({
      page: 0,
      size: 9,
      search: params.search,
      category: params.category,
    }).catch(() => ({
      data: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 9,
    })),
    BlogService.getCategories().catch(() => []),
  ]);


  return (
    <>
      <JsonLd schema={SchemaBuilder.blogIndex()} />
      <BlogLandingClient
        initialPosts={initialPosts}
        initialSearch={params.search ?? ""}
        initialCategory={params.category ?? ""}
        categories={categories}
      />
    </>
  );
}
