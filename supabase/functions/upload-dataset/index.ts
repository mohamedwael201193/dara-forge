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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { 
      project_id, 
      name, 
      description, 
      file_type, 
      file_size, 
      storage_hash,
      metadata 
    } = await req.json()

    // Validate required fields
    if (!project_id || !name || !file_type || !storage_hash) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has access to the project
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select(`
        id, 
        owner_id,
        project_collaborations!inner(user_id, role, accepted_at)
      `)
      .eq('id', project_id)
      .or(`owner_id.eq.${user.id},project_collaborations.user_id.eq.${user.id}`)
      .single()

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the dataset record
    const { data: dataset, error: datasetError } = await supabaseClient
      .from('datasets')
      .insert({
        project_id,
        name,
        description,
        file_type,
        file_size,
        storage_hash,
        metadata,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (datasetError) {
      console.error('Dataset creation error:', datasetError)
      return new Response(
        JSON.stringify({ error: 'Failed to create dataset record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the activity
    await supabaseClient
      .from('activity_logs')
      .insert({
        user_id: user.id,
        project_id,
        action: 'dataset_uploaded',
        details: { 
          dataset_id: dataset.id, 
          name, 
          file_type, 
          file_size,
          storage_hash 
        }
      })

    // Simulate 0G Storage integration
    const mockStorageResponse = {
      hash: storage_hash,
      size: file_size,
      url: `https://0g-storage.network/${storage_hash}`,
      replicas: 3,
      availability: 99.9
    }

    return new Response(
      JSON.stringify({ 
        dataset,
        storage: mockStorageResponse
      }),
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