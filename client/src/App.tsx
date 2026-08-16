import { Route, Routes } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminVisitorSessionPage } from "@/pages/admin/AdminVisitorSessionPage";
import { AdminProjectsListPage } from "@/pages/admin/AdminProjectsListPage";
import { AdminProjectFormPage } from "@/pages/admin/AdminProjectFormPage";
import { AdminBlogListPage } from "@/pages/admin/AdminBlogListPage";
import { AdminBlogFormPage } from "@/pages/admin/AdminBlogFormPage";
import { AdminSkillsPage } from "@/pages/admin/AdminSkillsPage";
import { AdminExperiencePage } from "@/pages/admin/AdminExperiencePage";
import { AdminSiteContentPage } from "@/pages/admin/AdminSiteContentPage";
import { AdminAuditLogPage } from "@/pages/admin/AdminAuditLogPage";
import { HomePage } from "@/pages/HomePage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { BlogPage } from "@/pages/BlogPage";
import { BlogDetailPage } from "@/pages/BlogDetailPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

/**
 * Admin CRUD (projects/blog/skills/experience/site-content/audit-log) is
 * real as of Phase 10, and the analytics dashboard + session-timeline routes
 * are real as of Phase 11 — every `/admin/*` route now renders its actual page.
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
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/analytics/:sessionId" element={<AdminVisitorSessionPage />} />
          <Route path="/admin/projects" element={<AdminProjectsListPage />} />
          <Route path="/admin/projects/new" element={<AdminProjectFormPage />} />
          <Route path="/admin/projects/:id/edit" element={<AdminProjectFormPage />} />
          <Route path="/admin/blog" element={<AdminBlogListPage />} />
          <Route path="/admin/blog/new" element={<AdminBlogFormPage />} />
          <Route path="/admin/blog/:id/edit" element={<AdminBlogFormPage />} />
          <Route path="/admin/skills" element={<AdminSkillsPage />} />
          <Route path="/admin/experience" element={<AdminExperiencePage />} />
          <Route path="/admin/site-content" element={<AdminSiteContentPage />} />
          <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
