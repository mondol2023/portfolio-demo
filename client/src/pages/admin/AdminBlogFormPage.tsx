import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogStatuses, blogPostInputSchema, type BlogPostInput } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { TagListInput } from "@/components/admin/TagListInput";
import { Button, Card, Input, Select, Skeleton, Textarea } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api";
import { useAdminBlogPost, useCreateBlogPost, useUpdateBlogPost } from "@/hooks/admin/useAdminBlog";

const EMPTY_VALUES: BlogPostInput = {
  slug: "",
  title: "",
  coverImageUrl: "",
  excerpt: "",
  contentHtml: "",
  tags: [],
  status: "draft",
  publishedAt: null,
  scheduledAt: null,
  author: "Alex Rivera",
};

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `<input type="datetime-local">` <-> ISO string conversions (local wall-clock, no timezone suffix). */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function AdminBlogFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: existing, isLoading } = useAdminBlogPost(id);
  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostInputSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const title = watch("title");
  const status = watch("status");

  async function onSubmit(data: BlogPostInput) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, patch: data });
        toast({ tone: "success", title: "Post updated" });
      } else {
        await create.mutateAsync(data);
        toast({ tone: "success", title: "Post created" });
      }
      navigate("/admin/blog");
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        for (const [field, messages] of Object.entries(err.details)) {
          if (messages?.[0] && field in data) {
            setError(field as keyof BlogPostInput, { message: messages[0] });
          }
        }
      }
      toast({
        tone: "danger",
        title: "Couldn't save post",
        description: err instanceof ApiError ? err.message : undefined,
      });
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <Reveal className="flex flex-col gap-6 pb-16">
      <AdminPageHeader title={isEdit ? "Edit post" : "New post"} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Title" error={errors.title?.message} {...register("title")} />
            <div className="flex items-end gap-2">
              <Input label="Slug" hint="Used in the public URL" error={errors.slug?.message} {...register("slug")} />
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue("slug", slugify(title ?? ""), { shouldDirty: true })}
                disabled={!title}
              >
                From title
              </Button>
            </div>
          </div>

          <Textarea label="Excerpt" rows={2} error={errors.excerpt?.message} {...register("excerpt")} />
          <Input label="Cover image URL" error={errors.coverImageUrl?.message} {...register("coverImageUrl")} />

          <div className="grid gap-5 sm:grid-cols-3">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select label="Status" {...field}>
                  {blogStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              )}
            />
            <Controller
              control={control}
              name="publishedAt"
              render={({ field }) => (
                <Input
                  type="datetime-local"
                  label="Published at"
                  hint={status === "draft" ? "Leave blank while still a draft" : undefined}
                  error={errors.publishedAt?.message}
                  value={toDatetimeLocal(field.value)}
                  onChange={(e) => field.onChange(fromDatetimeLocal(e.target.value))}
                />
              )}
            />
            {status === "scheduled" && (
              <Controller
                control={control}
                name="scheduledAt"
                render={({ field }) => (
                  <Input
                    type="datetime-local"
                    label="Scheduled for"
                    error={errors.scheduledAt?.message}
                    value={toDatetimeLocal(field.value)}
                    onChange={(e) => field.onChange(fromDatetimeLocal(e.target.value))}
                  />
                )}
              />
            )}
          </div>

          <Input label="Author" error={errors.author?.message} {...register("author")} />
        </Card>

        <Card className="flex flex-col gap-5">
          <Controller
            control={control}
            name="contentHtml"
            render={({ field }) => (
              <RichTextEditor
                label="Content"
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.contentHtml?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="tags"
            render={({ field }) => <TagListInput label="Tags" value={field.value ?? []} onChange={field.onChange} />}
          />
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate("/admin/blog")}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Save changes" : "Create post"}
          </Button>
        </div>
      </form>
    </Reveal>
  );
}
