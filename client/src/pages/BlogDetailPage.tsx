import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiClock } from "react-icons/fi";
import { Reveal } from "@/components/animations/Reveal";
import { Badge, Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { sanitizeHtml } from "@/lib/sanitize";
import { useBlogPost } from "@/hooks/useApiQueries";

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useBlogPost(slug);

  const safeContent = useMemo(() => (post ? sanitizeHtml(post.contentHtml) : ""), [post]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-6 h-9 w-2/3" />
        <Skeleton className="mt-4 h-4 w-48" />
        <Skeleton className="mt-8 aspect-[1200/630] w-full" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <Reveal className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-base-400">404</span>
          <h1 className="text-2xl font-semibold text-base-50">Post not found</h1>
          <p className="text-base-300">It may have been unpublished, renamed, or the link is wrong.</p>
          <Button onClick={() => navigate("/blog")}>
            <FiArrowLeft aria-hidden="true" /> Back to blog
          </Button>
        </Reveal>
      </div>
    );
  }

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <article className="mx-auto max-w-2xl px-6 py-24">
      <Reveal>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-base-400 transition-colors hover:text-base-50"
        >
          <FiArrowLeft aria-hidden="true" /> All posts
        </Link>

        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} tone="blog">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-base-50 sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-base-400">
          <span>{post.author}</span>
          {date && (
            <>
              <span aria-hidden="true">·</span>
              <span>{date}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <FiClock aria-hidden="true" /> {post.readingTimeMinutes} min read
          </span>
        </div>
      </Reveal>

      <Reveal margin="-40px" className="mt-8">
        <img
          src={post.coverImageUrl}
          alt=""
          className="aspect-[1200/630] w-full rounded-2xl border border-base-800 object-cover"
        />
      </Reveal>

      <Reveal margin="-60px" className="mt-10">
        {safeContent ? (
          <div className="prose-blog prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: safeContent }} />
        ) : (
          <p className="text-base-300">{post.excerpt}</p>
        )}
      </Reveal>
    </article>
  );
}
