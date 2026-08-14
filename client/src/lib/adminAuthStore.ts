/**
 * Framework-agnostic external store holding the admin session. The access
 * token lives here — in memory only, never localStorage/sessionStorage — so
 * it survives across component unmounts within a tab but disappears on
 * reload (a silent `/refresh` call, backed by the httpOnly cookie, restores
 * it). `useAdminAuth` subscribes to this via `useSyncExternalStore`.
 */
export interface AdminSessionUser {
  id: string;
  email: string;
  role: "admin";
}

export type AdminAuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AdminAuthState {
  accessToken: string | null;
  expiresAt: string | null;
  user: AdminSessionUser | null;
  status: AdminAuthStatus;
}

let state: AdminAuthState = { accessToken: null, expiresAt: null, user: null, status: "idle" };
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export const adminAuthStore = {
  getState(): AdminAuthState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setLoading(): void {
    state = { ...state, status: "loading" };
    emit();
  },

  setSession(session: { accessToken: string; expiresAt: string; user: AdminSessionUser }): void {
    state = { ...session, status: "authenticated" };
    emit();
  },

  setUnauthenticated(): void {
    state = { accessToken: null, expiresAt: null, user: null, status: "unauthenticated" };
    emit();
  },
};

export function getAdminAccessToken(): string | null {
  return state.accessToken;
}
