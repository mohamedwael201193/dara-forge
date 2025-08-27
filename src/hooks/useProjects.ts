// src/hooks/useProjects.ts
export type Project = { id: string; title: string; owner?: string };
export function useProjects() {
  return { data: [] as Project[], isLoading: false, error: null as any };
}

