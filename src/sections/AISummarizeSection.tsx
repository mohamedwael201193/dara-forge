import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { computeClient } from "@/services/computeClient";
import { AnimatePresence, motion } from 'framer-motion';
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
      // Submit analysis request
      const result = await computeClient.analyze({
        text: userText.trim() || undefined,
        root: datasetRoot || undefined,
        model: selectedModel,
        temperature: 0.2
      });

      if (!result.ok) {
        throw new Error(result.error || 'Analysis request failed');
      }

      // Start polling for results
      newJob.status = 'processing';
      setActiveJob({ ...newJob });

      let attempt = 0;
      intervalRef.current = setInterval(async () => {
        attempt++;
        const progress = Math.min(10 + attempt * 3, 90);
        
        setActiveJob(current => current ? { ...current, progress } : null);

        // Check for results
        const jobResult = await computeClient.getResult(result.jobId!);
        
        if (jobResult.ok && jobResult.content) {
          // Success!
          const completedJob = {
            ...newJob,
            status: 'complete' as const,
            result: jobResult,
            progress: 100
          };
          
          setActiveJob(completedJob);
          setJobHistory(prev => [completedJob, ...prev.slice(0, 4)]); // Keep last 5
          
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } else if (attempt > 30) {
          // Timeout
          throw new Error('Analysis timeout - please try again');
        }
      }, 2000);

    } catch (error) {
      const errorJob = {
        ...newJob,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
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
    <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            >
              <Brain size={32} />
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="text-yellow-500" size={24} />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI-Powered Dataset Analysis
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Leverage decentralized compute providers for verifiable AI analysis of your research datasets
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Choose AI Model</label>
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
                                <div className="text-xs text-gray-500">{model.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {datasetRoot && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                        <Database size={16} />
                        <span className="font-medium">Dataset Connected</span>
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-mono break-all">
                        {datasetRoot}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-3">Additional Context (Optional)</label>
                    <Textarea
                      value={userText}
                      onChange={(e) => setUserText(e.target.value)}
                      placeholder="Provide additional context or specific questions about your dataset..."
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!datasetRoot && !userText.trim() || activeJob?.status === 'processing'}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {activeJob?.status === 'processing' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  <AnimatePresence mode="wait">
                    {activeJob ? (
                      <motion.div
                        key={activeJob.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Analysis Progress</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearJob}
                            disabled={activeJob.status === 'processing'}
                          >
                            Clear
                          </Button>
                        </div>

                        <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-2 mb-3">
                            {activeJob.status === 'pending' && <Clock className="text-yellow-500" size={16} />}
                            {activeJob.status === 'processing' && <Loader2 className="text-blue-500 animate-spin" size={16} />}
                            {activeJob.status === 'complete' && <CheckCircle className="text-green-500" size={16} />}
                            {activeJob.status === 'error' && <AlertCircle className="text-red-500" size={16} />}
                            
                            <span className="font-medium capitalize">{activeJob.status}</span>
                            <Badge variant="outline">{activeJob.model}</Badge>
                          </div>

                          {activeJob.status === 'processing' && (
                            <div className="space-y-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <motion.div
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${activeJob.progress}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Processing with decentralized compute providers...
                              </div>
                            </div>
                          )}

                          {activeJob.status === 'complete' && activeJob.result && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <Shield size={14} />
                                <span className="text-sm">
                                  {activeJob.result.verified ? 'Verified Result' : 'Unverified'}
                                </span>
                              </div>
                              
                              <div className="p-3 bg-white dark:bg-gray-900 rounded border text-sm">
                                {activeJob.result.content}
                              </div>
                              
                              <div className="text-xs text-gray-500 space-y-1">
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
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-gray-500 dark:text-gray-400"
                      >
                        <Brain size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Start an analysis to see results here</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Job History */}
                  {jobHistory.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Recent Analyses</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {jobHistory.map(job => (
                          <div key={job.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="text-xs">{job.model}</Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(job.startTime).toLocaleTimeString()}
                              </span>
                            </div>
                            {job.status === 'complete' && job.result && (
                              <div className="text-gray-600 dark:text-gray-300 truncate">
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