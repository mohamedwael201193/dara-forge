import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for DDL
    )

    // Run the database setup SQL
    const setupSQL = `
      -- Enable necessary extensions
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- Create custom types
      DO $$ BEGIN
        CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE computation_status AS ENUM ('pending', 'running', 'completed', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE collaboration_role AS ENUM ('owner', 'collaborator', 'viewer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- User profiles table
      CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
          email TEXT NOT NULL,
          full_name TEXT NOT NULL,
          institution TEXT,
          research_field TEXT,
          bio TEXT,
          avatar_url TEXT,
          wallet_address TEXT UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Research projects table
      CREATE TABLE IF NOT EXISTS projects (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          research_field TEXT,
          status project_status DEFAULT 'draft',
          is_public BOOLEAN DEFAULT false,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Datasets table
      CREATE TABLE IF NOT EXISTS datasets (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          file_type TEXT NOT NULL,
          file_size BIGINT,
          storage_hash TEXT NOT NULL,
          metadata JSONB,
          uploaded_by UUID REFERENCES profiles(id) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- AI models table
      CREATE TABLE IF NOT EXISTS ai_models (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          model_type TEXT NOT NULL,
          version TEXT DEFAULT '1.0',
          parameters JSONB,
          is_public BOOLEAN DEFAULT true,
          created_by UUID REFERENCES profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Computations table
      CREATE TABLE IF NOT EXISTS computations (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
          dataset_id UUID REFERENCES datasets(id) NOT NULL,
          model_id UUID REFERENCES ai_models(id) NOT NULL,
          status computation_status DEFAULT 'pending',
          compute_hash TEXT,
          verification_hash TEXT,
          results JSONB,
          gas_used DECIMAL,
          compute_time DECIMAL,
          started_by UUID REFERENCES profiles(id) NOT NULL,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE
      );

      -- Insert default AI models if they don't exist
      INSERT INTO ai_models (name, description, model_type, parameters) 
      SELECT * FROM (VALUES
        ('Neural Network Classifier', 'General purpose neural network for pattern recognition', 'neural_network', '{"layers": [128, 64, 32], "activation": "relu", "optimizer": "adam"}'::jsonb),
        ('Deep Learning Analyzer', 'Advanced deep learning model for complex data analysis', 'deep_learning', '{"architecture": "transformer", "attention_heads": 8, "hidden_size": 512}'::jsonb),
        ('Statistical Regression', 'Traditional statistical regression analysis', 'regression', '{"method": "linear", "regularization": "l2", "alpha": 0.01}'::jsonb)
      ) AS v(name, description, model_type, parameters)
      WHERE NOT EXISTS (SELECT 1 FROM ai_models);

      -- Enable RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
      ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
      ALTER TABLE computations ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
      CREATE POLICY "Users can view their own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
      CREATE POLICY "Users can update their own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
      CREATE POLICY "Users can insert their own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);

      DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
      CREATE POLICY "Public profiles are viewable" ON profiles
          FOR SELECT USING (true);

      -- Projects policies
      DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
      CREATE POLICY "Users can view accessible projects" ON projects
          FOR SELECT USING (owner_id = auth.uid() OR is_public = true);

      DROP POLICY IF EXISTS "Users can create projects" ON projects;
      CREATE POLICY "Users can create projects" ON projects
          FOR INSERT WITH CHECK (owner_id = auth.uid());

      DROP POLICY IF EXISTS "Project owners can update their projects" ON projects;
      CREATE POLICY "Project owners can update their projects" ON projects
          FOR UPDATE USING (owner_id = auth.uid());

      DROP POLICY IF EXISTS "Project owners can delete their projects" ON projects;
      CREATE POLICY "Project owners can delete their projects" ON projects
          FOR DELETE USING (owner_id = auth.uid());

      -- AI Models policies
      DROP POLICY IF EXISTS "Anyone can view public AI models" ON ai_models;
      CREATE POLICY "Anyone can view public AI models" ON ai_models
          FOR SELECT USING (is_public = true);

      DROP POLICY IF EXISTS "Users can create AI models" ON ai_models;
      CREATE POLICY "Users can create AI models" ON ai_models
          FOR INSERT WITH CHECK (created_by = auth.uid());
    `;

    const { error } = await supabaseClient.rpc('exec_sql', { sql: setupSQL });

    if (error) {
      console.error('Database setup error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to setup database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Database setup completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})