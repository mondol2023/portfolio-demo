import { Link } from "react-router-dom";
import { Reveal } from "@/components/animations/Reveal";
import { Card } from "@/components/ui";
import { useAdminAuth } from "@/hooks/useAdminAuth";

/** Landing view for `/admin` — every CMS/analytics section referenced below is real as of Phase 10/11. */
export function AdminDashboardPage() {
  const { user } = useAdminAuth();

  return (
    <Reveal className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-base-50">Welcome back{user ? `, ${user.email}` : ""}</h1>
        <p className="mt-1 text-sm text-base-400">Manage your portfolio's content and review visitor activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/projects">
          <Card interactive>
            <p className="text-sm text-base-400">Content</p>
            <p className="mt-2 text-sm text-base-300">Manage projects, blog posts, skills, and experience.</p>
          </Card>
        </Link>
        <Link to="/admin/analytics">
          <Card interactive>
            <p className="text-sm text-base-400">Analytics</p>
            <p className="mt-2 text-sm text-base-300">
              Review visitor traffic, device/geo breakdowns, and per-session timelines.
            </p>
          </Card>
        </Link>
        <Link to="/admin/audit-log">
          <Card interactive>
            <p className="text-sm text-base-400">Audit log</p>
            <p className="mt-2 text-sm text-base-300">Every admin sign-in and content change, most recent first.</p>
          </Card>
        </Link>
      </div>
    </Reveal>
  );
}
