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

    const { project_id, dataset_id, model_id, parameters } = await req.json()

    // Validate required fields
    if (!project_id || !dataset_id || !model_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify access to project and dataset
    const { data: dataset, error: datasetError } = await supabaseClient
      .from('datasets')
      .select(`
        id,
        name,
        file_type,
        storage_hash,
        projects!inner(
          id,
          owner_id,
          project_collaborations(user_id, role, accepted_at)
        )
      `)
      .eq('id', dataset_id)
      .eq('project_id', project_id)
      .single()

    if (datasetError || !dataset) {
      return new Response(
        JSON.stringify({ error: 'Dataset not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get AI model details
    const { data: model, error: modelError } = await supabaseClient
      .from('ai_models')
      .select('*')
      .eq('id', model_id)
      .single()

    if (modelError || !model) {
      return new Response(
        JSON.stringify({ error: 'AI model not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create computation record
    const { data: computation, error: computationError } = await supabaseClient
      .from('computations')
      .insert({
        project_id,
        dataset_id,
        model_id,
        status: 'pending',
        started_by: user.id,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (computationError) {
      console.error('Computation creation error:', computationError)
      return new Response(
        JSON.stringify({ error: 'Failed to create computation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Simulate 0G Compute execution
    const mockExecution = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing time
      
      // Update computation to running
      await supabaseClient
        .from('computations')
        .update({ status: 'running' })
        .eq('id', computation.id)

      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate execution time

      // Generate mock results based on model type
      const mockResults = generateMockResults(model.model_type, dataset.name)
      const mockHashes = {
        compute_hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        verification_hash: `0x${Math.random().toString(16).substr(2, 40)}`
      }

      // Update computation with results
      await supabaseClient
        .from('computations')
        .update({
          status: 'completed',
          results: mockResults,
          compute_hash: mockHashes.compute_hash,
          verification_hash: mockHashes.verification_hash,
          gas_used: Math.random() * 0.01,
          compute_time: Math.random() * 5 + 1,
          completed_at: new Date().toISOString()
        })
        .eq('id', computation.id)

      // Log the activity
      await supabaseClient
        .from('activity_logs')
        .insert({
          user_id: user.id,
          project_id,
          action: 'computation_completed',
          details: {
            computation_id: computation.id,
            model_name: model.name,
            dataset_name: dataset.name,
            results: mockResults
          }
        })
    }

    // Start async execution
    mockExecution().catch(console.error)

    return new Response(
      JSON.stringify({ 
        computation_id: computation.id,
        status: 'initiated',
        message: 'Computation started on 0G Network'
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

function generateMockResults(modelType: string, datasetName: string) {
  const baseResults = {
    timestamp: new Date().toISOString(),
    dataset: datasetName,
    model_type: modelType
  }

  switch (modelType) {
    case 'neural_network':
      return {
        ...baseResults,
        patterns_found: Math.floor(Math.random() * 100) + 20,
        accuracy: (Math.random() * 0.3 + 0.7).toFixed(3),
        loss: (Math.random() * 0.5).toFixed(4),
        epochs: Math.floor(Math.random() * 50) + 10
      }
    
    case 'deep_learning':
      return {
        ...baseResults,
        classification_accuracy: (Math.random() * 0.25 + 0.75).toFixed(3),
        feature_importance: Array.from({length: 5}, () => Math.random().toFixed(3)),
        confidence_scores: Array.from({length: 10}, () => Math.random().toFixed(3))
      }
    
    case 'regression':
      return {
        ...baseResults,
        r_squared: (Math.random() * 0.4 + 0.6).toFixed(3),
        mse: (Math.random() * 0.1).toFixed(4),
        coefficients: Array.from({length: 3}, () => (Math.random() * 2 - 1).toFixed(3))
      }
    
    default:
      return {
        ...baseResults,
        status: 'completed',
        score: (Math.random() * 0.5 + 0.5).toFixed(3)
      }
  }
}