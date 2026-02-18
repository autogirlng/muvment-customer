import {
  BlogCategory,
  BlogComment,
  BlogLike,
  BlogPost,
  CreateCommentBody,
  PaginatedResponse,
  UpdateCommentBody,
} from "@/types/blog.type";
import {
  updateDataFormWithNoID,
  createData,
  deleteData,
  getSingleData,
} from "../connnector/app.callers";

export class BlogService {
  private static readonly BLOG_POSTS = "/api/v1/blog-posts";
  private static readonly BLOG_COMMENTS = "/api/v1/blog-comments";
  private static readonly BLOG_LIKES = "/api/v1/blog-likes";
  private static readonly BLOG_VIEWS = "/api/v1/blog-views";
  private static readonly BLOG_CATEGORIES = "/api/v1/blog-categories";

  static async getCategories(): Promise<BlogCategory[]> {
    try {
      const rawData = await getSingleData(this.BLOG_CATEGORIES);
      const data = { ...rawData };
      if (data?.data && Array.isArray(data.data))
        return data.data[0].data.content;
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  static async getPosts(params?: {
    page?: number;
    size?: number;
    search?: string;
    category?: string;
  }): Promise<PaginatedResponse<BlogPost>> {
    try {
      const query = new URLSearchParams();
      if (params?.page !== undefined) query.set("page", String(params.page));
      if (params?.size !== undefined) query.set("size", String(params.size));
      if (params?.search) query.set("search", params.search);
      if (params?.category) query.set("category", params.category);

      const url = `${this.BLOG_POSTS}${query.toString() ? `?${query.toString()}` : ""}`;
      const rawData = await getSingleData(url);
      const data = { ...rawData };

      if (data?.data)
        return {
          data: data.data[0].data.content,
          totalElements: data.data[0].data.totalElements,
          totalPages: data.data[0].data.totalPages,
          page: data.data[0].data.page,
          size: data.data[0].data.size,
        };
      return { data: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw new Error("Failed to load blog posts");
    }
  }

  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const rawData = await getSingleData(`${this.BLOG_POSTS}/${slug}`);
      const data = { ...rawData };
      if (data?.data) return data.data[0].data as BlogPost;
      return null;
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      throw new Error("Failed to load blog post");
    }
  }

  static async getRelatedPosts(
    categoryId: string,
    excludePostId: string,
  ): Promise<BlogPost[]> {
    try {
      const result = await this.getPosts({ category: categoryId, size: 4 });
      return result.data.filter((p: any) => p.id !== excludePostId).slice(0, 3);
    } catch (error) {
      console.error("Error fetching related posts:", error);
      return [];
    }
  }

  static async getCommentsByPost(
    postId: string,
    page = 0,
    size = 10,
  ): Promise<PaginatedResponse<BlogComment>> {
    try {
      const rawData = await getSingleData(
        `${this.BLOG_COMMENTS}/post/${postId}?page=${page}&size=${size}`,
      );
      const data = { ...rawData };
      if (data?.data)
        return {
          data: data.data[0].data.content,
          totalElements: data.data[0].data.totalElements,
          totalPages: data.data[0].data.totalPages,
          page: data.data[0].data.page,
          size: data.data[0].data.size,
        };
      return { data: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error("Failed to load comments");
    }
  }

  static async createComment(body: CreateCommentBody): Promise<BlogComment> {
    try {
      const response = await createData(this.BLOG_COMMENTS, body);
      return response.data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw new Error("Failed to post comment");
    }
  }

  static async updateComment(body: UpdateCommentBody): Promise<BlogComment> {
    try {
      const response = await updateDataFormWithNoID(this.BLOG_COMMENTS, body);
      return response.data;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw new Error("Failed to update comment");
    }
  }

  static async likePost(postId: string): Promise<BlogLike> {
    try {
      const response = await createData(this.BLOG_LIKES, {
        post: { id: postId },
      });
      return response.data;
    } catch (error) {
      console.error("Error liking post:", error);
      throw new Error("Failed to like post");
    }
  }

  static async unlikePost(likeId: string): Promise<void> {
    try {
      await deleteData(`${this.BLOG_LIKES}/${likeId}`);
    } catch (error) {
      console.error("Error unliking post:", error);
      throw new Error("Failed to unlike post");
    }
  }

  static async getLikeCount(postId: string): Promise<number> {
    try {
      const rawData = await getSingleData(`${this.BLOG_LIKES}/${postId}/count`);
      const data = { ...rawData };
      return data?.data ?? 0;
    } catch (error) {
      console.error("Error fetching like count:", error);
      return 0;
    }
  }

  static async recordView(postId: string): Promise<void> {
    try {
      await getSingleData(`${this.BLOG_VIEWS}/${postId}`);
    } catch (error) {
      console.warn("Failed to record view:", error);
    }
  }

  static buildPostUrl(slug: string): string {
    return `/blog/${slug}`;
  }

  static formatDate(dateString: string): string {
    return new Intl.DateTimeFormat("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  }

  static formatDateLong(dateString: string): string {
    return new Intl.DateTimeFormat("en-NG", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  }

  static estimateReadTime(content: string): number {
    const words = content?.trim().split(/\s+/).length ?? 0;
    return Math.max(1, Math.ceil(words / 200));
  }
}
