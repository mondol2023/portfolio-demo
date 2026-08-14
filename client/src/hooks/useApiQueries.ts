/**
 * TanStack Query hooks for the public read-only API. Every hook unwraps the
 * `{ data: T }` envelope the server returns so call sites work with plain
 * typed values. Query keys are namespaced per-entity so a future admin
 * mutation can call `queryClient.invalidateQueries({ queryKey: [...] })`
 * to refresh the public pages after a write.
 */
import { useQuery } from "@tanstack/react-query";
import type { ApiSuccess, Project, BlogPost, Skill, Experience, SiteContentMap } from "@portfolio/shared";
import { getJson } from "@/lib/api";

export const queryKeys = {
  projects: ["projects"] as const,
  project: (slug: string) => ["projects", slug] as const,
  blogPosts: ["blog-posts"] as const,
  blogPost: (slug: string) => ["blog-posts", slug] as const,
  skills: ["skills"] as const,
  experience: ["experience"] as const,
  siteContent: ["site-content"] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => (await getJson<ApiSuccess<Project[]>>("/api/projects")).data,
  });
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.project(slug ?? ""),
    queryFn: async () => (await getJson<ApiSuccess<Project>>(`/api/projects/${slug}`)).data,
    enabled: Boolean(slug),
    retry: false,
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: queryKeys.blogPosts,
    queryFn: async () => (await getJson<ApiSuccess<BlogPost[]>>("/api/blog")).data,
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.blogPost(slug ?? ""),
    queryFn: async () => (await getJson<ApiSuccess<BlogPost>>(`/api/blog/${slug}`)).data,
    enabled: Boolean(slug),
    retry: false,
  });
}

export function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: async () => (await getJson<ApiSuccess<Skill[]>>("/api/skills")).data,
  });
}

export function useExperience() {
  return useQuery({
    queryKey: queryKeys.experience,
    queryFn: async () => (await getJson<ApiSuccess<Experience[]>>("/api/experience")).data,
  });
}

export function useSiteContent() {
  return useQuery({
    queryKey: queryKeys.siteContent,
    queryFn: async () => (await getJson<ApiSuccess<SiteContentMap>>("/api/site-content")).data,
  });
}
