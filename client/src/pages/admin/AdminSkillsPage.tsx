import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { skillCategories, skillLevels, skillInputSchema, type Skill, type SkillInput } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReorderableList } from "@/components/admin/ReorderableList";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { TagListInput } from "@/components/admin/TagListInput";
import { Badge, Button, Card, Input, Modal, Select, Skeleton } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api";
import {
  useAdminSkills,
  useCreateSkill,
  useUpdateSkill,
  useRemoveSkill,
  useReorderSkills,
} from "@/hooks/admin/useAdminSkills";

const EMPTY_VALUES: SkillInput = {
  name: "",
  category: "Frontend",
  iconKey: "",
  level: "Intermediate",
  yearsExperience: undefined,
  relatedTechnologies: [],
  order: 0,
};

export function AdminSkillsPage() {
  const { data: skills, isLoading } = useAdminSkills();
  const create = useCreateSkill();
  const update = useUpdateSkill();
  const remove = useRemoveSkill();
  const reorder = useReorderSkills();
  const { toast } = useToast();

  const [editing, setEditing] = useState<Skill | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SkillInput>({
    resolver: zodResolver(skillInputSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    reset(EMPTY_VALUES);
    setFormOpen(true);
  }

  function openEdit(skill: Skill) {
    setEditing(skill);
    reset(skill);
    setFormOpen(true);
  }

  async function onSubmit(data: SkillInput) {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, patch: data });
        toast({ tone: "success", title: "Skill updated" });
      } else {
        await create.mutateAsync(data);
        toast({ tone: "success", title: "Skill added" });
      }
      setFormOpen(false);
    } catch (err) {
      toast({
        tone: "danger",
        title: "Couldn't save skill",
        description: err instanceof ApiError ? err.message : undefined,
      });
    }
  }

  function handleDelete() {
    if (!pendingDelete) return;
    remove.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast({ tone: "success", title: `Deleted "${pendingDelete.name}"` });
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
        title="Skills"
        description="Drag to reorder. Levels are Beginner/Intermediate/Advanced/Expert, not decorative percentages."
        action={
          <Button size="sm" onClick={openCreate}>
            <FiPlus aria-hidden="true" /> New skill
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !skills || skills.length === 0 ? (
        <Card className="text-center text-sm text-base-400">No skills yet.</Card>
      ) : (
        <ReorderableList
          items={skills}
          getId={(s) => s.id}
          pending={reorder.isPending}
          onCommit={(orderedIds) =>
            reorder.mutate(orderedIds, {
              onError: (err) => toast({ tone: "danger", title: err instanceof ApiError ? err.message : "Reorder failed" }),
            })
          }
          renderItem={(skill) => (
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-base-100">{skill.name}</p>
                  <Badge tone="skills">{skill.category}</Badge>
                  <Badge tone="neutral">{skill.level}</Badge>
                  {skill.yearsExperience !== undefined && (
                    <span className="text-xs text-base-400">{skill.yearsExperience}y</span>
                  )}
                </div>
                {skill.relatedTechnologies.length > 0 && (
                  <p className="mt-0.5 truncate text-xs text-base-400">{skill.relatedTechnologies.join(", ")}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Edit skill"
                  onClick={() => openEdit(skill)}
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-base-700 hover:text-base-100"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete skill"
                  onClick={() => setPendingDelete(skill)}
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        />
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit skill" : "New skill"}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select label="Category" {...field}>
                  {skillCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              )}
            />
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <Select label="Level" {...field}>
                  {skillLevels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Icon key"
              hint="e.g. react, node, postgres"
              error={errors.iconKey?.message}
              {...register("iconKey")}
            />
            <Controller
              control={control}
              name="yearsExperience"
              render={({ field }) => (
                <Input
                  label="Years experience"
                  type="number"
                  step="0.5"
                  min={0}
                  hint="Optional"
                  error={errors.yearsExperience?.message}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                />
              )}
            />
          </div>
          <Controller
            control={control}
            name="relatedTechnologies"
            render={({ field }) => (
              <TagListInput label="Related technologies" value={field.value ?? []} onChange={field.onChange} rows={3} />
            )}
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editing ? "Save changes" : "Add skill"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete skill"
        description={`Are you sure you want to delete "${pendingDelete?.name}"? This can't be undone.`}
        isDeleting={remove.isPending}
      />
    </Reveal>
  );
}
