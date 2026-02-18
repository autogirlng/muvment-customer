import { BlogService } from "@/controllers/BlogService/blogService";
import { BlogPost } from "@/types/blog.type";
import Link from "next/link";


interface PostCardProps {
  post: BlogPost;
}

export default function PostCard({ post }: PostCardProps) {
  const author = post.authAuthorName || post.authorName;
 
  return (
    <Link
      href={BlogService.buildPostUrl(post.id)}
      className="group block h-full"
    >
      <article className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative overflow-hidden aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-slate-300"
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

          {post.blogCategory && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
              {post.blogCategory.name}
            </span>
          )}

          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-gray-500 font-medium">
            {BlogService.estimateReadTime(post.content)} min
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-snug">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
              {post.excerpt}
            </p>
          )}

       
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {(author || "A")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {author}
                </p>
                <time
                  dateTime={post.approvedAt || post.createdAt}
                  className="text-xs text-gray-400"
                >
                  {BlogService.formatDate(post.approvedAt || post.createdAt)}
                </time>
              </div>
            </div>

            {/* <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
              <span className="flex items-center gap-1">
                <BsHeart className="w-3 h-3" />
                {(post.metrics?.likes ?? 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <BsChatSquare className="w-3 h-3" />
                {(post.metrics?.commentCount ?? 0).toLocaleString()}
              </span>
            </div> */}
          </div>
        </div>
      </article>
    </Link>
  );
}