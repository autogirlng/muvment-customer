import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generatePageMetadata } from "@/helpers/metadata";
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

    const author = post.authAuthorName || post.authorName;
    const description =
      post.excerpt || post.content?.replace(/<[^>]+>/g, "").slice(0, 160);

    return generatePageMetadata({
      title: `${post.title} | Blog`,
      description,
      url: `/blog/${post.slug}`,
    
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description:
      post.excerpt || post.content?.replace(/<[^>]+>/g, "").slice(0, 160),
    author: {
      "@type": "Person",
      name: post.authAuthorName || post.authorName,
      email: post.authAuthorEmail || post.authorEmail,
    },
    datePublished: post.approvedAt || post.createdAt,
    dateModified: post.updatedAt,
    articleSection: post.blogCategory?.name,
    keywords: (post.tags ?? []).join(", "),
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.metrics?.likes ?? 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.metrics?.commentCount ?? 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WatchAction",
        userInteractionCount: post.metrics?.views ?? 0,
      },
    ],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "/blog" },
        ...(post.blogCategory
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: post.blogCategory.name,
                item: `/blog?category=${encodeURIComponent(post.blogCategory.name)}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: post.blogCategory ? 4 : 3,
          name: post.title,
          item: `/blog/${post.slug}`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetailsClient
        post={post}
        relatedPosts={relatedPosts}
        initialComments={initialComments}
      />
    </>
  );
}