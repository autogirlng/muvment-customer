import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";
import { BlogService } from "@/controllers/BlogService/blogService";
import BlogDetailsClient from "@/components/blogComponent/Blogdetailsclient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const post = await BlogService.getPostBySlug(id);
    if (!post) return { title: "Post Not Found | Blog" };

    const description =
      post.excerpt || post.content?.replace(/<[^>]+>/g, "").slice(0, 160);

    return generatePageMetadata({
      title: `${post.title} | Blog`,
      description,
      url: `/blog/${post.slug}`,
      image: post.coverImage || undefined,
      keywords: post.tags ?? [],
      type: "article",
      section: post.blogCategory?.name,
    });
  } catch {
    return { title: "Blog Post | Blog" };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;

  const post = await BlogService.getPostBySlug(id).catch(() => null);
  if (!post) notFound();

  const [relatedPosts, initialComments] = await Promise.all([
    BlogService.getRelatedPosts(post.blogCategory?.id, post.id).catch(
      () => []
    ),
    BlogService.getCommentsByPost(post.id, 0, 10).catch(() => ({
      data: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
    })),
  ]);

  return (
    <>
      <JsonLd schema={SchemaBuilder.article(post)} />
      <BlogDetailsClient
        post={post}
        relatedPosts={relatedPosts}
        initialComments={initialComments}
      />
    </>
  );
}