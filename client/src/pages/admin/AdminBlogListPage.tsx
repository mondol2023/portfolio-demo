import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiExternalLink, FiTrash2 } from "react-icons/fi";
import type { BlogPost } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { Badge, Card, LinkButton, Skeleton } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api";
import { useAdminBlogPosts, useRemoveBlogPost } from "@/hooks/admin/useAdminBlog";

const STATUS_TONE = {
  draft: "neutral",
  published: "success",
  scheduled: "info",
} as const;

export function AdminBlogListPage() {
  const { data: posts, isLoading } = useAdminBlogPosts();
  const remove = useRemoveBlogPost();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null);

  function handleDelete() {
    if (!pendingDelete) return;
    remove.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast({ tone: "success", title: `Deleted "${pendingDelete.title}"` });
        setPendingDelete(null);
      },
      onError: (err) => {
        toast({ tone: "danger", title: err instanceof ApiError ? err.message : "Delete failed" });
        setPendingDelete(null);
      },
    });
  }

  return (
    <Reveal className="flex flex-col gap-6">
      <AdminPageHeader
        title="Blog"
        description="Write, edit, and publish posts."
        action={
          <LinkButton to="/admin/blog/new" size="sm">
            New post
          </LinkButton>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !posts || posts.length === 0 ? (
        <Card className="text-center text-sm text-base-400">No posts yet. Write your first one.</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-wrap items-center gap-4">
              <img src={post.coverImageUrl} alt="" className="h-12 w-16 flex-shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-base-100">{post.title}</p>
                  <Badge tone={STATUS_TONE[post.status]}>{post.status}</Badge>
                </div>
                <p className="truncate text-xs text-base-400">
                  {post.excerpt} · {post.readingTimeMinutes} min read
                </p>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View on site"
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-base-700 hover:text-base-100"
                >
                  <FiExternalLink className="h-4 w-4" />
                </a>
                <Link
                  to={`/admin/blog/${post.id}/edit`}
                  aria-label="Edit post"
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-base-700 hover:text-base-100"
                >
                  <FiEdit2 className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  aria-label="Delete post"
                  onClick={() => setPendingDelete(post)}
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete post"
        description={`Are you sure you want to delete "${pendingDelete?.title}"? This can't be undone.`}
        isDeleting={remove.isPending}
      />
    </Reveal>
  );
}
