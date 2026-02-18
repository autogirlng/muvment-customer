"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiChevronRight, BiHeart } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { FiMessageCircle } from "react-icons/fi";
import { LuClock } from "react-icons/lu";
import { BlogComment, BlogPost, PaginatedResponse } from "@/types/blog.type";
import { BlogService } from "@/controllers/BlogService/blogService";
import ShareButton from "./blogUI/Sharebutton";
import CommentsSection from "./blogUI/Commentssection";
import RelatedCard from "./blogUI/Relatedcard";
import Footer from "../HomeComponent/Footer";
import { Navbar } from "../Navbar";


// ── Auth hook ─────────────────────────────────────────────────────────────────
// Replace with your real auth implementation (e.g. useSession, useAuth, etc.)
function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsLoggedIn(!!token);
  }, []);
  return { isLoggedIn };
}


interface BlogDetailsClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  initialComments: PaginatedResponse<BlogComment>;
}

export default function BlogDetailsClient({
  post,
  relatedPosts,
  initialComments,
}: BlogDetailsClientProps) {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(post.metrics?.likes ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    BlogService.recordView(post.id);
  }, [post.id]);

  const handleLike = async () => {
    if (likeLoading) return;

    setLikeLoading(true);
    try {
      if (liked && likeId) {
        await BlogService.unlikePost(likeId);
        setLiked(false);
        setLikeId(null);
        setLikeCount((n:any) => Math.max(0, n - 1));
      } else {
        const result = await BlogService.likePost(post.id);
        setLiked(true);
        setLikeId(result.id);
        setLikeCount((n:any) => n + 1);
      }
    } catch {
      // silent
    } finally {
      setLikeLoading(false);
    }
  };

  const author = post.authAuthorName || post.authorName;
  const readTime = BlogService.estimateReadTime(post.content);
  const postUrl =
    typeof window !== "undefined" ? window.location.href : `/blog/${post.slug}`;

  return (
    <>
      {/* {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          returnTo={pathname}
        />
      )} */}
      <Navbar/>

      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <ol
          className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          <li
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              href="/"
              itemProp="item"
              className="hover:text-blue-600 transition-colors"
            >
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          <BiChevronRight className="w-3 h-3 flex-shrink-0" />
          <li
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              href="/blog"
              itemProp="item"
              className="hover:text-blue-600 transition-colors"
            >
              <span itemProp="name">Blog</span>
            </Link>
            <meta itemProp="position" content="2" />
          </li>
          {post.blogCategory && (
            <>
              <BiChevronRight className="w-3 h-3 flex-shrink-0" />
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <Link
                  href={`/blog?category=${encodeURIComponent(post.blogCategory.name)}`}
                  itemProp="item"
                  className="hover:text-blue-600 transition-colors"
                >
                  <span itemProp="name">{post.blogCategory.name}</span>
                </Link>
                <meta itemProp="position" content="3" />
              </li>
            </>
          )}
          <BiChevronRight className="w-3 h-3 flex-shrink-0" />
          <li className="text-gray-600 truncate max-w-[180px] sm:max-w-xs">
            {post.title}
          </li>
        </ol>
      </nav>

    
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">

       
          <article
            className="flex-1 min-w-0"
            itemScope
            itemType="https://schema.org/Article"
          >
            <header className="mb-8">
              {/* Category + tags */}
              <div className="flex items-center gap-2 flex-wrap mb-5">
                {post.blogCategory && (
                  <Link
                    href={`/blog?category=${encodeURIComponent(post.blogCategory.name)}`}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    {post.blogCategory.name}
                  </Link>
                )}
                {(post.tags ?? []).map((tag:any) => (
                  <Link
                    key={tag}
                    href={`/blog?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1
                className="font-serif text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5"
                itemProp="headline"
              >
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p
                  className="text-gray-500 text-lg leading-relaxed border-l-4 border-blue-200 pl-5 mb-7"
                  itemProp="description"
                >
                  {post.excerpt}
                </p>
              )}

              {/* Author bar */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-7 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-base">
                    {(author || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-gray-900 text-sm"
                      itemProp="author"
                      itemScope
                      itemType="https://schema.org/Person"
                    >
                      <span itemProp="name">{author}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <time
                        dateTime={post.approvedAt || post.createdAt}
                        itemProp="datePublished"
                      >
                        {BlogService.formatDateLong(
                          post.approvedAt || post.createdAt
                        )}
                      </time>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <LuClock className="w-3 h-3" />
                        {readTime} min read
                      </span>
                    </div>
                  </div>
                </div>

                {/* Like + Share */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    aria-label={liked ? "Unlike this post" : "Like this post"}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      liked
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <BiHeart
                      className={`w-4 h-4 transition-all ${liked ? "fill-red-500 text-red-500" : ""}`}
                    />
                    {likeCount.toLocaleString()}
                  </button>
                  <ShareButton url={postUrl} title={post.title} />
                </div>
              </div>
            </header>

            {/* Post content */}
            <div
              className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-300 prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:rounded prose-code:px-1 prose-code:text-sm"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Metrics bar */}
            <div className="flex items-center gap-6 mt-10 py-5 border-y border-gray-100 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <BsEye className="w-4 h-4" />
                {(post.metrics?.views ?? 0).toLocaleString()} views
              </span>
              <span className="flex items-center gap-1.5">
                <BiHeart className="w-4 h-4" />
                {likeCount.toLocaleString()} likes
              </span>
              {/* <span className="flex items-center gap-1.5">
                <FiMessageCircle className="w-4 h-4" />
                {(post.metrics?.commentCount ?? 0).toLocaleString()} comments
              </span> */}
            </div>

            {/* Comments */}
            <CommentsSection
              postId={post.id}
              initialComments={initialComments}
              isLoggedIn={isLoggedIn}
              onAuthRequired={() => setShowLoginModal(true)}
            />
          </article>

          <aside className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-6">

              {/* Author */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  About the Author
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {(author || "A")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {author}
                    </p>
                    {(post.authAuthorEmail || post.authorEmail) && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {post.authAuthorEmail || post.authorEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Like CTA */}
              <div className="bg-[#0d1f35] rounded-2xl p-5 text-white text-center">
                <p className="font-semibold text-sm mb-1">
                  Enjoyed this article?
                </p>
                <p className="text-gray-400 text-xs mb-4">
                  Like it and share with your network.
                </p>
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    liked
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white text-[#0d1f35] hover:bg-blue-50"
                  }`}
                >
                  <BiHeart
                    className={`inline w-4 h-4 mr-1.5 -mt-0.5 ${liked ? "fill-white" : ""}`}
                  />
                  {liked ? "Liked!" : "Like this post"}
                </button>
              </div>

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Related Articles
                  </p>
                  {relatedPosts.map((p) => (
                    <RelatedCard key={p.id} post={p} />
                  ))}
                </div>
              )}

              {/* Tags */}
              {(post.tags ?? []).length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag:any) => (
                      <Link
                        key={tag}
                        href={`/blog?search=${encodeURIComponent(tag)}`}
                        className="px-3 py-1.5 rounded-full text-xs bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-100"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-100">
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                More in {post.blogCategory?.name ?? "Blog"}
              </h2>
              <Link
                href={
                  post.blogCategory
                    ? `/blog?category=${encodeURIComponent(post.blogCategory.name)}`
                    : "/blog"
                }
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all
                <BiChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <Link
                  key={p.id}
                  href={BlogService.buildPostUrl(p.slug)}
                  className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm leading-snug mb-2">
                      {p.title}
                    </h3>
                    <time className="text-xs text-gray-400">
                      {BlogService.formatDate(p.approvedAt || p.createdAt)}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer/>
    </>
  );
}