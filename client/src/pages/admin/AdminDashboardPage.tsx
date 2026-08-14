import { Reveal } from "@/components/animations/Reveal";
import { Card } from "@/components/ui";
import { useAdminAuth } from "@/hooks/useAdminAuth";

/**
 * Landing view for `/admin`. Overview widgets (content counts, recent
 * visitors, recent audit activity) land alongside the CMS/analytics work in
 * Phases 10–11 — this establishes the shell they'll plug into.
 */
export function AdminDashboardPage() {
  const { user } = useAdminAuth();

  return (
    <Reveal className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-base-50">Welcome back{user ? `, ${user.email}` : ""}</h1>
        <p className="mt-1 text-sm text-base-400">Manage your portfolio's content and review visitor activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-base-400">Content</p>
          <p className="mt-2 text-sm text-base-300">
            Projects, blog posts, skills, and experience CRUD are coming in the next build phase.
          </p>
        </Card>
        <Card>
          <p className="text-sm text-base-400">Analytics</p>
          <p className="mt-2 text-sm text-base-300">
            Visitor tracking, device/geo breakdowns, and session timelines land shortly after.
          </p>
        </Card>
        <Card>
          <p className="text-sm text-base-400">Audit log</p>
          <p className="mt-2 text-sm text-base-300">Every admin sign-in and content change is already being recorded.</p>
        </Card>
      </div>
    </Reveal>
  );
}
