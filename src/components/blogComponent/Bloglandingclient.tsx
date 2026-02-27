"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BiSearch, BiChevronRight, BiX, BiCategory } from "react-icons/bi";
import { BlogCategory, BlogPost, PaginatedResponse } from "@/types/blog.type";
import { BlogService } from "@/controllers/BlogService/blogService";
import PostCardSkeleton from "./blogUI/Postcardskeleton";
import FeaturedCard from "./blogUI/Featuredcard";
import PostCard from "./blogUI/Postcard";
import { Navbar } from "../Navbar";
import Footer from "../HomeComponent/Footer";

interface BlogLandingClientProps {
  initialPosts: PaginatedResponse<BlogPost>;
  initialSearch: string;
  initialCategory: string; // this is the category ID (or empty string for "All")
  categories: BlogCategory[];
}

const MAX_VISIBLE_TABS = 5;

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
  // categoryId: empty string = All
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived: find the name of the selected category (for URL display purposes)
  const selectedCategory = categories.find((c) => String(c.id) === String(categoryId));

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
          size: 9,
          search: opts.search || undefined,
          // Pass undefined when "All" so API returns all posts
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
        // handle silently
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

  const handleLoadMore = () => {
    if (currentPage + 1 < totalPages) {
      fetchPosts({ page: currentPage + 1, search, categoryId, append: true });
    }
  };

  const isFeaturedLayout = !search && !categoryId && currentPage === 0;
  const featuredPost = isFeaturedLayout ? posts[0] : null;
  const gridPosts = isFeaturedLayout ? posts : posts;

  const visibleCategories = categories.slice(0, MAX_VISIBLE_TABS);
  const hasMore = categories.length > MAX_VISIBLE_TABS;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#0d1f35] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 pt-24 pb-20 text-center">
          <p className="text-blue-400 tracking-[0.35em] text-xs font-semibold uppercase mb-5">
            Our Journal
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.08] mb-6">
            Ideas Worth{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Exploring
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto mb-10">
            Stories, insights, and perspectives from our community.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search articles…"
              aria-label="Search blog articles"
              className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/[0.08] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/[0.12] transition-all duration-200"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <nav
        className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
        aria-label="Blog categories"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* All tab */}
            <button
              onClick={() => handleCategory(null)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                !categoryId
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              All
            </button>

            {/* Visible category tabs */}
            {visibleCategories.map((cat) => {
              const isActive = String(cat.id) === String(categoryId);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}

            {/* See all categories button */}
            {hasMore && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all duration-150 flex items-center gap-1.5"
              >
                <BiCategory className="w-3.5 h-3.5" />
                See all categories
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <>
            <div className="h-[420px] bg-gray-100 rounded-2xl animate-pulse mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <p className="text-gray-400 text-sm">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <>
            {(search || categoryId) && (
              <p className="text-sm text-gray-400 mb-6">
                {totalElements.toLocaleString()} result
                {totalElements !== 1 ? "s" : ""}
                {search && ` for "${search}"`}
                {categoryId && selectedCategory && ` in ${selectedCategory.name}`}
              </p>
            )}

            {featuredPost && (
              <div className="mb-10">
                <FeaturedCard post={featuredPost} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {currentPage + 1 < totalPages && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-100"
                >
                  {loadingMore ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Loading…
                    </>
                  ) : (
                    <>
                      Load more articles
                      <BiChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* All Categories Modal */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCategoryModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <BiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto p-6">
              {/* All option inside modal */}
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
                  const isActive = String(cat.id) === String(categoryId);
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