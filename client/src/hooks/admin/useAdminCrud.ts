import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiSuccess } from "@portfolio/shared";
import { adminApiFetch } from "@/lib/adminApi";

interface EntityWithId {
  id: string;
}

/**
 * Builds the standard set of TanStack Query hooks (list/get/create/update/
 * delete[/reorder]) for one id-keyed admin entity, mirroring the shape of
 * the server's `buildAdminCrudRouter` factory (`server/src/lib/admin-crud-route.ts`)
 * one call site per entity instead of duplicating the same query/mutation
 * boilerplate across projects/blog/skills/experience.
 */
export function createAdminCrudHooks<T extends EntityWithId, Input>(basePath: string, entityKey: string) {
  const listKey = [entityKey] as const;
  const itemKey = (id: string) => [entityKey, id] as const;

  function useAdminList() {
    return useQuery({
      queryKey: listKey,
      queryFn: async () => (await adminApiFetch<ApiSuccess<T[]>>(basePath)).data,
    });
  }

  function useAdminItem(id: string | undefined) {
    return useQuery({
      queryKey: itemKey(id ?? ""),
      queryFn: async () => (await adminApiFetch<ApiSuccess<T>>(`${basePath}/${id}`)).data,
      enabled: Boolean(id),
    });
  }

  function useAdminCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (input: Input) =>
        adminApiFetch<ApiSuccess<T>>(basePath, { method: "POST", body: JSON.stringify(input) }),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: listKey });
      },
    });
  }

  function useAdminUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Partial<Input> }) =>
        adminApiFetch<ApiSuccess<T>>(`${basePath}/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
      onSuccess: (_data, variables) => {
        void queryClient.invalidateQueries({ queryKey: listKey });
        void queryClient.invalidateQueries({ queryKey: itemKey(variables.id) });
      },
    });
  }

  function useAdminRemove() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => adminApiFetch<{ success: true }>(`${basePath}/${id}`, { method: "DELETE" }),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: listKey });
      },
    });
  }

  function useAdminReorder() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (orderedIds: string[]) =>
        adminApiFetch<{ success: true }>(`${basePath}/reorder`, {
          method: "POST",
          body: JSON.stringify({ orderedIds }),
        }),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: listKey });
      },
    });
  }

  return { listKey, useAdminList, useAdminItem, useAdminCreate, useAdminUpdate, useAdminRemove, useAdminReorder };
}
