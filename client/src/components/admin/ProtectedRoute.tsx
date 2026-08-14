import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminAuthStore } from "@/lib/adminAuthStore";
import { adminRefresh } from "@/lib/adminApi";

/**
 * Gate for every `/admin/*` route except `/admin/login`. On first mount
 * (fresh page load, no in-memory access token yet) it silently attempts a
 * `/refresh` using the httpOnly cookie before deciding whether to redirect —
 * so a reload doesn't bounce an already-signed-in admin back to the login
 * screen.
 */
export function ProtectedRoute() {
  const { status } = useAdminAuth();
  const location = useLocation();

  useEffect(() => {
    if (status === "idle") {
      adminAuthStore.setLoading();
      void adminRefresh();
    }
  }, [status]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-base-950">
        <span
          role="status"
          aria-label="Checking session"
          className="h-8 w-8 animate-spin rounded-full border-2 border-hero border-t-transparent"
        />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
