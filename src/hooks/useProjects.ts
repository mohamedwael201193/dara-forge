import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  research_field?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  is_public: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    full_name: string;
    institution?: string;
  };
  datasets?: Array<{
    id: string;
    name: string;
    file_type: string;
    created_at: string;
  }>;
  computations?: Array<{
    id: string;
    status: string;
    created_at: string;
  }>;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey(full_name, institution),
          datasets(id, name, file_type, created_at),
          computations(id, status, created_at)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    title: string;
    description?: string;
    research_field?: string;
    is_public?: boolean;
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive"
      });
      return null;
    }

    try {
      const response = await fetch('/functions/v1/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project');
      }

      toast({
        title: "Success!",
        description: "Project created successfully",
      });

      await fetchProjects(); // Refresh the list
      return result.project;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Project updated successfully",
      });

      await fetchProjects(); // Refresh the list
      return data;
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Project deleted successfully",
      });

      await fetchProjects(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive"
      });
      return false;
    }
  };

  const getProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey(full_name, institution, avatar_url),
          datasets(*),
          computations(*),
          project_collaborations(
            id,
            role,
            accepted_at,
            profiles!project_collaborations_user_id_fkey(full_name, institution, avatar_url)
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
  };
};