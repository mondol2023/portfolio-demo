import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiSuccess, SiteContentEntry } from "@portfolio/shared";
import { adminApiFetch } from "@/lib/adminApi";

const BASE_PATH = "/api/admin/site-content";
const LIST_KEY = ["admin-site-content"] as const;

/** Key/value settings store — doesn't fit the id-keyed `createAdminCrudHooks` factory. */
export function useAdminSiteContent() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: async () => (await adminApiFetch<ApiSuccess<SiteContentEntry[]>>(BASE_PATH)).data,
  });
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApiFetch<ApiSuccess<SiteContentEntry>>(`${BASE_PATH}/${encodeURIComponent(key)}`, {
        method: "PUT",
        // Value-only body — the server merges with the existing entry's
        // label/group rather than requiring them on every save.
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
