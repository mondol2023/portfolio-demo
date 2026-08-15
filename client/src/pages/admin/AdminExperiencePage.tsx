import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { experienceInputSchema, type Experience, type ExperienceInput } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReorderableList } from "@/components/admin/ReorderableList";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { TagListInput } from "@/components/admin/TagListInput";
import { Badge, Button, Card, Input, Modal, Skeleton, Switch, Textarea } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api";
import {
  useAdminExperience,
  useCreateExperience,
  useUpdateExperience,
  useRemoveExperience,
  useReorderExperience,
} from "@/hooks/admin/useAdminExperience";

const EMPTY_VALUES: ExperienceInput = {
  company: "",
  position: "",
  startDate: "",
  endDate: null,
  isCurrent: false,
  description: "",
  responsibilities: [],
  technologies: [],
  order: 0,
};

function formatRange(exp: Experience) {
  const start = exp.startDate.slice(0, 7);
  const end = exp.isCurrent ? "Present" : (exp.endDate?.slice(0, 7) ?? "—");
  return `${start} – ${end}`;
}

export function AdminExperiencePage() {
  const { data: experience, isLoading } = useAdminExperience();
  const create = useCreateExperience();
  const update = useUpdateExperience();
  const remove = useRemoveExperience();
  const reorder = useReorderExperience();
  const { toast } = useToast();

  const [editing, setEditing] = useState<Experience | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceInput>({
    resolver: zodResolver(experienceInputSchema),
    defaultValues: EMPTY_VALUES,
  });

  const isCurrent = watch("isCurrent");

  function openCreate() {
    setEditing(null);
    reset(EMPTY_VALUES);
    setFormOpen(true);
  }

  function openEdit(exp: Experience) {
    setEditing(exp);
    reset(exp);
    setFormOpen(true);
  }

  async function onSubmit(data: ExperienceInput) {
    try {
      const payload = { ...data, endDate: data.isCurrent ? null : data.endDate };
      if (editing) {
        await update.mutateAsync({ id: editing.id, patch: payload });
        toast({ tone: "success", title: "Experience updated" });
      } else {
        await create.mutateAsync(payload);
        toast({ tone: "success", title: "Experience added" });
      }
      setFormOpen(false);
    } catch (err) {
      toast({
        tone: "danger",
        title: "Couldn't save experience",
        description: err instanceof ApiError ? err.message : undefined,
      });
    }
  }

  function handleDelete() {
    if (!pendingDelete) return;
    remove.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast({ tone: "success", title: `Deleted "${pendingDelete.position}"` });
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
        title="Experience"
        description="Drag to reorder your work history timeline."
        action={
          <Button size="sm" onClick={openCreate}>
            <FiPlus aria-hidden="true" /> New entry
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !experience || experience.length === 0 ? (
        <Card className="text-center text-sm text-base-400">No experience entries yet.</Card>
      ) : (
        <ReorderableList
          items={experience}
          getId={(e) => e.id}
          pending={reorder.isPending}
          onCommit={(orderedIds) =>
            reorder.mutate(orderedIds, {
              onError: (err) => toast({ tone: "danger", title: err instanceof ApiError ? err.message : "Reorder failed" }),
            })
          }
          renderItem={(exp) => (
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-base-100">{exp.position}</p>
                  <span className="text-sm text-base-400">@ {exp.company}</span>
                  {exp.isCurrent && <Badge tone="experience">Current</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-base-400">{formatRange(exp)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Edit experience"
                  onClick={() => openEdit(exp)}
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-base-700 hover:text-base-100"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete experience"
                  onClick={() => setPendingDelete(exp)}
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        />
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit experience" : "New experience"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company" error={errors.company?.message} {...register("company")} />
            <Input label="Position" error={errors.position?.message} {...register("position")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date" error={errors.startDate?.message} {...register("startDate")} />
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <Input
                  label="End date"
                  type="date"
                  disabled={isCurrent}
                  hint={isCurrent ? "Disabled while marked current" : undefined}
                  error={errors.endDate?.message}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                />
              )}
            />
          </div>
          <Controller
            control={control}
            name="isCurrent"
            render={({ field }) => (
              <Switch
                label="Current role"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
          <Textarea label="Description" rows={3} error={errors.description?.message} {...register("description")} />
          <Controller
            control={control}
            name="responsibilities"
            render={({ field }) => (
              <TagListInput label="Responsibilities" value={field.value ?? []} onChange={field.onChange} rows={3} />
            )}
          />
          <Controller
            control={control}
            name="technologies"
            render={({ field }) => (
              <TagListInput label="Technologies" value={field.value ?? []} onChange={field.onChange} rows={3} />
            )}
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editing ? "Save changes" : "Add entry"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete experience"
        description={`Are you sure you want to delete "${pendingDelete?.position}"? This can't be undone.`}
        isDeleting={remove.isPending}
      />
    </Reveal>
  );
}
