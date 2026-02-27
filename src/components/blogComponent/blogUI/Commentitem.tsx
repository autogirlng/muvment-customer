import { BlogService } from "@/controllers/BlogService/blogService";
import { BlogComment } from "@/types/blog.type";

interface CommentItemProps {
  comment: BlogComment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex gap-3 py-5 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {(comment.authorName || "A")[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="font-semibold text-gray-900 text-sm">
            {comment.authorName}
          </span>
          <span className="text-gray-400 text-xs">
            {BlogService.formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}