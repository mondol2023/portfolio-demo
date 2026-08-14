import { Route, Routes } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { RouteStub } from "@/components/RouteStub";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { HomePage } from "@/pages/HomePage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { BlogPage } from "@/pages/BlogPage";
import { BlogDetailPage } from "@/pages/BlogDetailPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

/**
 * Admin CRUD/analytics pages still render the shared `RouteStub` inline —
 * real implementations land in Phases 10–11. Auth (login + protected route
 * gate) and the dashboard shell itself are real as of Phase 9.
 */
function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route
            path="/admin/analytics"
            element={<RouteStub title="Analytics" description="Visitor analytics dashboard lands in Phase 11." />}
          />
          <Route
            path="/admin/analytics/:sessionId"
            element={<RouteStub title="Visitor Session" description="Per-session timeline lands in Phase 11." />}
          />
          <Route
            path="/admin/projects"
            element={<RouteStub title="Manage Projects" description="Projects CRUD lands in Phase 10." />}
          />
          <Route
            path="/admin/projects/new"
            element={<RouteStub title="New Project" description="Projects CRUD lands in Phase 10." />}
          />
          <Route
            path="/admin/projects/:id/edit"
            element={<RouteStub title="Edit Project" description="Projects CRUD lands in Phase 10." />}
          />
          <Route
            path="/admin/blog"
            element={<RouteStub title="Manage Blog" description="Blog CRUD + Tiptap editor lands in Phase 10." />}
          />
          <Route
            path="/admin/blog/new"
            element={<RouteStub title="New Post" description="Blog CRUD + Tiptap editor lands in Phase 10." />}
          />
          <Route
            path="/admin/blog/:id/edit"
            element={<RouteStub title="Edit Post" description="Blog CRUD + Tiptap editor lands in Phase 10." />}
          />
          <Route
            path="/admin/skills"
            element={<RouteStub title="Manage Skills" description="Skills CRUD lands in Phase 10." />}
          />
          <Route
            path="/admin/experience"
            element={<RouteStub title="Manage Experience" description="Experience CRUD lands in Phase 10." />}
          />
          <Route
            path="/admin/site-content"
            element={<RouteStub title="Site Content" description="Site-content editing lands in Phase 10." />}
          />
          <Route
            path="/admin/audit-log"
            element={<RouteStub title="Audit Log" description="Audit log viewer lands in Phase 10." />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
