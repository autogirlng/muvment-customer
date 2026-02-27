export interface BlogCategory {
  id: string;
  name: string;
  description: string;
  status: string;
  postCount: number;
  authorName: string;
  authorEmail: string;
  authorPhoneNumber: string;
  approvedAt: string;
  approvedById: string;
  approvalRef: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  authAuthorName: string;
  authAuthorEmail: string;
  authAuthorPhoneNumber: string;
}

export interface BlogMetrics {
  views: number;
  likes: number;
  commentCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  excerpt: string;
  authorName: string;
  authorEmail: string;
  authorPhoneNumber: string;
  approvedAt: string;
  approvedById: string;
  approvalRef: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  authAuthorName: string;
  authAuthorEmail: string;
  authAuthorPhoneNumber: string;
  blogCategory: BlogCategory;
  tags: string[];
  metrics: BlogMetrics;
}

export interface BlogComment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorPhoneNumber: string;
  post: { id: string };
  createdAt: string;
  updatedAt: string;
}

export interface BlogLike {
  id: string;
  post: { id: string };
  ipAddress: string;
  userAgent: string;
  lastViewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface CreateCommentBody {
  content: string;
  post: { id: string };
  authorName: string;
  authorEmail: string;
  authorPhoneNumber: string;
}

export interface UpdateCommentBody extends CreateCommentBody {
  id: string;
}
