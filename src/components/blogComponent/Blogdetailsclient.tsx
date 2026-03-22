"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiChevronRight, BiHeart, BiSearch } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { LuClock } from "react-icons/lu";
import { BlogComment, BlogPost, PaginatedResponse } from "@/types/blog.type";
import { BlogService } from "@/controllers/BlogService/blogService";
import ShareButton from "./blogUI/Sharebutton";
import CommentsSection from "./blogUI/Commentssection";
import Footer from "../HomeComponent/Footer";
import { Navbar } from "../Navbar";
import parse from "html-react-parser";

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

function RelatedPostCard({ post }: { post: BlogPost }) {
  const authorName = post.authAuthorName || post.authorName || "Author";
  const readTime = BlogService.estimateReadTime(post.content);

  return (
    <Link
      href={BlogService.buildPostUrl(post.slug)}
      className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover image or placeholder */}
      <div className="h-44 bg-gray-200 flex items-center justify-center overflow-hidden">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {post.blogCategory && (
          <p className="text-xs font-bold text-[#1a3a5c] mb-2 tracking-wide">
            {post.blogCategory.name}
          </p>
        )}
        <h3 className="text-base font-bold text-[#0d1f35] leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-light">
            {post.excerpt}
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-medium text-gray-600">{authorName}</span>
            <span>•</span>
            <time>{BlogService.formatDate(post.approvedAt || post.createdAt)}</time>
            <span>•</span>
            <span>{readTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BlogDetailsClient({
  post,
  relatedPosts,
  initialComments,
}: BlogDetailsClientProps) {
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
        setLikeCount((n) => Math.max(0, n - 1));
      } else {
        const result = await BlogService.likePost(post.id);
        setLiked(true);
        setLikeId(result.id);
        setLikeCount((n) => n + 1);
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
      <Navbar />
<section className="bg-[#0d1f35] text-white">
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Blog
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto mb-10">
            Ideas worth Exploring Stories, insights, and perspectives from our
            community.
          </p>
          <div className="relative max-w-lg mx-auto">
            <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              // value={search}
              // onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </section>
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto px-4 pt-6 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
          <li>
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          </li>
          <BiChevronRight className="w-3 h-3 flex-shrink-0" />
          <li>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          </li>
          {post.blogCategory && (
            <>
              <BiChevronRight className="w-3 h-3 flex-shrink-0" />
              <li>
                <Link
                  href={`/blog?category=${encodeURIComponent(post.blogCategory.name)}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {post.blogCategory.name}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* ── Article ────────────────────────────────────────────────────── */}
      <article
        className="max-w-3xl mx-auto px-4 py-8"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* ── Header ── */}
        <header className="mb-8">
          {/* Category + tag chips */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {post.blogCategory && (
              <Link
                href={`/blog?category=${encodeURIComponent(post.blogCategory.name)}`}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              >
                {post.blogCategory.name}
              </Link>
            )}
            {(post.tags ?? []).map((tag: string) => (
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
            className="text-3xl md:text-4xl font-bold text-[#0d1f35] leading-tight mb-4 tracking-tight"
            itemProp="headline"
          >
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-500 text-base leading-relaxed mb-6 font-light" itemProp="description">
              {post.excerpt}
            </p>
          )}

          {/* Author bar + share */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(author || "A")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm" itemProp="author">
                  {author}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <time dateTime={post.approvedAt || post.createdAt} itemProp="datePublished">
                    {BlogService.formatDateLong(post.approvedAt || post.createdAt)}
                  </time>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <LuClock className="w-3 h-3" />
                    {readTime} min read
                  </span>
                </div>
              </div>
            </div>
            <ShareButton url={postUrl} title={post.title} />
          </div>
        </header>

        {/* ── Cover image ── */}
        {post.coverImage && (
          <div className="w-full rounded-lg overflow-hidden border border-gray-200 mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* ── Body ── */}
        <div className="prose prose-base max-w-none
          prose-headings:text-[#0d1f35] prose-headings:font-bold
          prose-h2:text-2xl prose-h3:text-xl
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:font-light
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-l-4 prose-blockquote:border-[#0d1f35] prose-blockquote:pl-5 prose-blockquote:text-gray-500 prose-blockquote:italic prose-blockquote:not-italic
          prose-img:rounded-lg prose-img:w-full prose-img:border prose-img:border-gray-200
          prose-strong:text-[#0d1f35]
        ">
          {parse(post.content || "")}
        </div>

        {/* ── Share this post ── */}
        {/* <div className="flex flex-col items-center gap-4 pt-10 mt-10 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-800">Share this post</p>
          <ShareButton url={postUrl} title={post.title} />
        </div> */}

        {/* ── Tags ── */}
        {(post.tags ?? []).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-6 border-t border-gray-200 mt-6">
            {(post.tags ?? []).map((tag: string) => (
              <Link
                key={tag}
                href={`/blog?search=${encodeURIComponent(tag)}`}
                className="px-4 py-1.5 bg-gray-100 rounded text-sm text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* ── Enwhsdgagement bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-4 py-5 border-y border-gray-200 mt-6 mb-10">
          <div className="flex items-center gap-5 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <BsEye className="w-4 h-4" />
              {(post.metrics?.views ?? 0).toLocaleString()} views
            </span>
            <span className="flex items-center gap-1.5">
              <BiHeart className="w-4 h-4" />
              {likeCount.toLocaleString()} likes
            </span>
          </div>
          <button
            onClick={handleLike}
            disabled={likeLoading}
            aria-label={liked ? "Unlike this post" : "Like this post"}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all border disabled:opacity-60 ${
              liked
                ? "bg-red-50 border-red-200 text-red-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BiHeart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            {liked ? "Liked" : "Like"}
          </button>
        </div>

        {/* ── Comments ── */}
        <CommentsSection
          postId={post.id}
          initialComments={initialComments}
          isLoggedIn={isLoggedIn}
          onAuthRequired={() => setShowLoginModal(true)}
        />
      </article>

      {/* ── Related posts ─────────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-20 px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Blog
            </p>
            <h2 className="text-3xl font-bold text-[#0d1f35] mb-3 tracking-tight">
              Related posts
            </h2>
            <p className="text-sm text-gray-400 mb-12 max-w-md mx-auto font-light">
              {post.excerpt || "More articles you might enjoy."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {relatedPosts.slice(0, 3).map((p) => (
                <RelatedPostCard key={p.id} post={p} />
              ))}
            </div>

            <div className="mt-10">
              <Link
                href={
                  post.blogCategory
                    ? `/blog?category=${encodeURIComponent(post.blogCategory.name)}`
                    : "/blog"
                }
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-[#0d1f35] hover:text-white hover:border-[#0d1f35] transition-all duration-200"
              >
                View all posts
                <BiChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}