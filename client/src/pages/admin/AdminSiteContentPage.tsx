import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import type { SiteContentEntry } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button, Card, Input, Skeleton, Textarea } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api";
import { useAdminSiteContent, useUpdateSiteContent } from "@/hooks/admin/useAdminSiteContent";

const GROUP_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  stats: "Stats",
  contact: "Contact",
  general: "General",
};

const LONG_FIELD_HINT = /description|intro|philosophy|focus/i;

function EntryField({ entry }: { entry: SiteContentEntry }) {
  const [value, setValue] = useState(entry.value);
  const update = useUpdateSiteContent();
  const { toast } = useToast();

  useEffect(() => {
    setValue(entry.value);
  }, [entry.value]);

  const dirty = value !== entry.value;
  const isLong = LONG_FIELD_HINT.test(entry.key) || entry.value.length > 80;

  function handleSave() {
    update.mutate(
      { key: entry.key, value },
      {
        onSuccess: () => toast({ tone: "success", title: `Saved "${entry.label || entry.key}"` }),
        onError: (err) =>
          toast({ tone: "danger", title: "Couldn't save", description: err instanceof ApiError ? err.message : undefined }),
      }
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        {isLong ? (
          <Textarea
            label={entry.label || entry.key}
            hint={entry.key}
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : (
          <Input
            label={entry.label || entry.key}
            hint={entry.key}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )}
      </div>
      <Button
        type="button"
        variant={dirty ? "primary" : "outline"}
        size="sm"
        onClick={handleSave}
        isLoading={update.isPending}
        disabled={!dirty}
        className="sm:mb-[1px]"
      >
        <FiSave aria-hidden="true" /> Save
      </Button>
    </div>
  );
}

export function AdminSiteContentPage() {
  const { data: entries, isLoading } = useAdminSiteContent();

  const groups = (entries ?? []).reduce<Record<string, SiteContentEntry[]>>((acc, entry) => {
    const group = entry.group || "general";
    (acc[group] ??= []).push(entry);
    return acc;
  }, {});

  return (
    <Reveal className="flex flex-col gap-6">
      <AdminPageHeader title="Site content" description="Edit the copy shown across the public site, grouped by section." />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <Card className="text-center text-sm text-base-400">No site content entries found.</Card>
      ) : (
        Object.entries(groups).map(([group, groupEntries]) => (
          <Card key={group} className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-base-400">
              {GROUP_LABELS[group] ?? group}
            </h2>
            <div className="flex flex-col gap-4">
              {groupEntries.map((entry) => (
                <EntryField key={entry.key} entry={entry} />
              ))}
            </div>
          </Card>
        ))
      )}
    </Reveal>
  );
}
