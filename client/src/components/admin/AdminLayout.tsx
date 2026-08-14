import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiBriefcase,
  FiEdit3,
  FiFileText,
  FiFolder,
  FiHome,
  FiList,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { cn } from "@/lib/cn";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/useToast";

const navItems: { to: string; label: string; icon: IconType; end?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: FiHome, end: true },
  { to: "/admin/analytics", label: "Analytics", icon: FiActivity },
  { to: "/admin/projects", label: "Projects", icon: FiFolder },
  { to: "/admin/blog", label: "Blog", icon: FiFileText },
  { to: "/admin/skills", label: "Skills", icon: FiEdit3 },
  { to: "/admin/experience", label: "Experience", icon: FiBriefcase },
  { to: "/admin/site-content", label: "Site content", icon: FiSettings },
  { to: "/admin/audit-log", label: "Audit log", icon: FiList },
];

/** Dashboard shell (sidebar + top bar) every authenticated `/admin/*` route renders into. */
export function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast({ title: "Signed out", tone: "info" });
    navigate("/admin/login", { replace: true });
  }

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMobileNavOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-hero/15 text-hero" : "text-base-300 hover:bg-base-800 hover:text-base-50"
            )
          }
        >
          <Icon aria-hidden="true" className="h-4.5 w-4.5 flex-shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-svh bg-base-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-base-800 bg-base-900/60 lg:flex">
        <div className="flex h-16 items-center px-5 text-base font-semibold text-base-50">Admin</div>
        {navLinks}
      </aside>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
          <aside className="relative flex h-full w-64 flex-col border-r border-base-800 bg-base-900">
            <div className="flex h-16 items-center justify-between px-5">
              <span className="text-base font-semibold text-base-50">Admin</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-base-400 hover:bg-base-800 hover:text-base-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            {navLinks}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-base-800 bg-base-900/60 px-4 backdrop-blur-sm sm:px-6">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-1.5 text-base-300 hover:bg-base-800 hover:text-base-100 lg:hidden"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <span className="hidden text-sm text-base-400 lg:block">Signed in as {user?.email}</span>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-base-300 transition-colors hover:bg-base-800 hover:text-base-50"
          >
            <FiLogOut aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
