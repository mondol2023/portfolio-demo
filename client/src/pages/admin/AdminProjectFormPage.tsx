import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiChevronDown } from "react-icons/fi";
import { projectCategories, projectInputSchema, type ProjectInput } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { TagListInput } from "@/components/admin/TagListInput";
import { Button, Card, Input, Select, Skeleton, Switch, Textarea } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useAdminProject, useCreateProject, useUpdateProject } from "@/hooks/admin/useAdminProjects";

const EMPTY_VALUES: ProjectInput = {
  slug: "",
  title: "",
  shortDescription: "",
  longDescriptionHtml: "",
  thumbnailUrl: "",
  screenshotUrls: [],
  technologies: [],
  category: "Full-Stack",
  githubUrl: undefined,
  liveUrl: undefined,
  featured: false,
  published: true,
  order: 0,
  problem: "",
  solution: "",
  architecture: "",
  features: [],
  challenges: "",
  lessonsLearned: "",
};

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: existing, isLoading } = useAdminProject(id);
  const create = useCreateProject();
  const update = useUpdateProject();
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const title = watch("title");

  async function onSubmit(data: ProjectInput) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, patch: data });
        toast({ tone: "success", title: "Project updated" });
      } else {
        await create.mutateAsync(data);
        toast({ tone: "success", title: "Project created" });
      }
      navigate("/admin/projects");
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        for (const [field, messages] of Object.entries(err.details)) {
          if (messages?.[0] && field in data) {
            setError(field as keyof ProjectInput, { message: messages[0] });
          }
        }
      }
      toast({
        tone: "danger",
        title: "Couldn't save project",
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
      <AdminPageHeader title={isEdit ? "Edit project" : "New project"} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Title" error={errors.title?.message} {...register("title")} />
            <div className="flex items-end gap-2">
              <Input
                label="Slug"
                hint="Used in the public URL"
                error={errors.slug?.message}
                {...register("slug")}
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setValue("slug", slugify(title ?? ""), { shouldDirty: true })}
                disabled={!title}
              >
                From title
              </Button>
            </div>
          </div>

          <Textarea
            label="Short description"
            hint="Shown in project cards — keep it under ~1-2 sentences"
            error={errors.shortDescription?.message}
            rows={2}
            {...register("shortDescription")}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Thumbnail URL" error={errors.thumbnailUrl?.message} {...register("thumbnailUrl")} />
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select label="Category" error={errors.category?.message} {...field}>
                  {projectCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="GitHub URL"
              hint="Optional"
              error={errors.githubUrl?.message}
              {...register("githubUrl")}
            />
            <Input label="Live URL" hint="Optional" error={errors.liveUrl?.message} {...register("liveUrl")} />
          </div>

          <div className="flex flex-wrap gap-8">
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Switch
                  label="Featured"
                  hint="Highlighted on the homepage"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              control={control}
              name="published"
              render={({ field }) => (
                <Switch
                  label="Published"
                  hint="Visible on the public site"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-5">
          <Controller
            control={control}
            name="longDescriptionHtml"
            render={({ field }) => (
              <RichTextEditor
                label="Full description"
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.longDescriptionHtml?.message}
              />
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              control={control}
              name="technologies"
              render={({ field }) => (
                <TagListInput label="Technologies" value={field.value ?? []} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="screenshotUrls"
              render={({ field }) => (
                <TagListInput
                  label="Screenshot URLs"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="https://…"
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="features"
            render={({ field }) => <TagListInput label="Key features" value={field.value ?? []} onChange={field.onChange} />}
          />
        </Card>

        <Card padded={false} className="overflow-hidden">
          <button
            type="button"
            onClick={() => setCaseStudyOpen((o) => !o)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <div>
              <p className="font-medium text-base-100">Case study details</p>
              <p className="text-xs text-base-400">Problem, solution, architecture, challenges, lessons learned</p>
            </div>
            <FiChevronDown
              aria-hidden="true"
              className={cn("h-5 w-5 text-base-400 transition-transform", caseStudyOpen && "rotate-180")}
            />
          </button>
          {caseStudyOpen && (
            <div className="flex flex-col gap-5 border-t border-base-700 px-6 py-5">
              <Textarea label="Problem" rows={3} {...register("problem")} />
              <Textarea label="Solution" rows={3} {...register("solution")} />
              <Textarea label="Architecture" rows={3} {...register("architecture")} />
              <Textarea label="Challenges" rows={3} {...register("challenges")} />
              <Textarea label="Lessons learned" rows={3} {...register("lessonsLearned")} />
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate("/admin/projects")}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </Reveal>
  );
}
