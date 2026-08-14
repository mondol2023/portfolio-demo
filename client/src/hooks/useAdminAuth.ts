import { useSyncExternalStore } from "react";
import type { LoginInput } from "@portfolio/shared";
import { adminAuthStore, type AdminAuthState } from "@/lib/adminAuthStore";
import { adminLogin, adminLogout } from "@/lib/adminApi";

export interface UseAdminAuth extends AdminAuthState {
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

/** Reactive view onto the module-level admin session store, plus the login/logout actions. */
export function useAdminAuth(): UseAdminAuth {
  const state = useSyncExternalStore(adminAuthStore.subscribe, adminAuthStore.getState, adminAuthStore.getState);

  return {
    ...state,
    login: async (input) => {
      await adminLogin(input);
    },
    logout: adminLogout,
  };
}
