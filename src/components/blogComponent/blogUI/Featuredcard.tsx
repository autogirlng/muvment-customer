import { BlogService } from "@/controllers/BlogService/blogService";
import { BlogPost } from "@/types/blog.type";
import Link from "next/link";
import { BsEye, BsHeart, BsChatSquare } from "react-icons/bs";


interface FeaturedCardProps {
  post: BlogPost;
}

export default function FeaturedCard({ post }: FeaturedCardProps) {
  const author = post.authorName || post.authorName;


  return (
    <Link href={BlogService.buildPostUrl(post.id)} className="group block">
      <article className="relative overflow-hidden rounded-2xl bg-[#0d1f35] min-h-[420px] flex items-end">
    
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f35] via-[#0d1f3580] to-transparent z-10" />

        <div
          className="absolute inset-0 opacity-10 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-20 p-8 md:p-10 w-full">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {post.blogCategory && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {post.blogCategory.name}
              </span>
            )}
            <span className="text-gray-500 text-xs">
              {BlogService.estimateReadTime(post.content)} min read
            </span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight mb-3 group-hover:text-blue-200 transition-colors duration-300 max-w-2xl">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xl line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {(author || "A")[0].toUpperCase()}
                </div>
                <span className="text-gray-400">{author}</span>
              </div>
              <span>·</span>
              <time dateTime={post.approvedAt || post.createdAt}>
                {BlogService.formatDate(post.approvedAt || post.createdAt)}
              </time>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <BsEye className="w-3.5 h-3.5" />
                {(post.metrics?.views ?? 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <BsHeart className="w-3.5 h-3.5" />
                {(post.metrics?.likes ?? 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <BsChatSquare className="w-3.5 h-3.5" />
                {(post.metrics?.commentCount ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}