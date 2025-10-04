import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Brain, CheckCircle, Clock, Cpu, Database, Loader2, Shield, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';

interface AISummarizeSectionProps {
  datasetRoot?: string | null;
}

interface AnalysisJob {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  model: string;
  result?: any;
  error?: string;
  startTime: number;
  progress: number;
}

const models = [
  { id: 'llama-3.3-70b-instruct', name: 'Llama 3.3 70B', description: 'Fast and efficient' },
  { id: 'deepseek-r1-70b', name: 'DeepSeek R1 70B', description: 'Advanced reasoning' }
];

export function AISummarizeSection({ datasetRoot }: AISummarizeSectionProps) {
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [userText, setUserText] = useState('');
  const [activeJob, setActiveJob] = useState<AnalysisJob | null>(null);
  const [jobHistory, setJobHistory] = useState<AnalysisJob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  const handleSubmit = async () => {
    if (!userText.trim() && !datasetRoot) return;

    const newJob: AnalysisJob = {
      id: `job_${Date.now()}`,
      status: 'pending',
      model: selectedModel,
      startTime: Date.now(),
      progress: 0
    };

    setActiveJob(newJob);

    try {
      // Update job status to processing
      const processingJob = { ...newJob, status: 'processing' as const, progress: 10 };
      setActiveJob(processingJob);

      // Prepare prompt for 0G Compute
      let prompt = '';
      if (datasetRoot && userText.trim()) {
        prompt = `Please analyze the dataset at ${datasetRoot} with the following context: ${userText}`;
      } else if (datasetRoot) {
        prompt = `Please analyze the dataset structure and contents at ${datasetRoot}. Provide insights about data quality, patterns, and potential research applications.`;
      } else {
        prompt = userText;
      }

      // Update progress
      setActiveJob(prev => prev ? { ...prev, progress: 25 } : null);

      // Call 0G Compute API
      const response = await fetch('/api/compute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'summarize'
        }),
      });

      // Update progress
      setActiveJob(prev => prev ? { ...prev, progress: 50 } : null);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Analysis failed');
      }

      // Update progress
      setActiveJob(prev => prev ? { ...prev, progress: 85 } : null);

      // Complete the job with results
      const completeJob: AnalysisJob = {
        ...newJob,
        status: 'complete',
        progress: 100,
        result: {
          content: data.response,
          verified: data.metadata?.verified || true,
          provider: data.metadata?.model || selectedModel,
          requestId: data.requestId,
          timestamp: data.metadata?.timestamp || new Date().toISOString()
        }
      };

      setActiveJob(completeJob);
      setJobHistory(prev => [completeJob, ...prev.slice(0, 4)]);

    } catch (error) {
      const errorJob = {
        ...newJob,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        progress: 0
      };
      setActiveJob(errorJob);
      setJobHistory(prev => [errorJob, ...prev.slice(0, 4)]);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const clearJob = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setActiveJob(null);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <Brain size={24} />
            </div>
            <Sparkles className="text-emerald-500" size={20} />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
            AI-Powered Dataset Analysis
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Leverage verifiable compute for intelligent analysis of your research data
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                      AI Model
                    </label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <Cpu size={16} />
                              <div>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs text-slate-500">{model.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {datasetRoot && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
                        <Database size={16} />
                        <span className="font-medium">Dataset Connected</span>
                      </div>
                      <div className="text-sm text-emerald-600 dark:text-emerald-400 font-mono break-all">
                        {datasetRoot}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                      Analysis Context (Optional)
                    </label>
                    <Textarea
                      value={userText}
                      onChange={(e) => setUserText(e.target.value)}
                      placeholder="Describe what you'd like to learn about this dataset..."
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!datasetRoot && !userText.trim() || activeJob?.status === 'processing'}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {activeJob?.status === 'processing' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  {activeJob ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Analysis Progress</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearJob}
                          disabled={activeJob.status === 'processing'}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          Clear
                        </Button>
                      </div>

                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          {activeJob.status === 'pending' && <Clock className="text-amber-500" size={16} />}
                          {activeJob.status === 'processing' && <Loader2 className="text-emerald-500 animate-spin" size={16} />}
                          {activeJob.status === 'complete' && <CheckCircle className="text-emerald-500" size={16} />}
                          {activeJob.status === 'error' && <AlertCircle className="text-red-500" size={16} />}
                          
                          <span className="font-medium capitalize text-slate-700 dark:text-slate-300">
                            {activeJob.status}
                          </span>
                          <Badge variant="outline">{activeJob.model}</Badge>
                        </div>

                        {activeJob.status === 'processing' && (
                          <div className="space-y-2">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${activeJob.progress}%` }}
                              />
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Processing with verifiable compute...
                            </div>
                          </div>
                        )}

                        {activeJob.status === 'complete' && activeJob.result && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <Shield size={14} />
                              <span className="text-sm">
                                {activeJob.result.verified ? 'Verified Result' : 'Unverified'}
                              </span>
                            </div>
                            
                            <div className="p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
                              {activeJob.result.content}
                            </div>
                            
                            <div className="text-xs text-slate-500 space-y-1">
                              <div>Provider: {activeJob.result.provider}</div>
                              <div>Duration: {Math.round((Date.now() - activeJob.startTime) / 1000)}s</div>
                            </div>
                          </div>
                        )}

                        {activeJob.status === 'error' && (
                          <div className="text-red-600 dark:text-red-400 text-sm">
                            {activeJob.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <Brain size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Start an analysis to see results</p>
                    </div>
                  )}

                  {/* Job History */}
                  {jobHistory.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Recent Analyses</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {jobHistory.map(job => (
                          <div key={job.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded text-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="text-xs">{job.model}</Badge>
                              <span className="text-xs text-slate-500">
                                {new Date(job.startTime).toLocaleTimeString()}
                              </span>
                            </div>
                            {job.status === 'complete' && job.result && (
                              <div className="text-slate-600 dark:text-slate-300 truncate">
                                {job.result.content?.slice(0, 100)}...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}