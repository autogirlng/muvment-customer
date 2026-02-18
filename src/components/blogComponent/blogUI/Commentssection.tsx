"use client";

import { BlogService } from "@/controllers/BlogService/blogService";
import { BlogComment, PaginatedResponse } from "@/types/blog.type";
import { useState, useEffect, useRef, useCallback } from "react";
import { BiCheck } from "react-icons/bi";
import { FiMessageCircle } from "react-icons/fi";
import CommentItem from "./Commentitem";

interface CommentsSectionProps {
  postId: string;
  initialComments: PaginatedResponse<BlogComment>;
  isLoggedIn: boolean;
  onAuthRequired: () => void;
}

export default function CommentsSection({
  postId,
  initialComments,
  isLoggedIn,
  onAuthRequired,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<BlogComment[]>(initialComments.data);
  const [totalPages, setTotalPages] = useState(initialComments.totalPages);
  const [totalElements, setTotalElements] = useState(
    initialComments.totalElements
  );
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const loaderRef = useRef<HTMLDivElement>(null);


  const loadMore = useCallback(async () => {
    if (loadingMore || page + 1 >= totalPages) return;
    setLoadingMore(true);
    try {
      const res = await BlogService.getCommentsByPost(postId, page + 1, 10);
      setComments((prev) => [...prev, ...res.data]);
      setTotalPages(res.totalPages);
      setPage((p) => p + 1);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, totalPages, postId]);

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }

    if (!form.content.trim() || !form.name.trim() || !form.email.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const newComment = await BlogService.createComment({
        content: form.content,
        post: { id: postId },
        authorName: form.name,
        authorEmail: form.email,
        authorPhoneNumber: form.phone,
      });

      setComments((prev) => [newComment, ...prev]);
      setTotalElements((n:any) => n + 1);
      setForm({ name: "", email: "", phone: "", content: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setFormError("Failed to post your comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-14">
      <h2 className="font-serif text-2xl font-bold text-gray-900 mb-7">
        Comments{" "}
        <span className="text-gray-400 font-normal text-xl">
          ({totalElements.toLocaleString()})
        </span>
      </h2>

      {/* ── Form ── */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-10">
        <h3 className="font-semibold text-gray-900 text-sm mb-5">
          Leave a comment
        </h3>

        {submitted && (
          <div className="flex items-center gap-2 mb-5 p-3.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
            <BiCheck className="w-4 h-4 flex-shrink-0" />
            Your comment has been posted!
          </div>
        )}

        {formError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onClick={() => {
                  if (!isLoggedIn) onAuthRequired();
                }}
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onClick={() => {
                  if (!isLoggedIn) onAuthRequired();
                }}
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Phone{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Comment *
            </label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              onClick={() => {
                if (!isLoggedIn) onAuthRequired();
              }}
              placeholder="Share your thoughts…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Posting…" : "Post Comment"}
          </button>
        </form>
      </div>

 
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <FiMessageCircle className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-gray-500 text-sm">
            No comments yet. Be the first!
          </p>
        </div>
      ) : (
        <div>
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}

      {/* ── Infinite scroll sentinel ── */}
      <div ref={loaderRef} className="py-6 flex justify-center">
        {loadingMore && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading more comments…
          </div>
        )}
      </div>
    </section>
  );
}