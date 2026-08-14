import { Link } from "react-router-dom";
import type { BlogPost } from "@portfolio/shared";
import { Card, Badge } from "@/components/ui";

interface BlogCardProps {
  post: BlogPost;
  /** Caps the number of tag badges shown; omit to show all. */
  maxTags?: number;
}

/** Shared by the home page's recent-writing preview and the full `/blog` grid. */
export function BlogCard({ post, maxTags }: BlogCardProps) {
  const tags = maxTags ? post.tags.slice(0, maxTags) : post.tags;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Card interactive padded={false} className="flex h-full flex-col overflow-hidden">
      <Link to={`/blog/${post.slug}`} className="block" tabIndex={-1}>
        <img src={post.coverImageUrl} alt="" loading="lazy" className="h-40 w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} tone="blog">
              {tag}
            </Badge>
          ))}
        </div>
        <Link to={`/blog/${post.slug}`} className="mt-3 block">
          <h3 className="text-base font-semibold text-base-50 transition-colors hover:text-blog">{post.title}</h3>
        </Link>
        <p className="mt-2 flex-1 text-sm text-base-300">{post.excerpt}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-base-400">
          {date && (
            <>
              <span>{date}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{post.readingTimeMinutes} min read</span>
        </div>
      </div>
    </Card>
  );
}
