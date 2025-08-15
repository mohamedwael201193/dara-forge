export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          institution: string | null;
          research_field: string | null;
          bio: string | null;
          avatar_url: string | null;
          wallet_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          institution?: string | null;
          research_field?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          wallet_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          institution?: string | null;
          research_field?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          wallet_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          research_field: string | null;
          status: 'draft' | 'active' | 'completed' | 'archived';
          is_public: boolean;
          metadata: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          research_field?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'archived';
          is_public?: boolean;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          research_field?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'archived';
          is_public?: boolean;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      datasets: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          file_type: string;
          file_size: number | null;
          storage_hash: string;
          metadata: any | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          file_type: string;
          file_size?: number | null;
          storage_hash: string;
          metadata?: any | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          file_type?: string;
          file_size?: number | null;
          storage_hash?: string;
          metadata?: any | null;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      ai_models: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          model_type: string;
          version: string;
          parameters: any | null;
          is_public: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          model_type: string;
          version?: string;
          parameters?: any | null;
          is_public?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          model_type?: string;
          version?: string;
          parameters?: any | null;
          is_public?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      computations: {
        Row: {
          id: string;
          project_id: string;
          dataset_id: string;
          model_id: string;
          status: 'pending' | 'running' | 'completed' | 'failed';
          compute_hash: string | null;
          verification_hash: string | null;
          results: any | null;
          gas_used: number | null;
          compute_time: number | null;
          started_by: string;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          dataset_id: string;
          model_id: string;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          compute_hash?: string | null;
          verification_hash?: string | null;
          results?: any | null;
          gas_used?: number | null;
          compute_time?: number | null;
          started_by: string;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          dataset_id?: string;
          model_id?: string;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          compute_hash?: string | null;
          verification_hash?: string | null;
          results?: any | null;
          gas_used?: number | null;
          compute_time?: number | null;
          started_by?: string;
          started_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}