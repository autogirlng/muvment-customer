import { BlogService } from "@/controllers/BlogService/blogService";
import { BlogPost } from "@/types/blog.type";
import Link from "next/link";


interface RelatedCardProps {
  post: BlogPost;
}

export default function RelatedCard({ post }: RelatedCardProps) {
  return (
    <Link
      href={BlogService.buildPostUrl(post.id)}
      className="group flex gap-3 py-4 border-b border-gray-50 last:border-0"
    >
      <div className="w-20 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-slate-300"
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
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug mb-1">
          {post.title}
        </h4>
        <time className="text-xs text-gray-400">
          {BlogService.formatDate(post.approvedAt || post.createdAt)}
        </time>
      </div>
    </Link>
  );
}