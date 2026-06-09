"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BiSearch, BiX, BiCategory } from "react-icons/bi";
import { BlogCategory, BlogPost, PaginatedResponse } from "@/types/blog.type";
import { BlogService } from "@/controllers/BlogService/blogService";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";
import PostCardSkeleton from "./blogUI/Postcardskeleton";
import { Navbar } from "../Navbar";
import Footer from "../HomeComponent/Footer";
import { format } from "date-fns";

interface BlogLandingClientProps {
  initialPosts: PaginatedResponse<BlogPost>;
  initialSearch: string;
  initialCategory: string;
  categories: BlogCategory[];
}

const MAX_VISIBLE_TABS = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return (name || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function DateBadge({ dateStr }: { dateStr: string }) {
  try {
    const d = new Date(dateStr);
    return (
      <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1.5 text-center shadow-sm min-w-[64px]">
        <p className="text-[10px] text-gray-500 font-medium leading-none mb-0.5">
          {format(d, "EEE")}
        </p>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          {format(d, "dd")}
        </p>
        <p className="text-[10px] text-gray-500 font-medium leading-none mt-0.5">
          {format(d, "MMM yyyy")}
        </p>
      </div>
    );
  } catch {
    return null;
  }
}

// ─── Featured dark card ───────────────────────────────────────────────────────

function HeroFeaturedCard({ post }: { post: BlogPost }) {
  const authorName = post.authAuthorName || post.authorName || "Author";
  const dateLabel = post.createdAt
    ? format(new Date(post.createdAt), "dd MMMM yyyy")
    : "";
  const cover = post.coverImage
    ? optimizeCloudinaryUrl(post.coverImage, 1200)
    : "";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="relative block rounded-2xl overflow-hidden group min-h-[340px] bg-[#0d1f35]"
    >
      {cover && (
        <img
          src={cover}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f35] via-[#0d1f35]/80 to-[#0d1f35]/30" />

      <div className="relative z-10 flex flex-col justify-end min-h-[340px] p-8 md:p-10">
        {post.blogCategory?.name && (
          <span className="inline-block self-start bg-blue-500/20 text-blue-200 text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4 border border-blue-400/30">
            {post.blogCategory.name}
          </span>
        )}

        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3 group-hover:text-blue-200 transition-colors max-w-3xl">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-2xl line-clamp-3">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(authorName)}
          </div>
          <span className="text-sm text-gray-200">
            {authorName}
            {dateLabel && (
              <span className="text-gray-400"> · {dateLabel}</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Grid post card ───────────────────────────────────────────────────────────

function GridPostCard({ post }: { post: BlogPost }) {
  const authorName = post.authAuthorName || post.authorName || "Author";
  const cover = post.coverImage
    ? optimizeCloudinaryUrl(post.coverImage, 600)
    : "";

  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col group">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 mb-4">
        {cover ? (
          <img
            src={cover}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="1.5" d="M4 16l4-4 4 4 4-6 4 6" />
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        )}
        <DateBadge dateStr={post.createdAt || ""} />
      </div>

      {/* Text */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-[15px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {post.excerpt}
        </p>
      )}

      {/* Author */}
      <div className="flex items-center gap-2 mt-auto pt-2">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {getInitials(authorName)}
        </div>
        <span className="text-xs text-gray-500">{authorName}</span>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlogLandingClient({
  initialPosts,
  initialSearch,
  initialCategory,
  categories,
}: BlogLandingClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [posts, setPosts] = useState<BlogPost[]>(initialPosts.data);
  const [totalPages, setTotalPages] = useState(initialPosts.totalPages);
  const [totalElements, setTotalElements] = useState(initialPosts.totalElements);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCategoryModal) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    modalRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowCategoryModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [showCategoryModal]);

  const selectedCategory = categories.find(
    (c) => String(c.name) === String(categoryId)
  );

  const updateUrl = useCallback(
    (s: string, catId: string) => {
      const params = new URLSearchParams();
      if (s) params.set("search", s);
      if (catId) params.set("category", catId);
      router.push(
        `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
        { scroll: false }
      );
    },
    [router, pathname]
  );

  const fetchPosts = useCallback(
    async (opts: {
      page: number;
      search: string;
      categoryId: string;
      append?: boolean;
    }) => {
      if (opts.append) setLoadingMore(true);
      else setLoading(true);
      try {
        const result = await BlogService.getPosts({
          page: opts.page,
          size: 20,
          search: opts.search || undefined,
          category: opts.categoryId || undefined,
        });
        if (opts.append) {
          setPosts((prev) => [...prev, ...result.data]);
        } else {
          setPosts(result.data);
        }
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setCurrentPage(opts.page);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const handleSearch = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateUrl(val, categoryId);
      fetchPosts({ page: 0, search: val, categoryId });
    }, 400);
  };

  const handleCategory = (cat: BlogCategory | null) => {
    const id = cat ? String(cat.name) : "";
    setCategoryId(id);
    setShowCategoryModal(false);
    updateUrl(search, id);
    fetchPosts({ page: 0, search, categoryId: id });
  };

  const loadMore = useCallback(() => {
    if (loadingMore || loading || currentPage + 1 >= totalPages) return;
    fetchPosts({ page: currentPage + 1, search, categoryId, append: true });
  }, [loadingMore, loading, currentPage, totalPages, search, categoryId, fetchPosts]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const isFeaturedLayout = !search && !categoryId && currentPage === 0;
  const featuredPost = isFeaturedLayout ? posts[0] : null;
  const gridPosts =
    isFeaturedLayout && posts.length > 1 ? posts.slice(1) : posts;

  const visibleCategories = categories.slice(0, MAX_VISIBLE_TABS);
  const hasMore = categories.length > MAX_VISIBLE_TABS;


  return (
    <>
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#101928] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="hero-glow hero-glow-1" />
          <span className="hero-glow hero-glow-2" />
          <span className="hero-grid" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 pt-28 pb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Blog
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto mb-10">
            Ideas worth exploring. Stories, insights, and perspectives from our
            community.
          </p>
          <div className="relative max-w-lg mx-auto">
            <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </section>
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => handleCategory(null)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                !categoryId
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              All
            </button>
            {visibleCategories.map((cat) => {
              const isActive = String(cat.name) === String(categoryId);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
            {hasMore && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all duration-150 flex items-center gap-1.5"
              >
                <BiCategory className="w-3.5 h-3.5" />
                See all
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <>
            <div className="h-[340px] bg-gray-100 rounded-2xl animate-pulse mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          
          </>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <BiSearch className="w-6 h-6 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              No articles found
            </h2>
            <p className="text-gray-500 text-sm">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <>
            {(search || categoryId) && (
              <p className="text-sm text-gray-500 mb-6">
                {totalElements.toLocaleString()} result
                {totalElements !== 1 ? "s" : ""}
                {search && ` for "${search}"`}
                {categoryId &&
                  selectedCategory &&
                  ` in ${selectedCategory.name}`}
              </p>
            )}

            {/* Featured card */}
            {featuredPost && (
              <div className="mb-10">
                <HeroFeaturedCard post={featuredPost} />
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post) => (
                <GridPostCard key={post.id} post={post} />
              ))}
            </div>

            {currentPage + 1 < totalPages && (
              <div ref={loaderRef} className="flex justify-center mt-12 py-4">
                {loadingMore && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <PostCardSkeleton key={i} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* ── Categories Modal ─────────────────────────────────────────────── */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCategoryModal(false);
          }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="All Categories"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col focus:outline-none"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                All Categories
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <BiX className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <button
                onClick={() => handleCategory(null)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 mb-2 ${
                  !categoryId
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                All Articles
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isActive = String(cat.name) === String(categoryId);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategory(cat)}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}