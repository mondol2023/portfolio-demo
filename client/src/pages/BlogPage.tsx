import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/animations/Reveal";
import { BlogCard } from "@/components/blog/BlogCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { springs } from "@/lib/animations/tokens";
import { cn } from "@/lib/cn";
import { useBlogPosts } from "@/hooks/useApiQueries";

type FilterValue = "All" | string;

export function BlogPage() {
  const [filter, setFilter] = useState<FilterValue>("All");
  const { data: posts, isLoading } = useBlogPosts();

  const publishedPosts = useMemo(
    () =>
      (posts ?? [])
        .filter((post) => post.status === "published")
        .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
    [posts]
  );

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    publishedPosts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [publishedPosts]);

  const filterOptions: FilterValue[] = ["All", ...availableTags];
  const filteredPosts =
    filter === "All" ? publishedPosts : publishedPosts.filter((post) => post.tags.includes(filter));

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-blog">Blog</span>
        <h1 className="mt-2 text-3xl font-semibold text-base-50 sm:text-4xl">Writing on motion, code, and craft</h1>
        <p className="mx-auto mt-3 max-w-xl text-base-300">
          Notes on shipping animated, accessible web products — filter by topic to narrow it down.
        </p>
      </Reveal>

      {!isLoading && (
        <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter posts by tag">
          {filterOptions.map((tag) => {
            const isActive = filter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setFilter(tag)}
                aria-pressed={isActive}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive ? "text-base-950" : "text-base-300 hover:text-base-50"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="blog-filter-active"
                    className="absolute inset-0 rounded-full bg-blog"
                    transition={springs.snappy}
                  />
                )}
                <span className="relative z-10">{tag}</span>
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : (
        <>
          <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={springs.gentle}
                >
                  <BlogCard post={post} maxTags={3} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredPosts.length === 0 && (
            <p className="mt-16 text-center text-base-400">No posts tagged &ldquo;{filter}&rdquo; yet.</p>
          )}
        </>
      )}
    </div>
  );
}
