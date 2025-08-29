import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Brain, TrendingUp, BarChart3, Lightbulb, Zap, Eye, Target, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: Date;
  data?: any;
}

interface AIInsightsDashboardProps {
  datasetId?: number;
  analysisResults?: any;
  computeJobId?: string;
  inftId?: string;
}

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  datasetId,
  analysisResults,
  computeJobId,
  inftId
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'anomaly': return <Eye className="w-4 h-4" />;
      case 'prediction': return <Target className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'pattern': return <BarChart3 className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'text-blue-400';
      case 'anomaly': return 'text-red-400';
      case 'prediction': return 'text-purple-400';
      case 'recommendation': return 'text-green-400';
      case 'pattern': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getImpactBadge = (impact: string) => {
    const impactConfig = {
      high: { color: 'bg-red-500/20 text-red-300 border-red-500/30', text: 'High Impact' },
      medium: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', text: 'Medium Impact' },
      low: { color: 'bg-green-500/20 text-green-300 border-green-500/30', text: 'Low Impact' }
    };

    const config = impactConfig[impact as keyof typeof impactConfig];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const generateAIInsights = async () => {
    setIsGenerating(true);
    
    // Simulate AI insight generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'trend',
        title: 'Upward Data Trend Detected',
        description: 'Analysis reveals a consistent 15% monthly growth pattern in the primary metrics over the last 6 months.',
        confidence: 0.92,
        impact: 'high',
        category: 'Growth Analysis',
        timestamp: new Date(),
        data: { growthRate: 15, period: '6 months', confidence: 0.92 }
      },
      {
        id: '2',
        type: 'anomaly',
        title: 'Data Quality Anomaly',
        description: 'Detected 3.2% of data points showing unusual patterns that may require attention or cleaning.',
        confidence: 0.87,
        impact: 'medium',
        category: 'Data Quality',
        timestamp: new Date(),
        data: { anomalyRate: 3.2, affectedRecords: 156, totalRecords: 4875 }
      },
      {
        id: '3',
        type: 'prediction',
        title: 'Future Performance Forecast',
        description: 'Based on current trends, expect 22% improvement in key metrics over the next quarter.',
        confidence: 0.84,
        impact: 'high',
        category: 'Forecasting',
        timestamp: new Date(),
        data: { predictedImprovement: 22, timeframe: 'next quarter', factors: ['seasonal', 'growth', 'optimization'] }
      },
      {
        id: '4',
        type: 'recommendation',
        title: 'Optimization Opportunity',
        description: 'Implementing data preprocessing improvements could increase analysis accuracy by up to 18%.',
        confidence: 0.79,
        impact: 'medium',
        category: 'Optimization',
        timestamp: new Date(),
        data: { potentialImprovement: 18, effort: 'medium', timeline: '2-3 weeks' }
      },
      {
        id: '5',
        type: 'pattern',
        title: 'Seasonal Pattern Recognition',
        description: 'Strong seasonal correlation identified with 89% accuracy in predicting quarterly variations.',
        confidence: 0.89,
        impact: 'high',
        category: 'Pattern Analysis',
        timestamp: new Date(),
        data: { seasonalAccuracy: 89, pattern: 'quarterly', strength: 'strong' }
      }
    ];

    setInsights(mockInsights);
    setIsGenerating(false);
  };

  const refreshInsights = () => {
    generateAIInsights();
  };

  useEffect(() => {
    if (datasetId || analysisResults) {
      generateAIInsights();
    }
  }, [datasetId, analysisResults]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        generateAIInsights();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-700/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white">AI Insights Dashboard</CardTitle>
                <CardDescription className="text-purple-200">
                  Intelligent analysis and recommendations powered by 0G AI
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="outline"
                size="sm"
                className={`border-purple-500/30 ${autoRefresh ? 'bg-purple-500/20 text-purple-300' : 'text-purple-300'} hover:bg-purple-500/30`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
              
              <Button
                onClick={refreshInsights}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Insights Grid */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-slate-600 transition-colors cursor-pointer"
              onClick={() => setSelectedInsight(insight)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`${getInsightColor(insight.type)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <span className="text-sm text-slate-400">{insight.category}</span>
                  </div>
                  {getImpactBadge(insight.impact)}
                </div>
                <CardTitle className="text-white text-lg">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-300 text-sm">{insight.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Confidence</span>
                    <span className="text-slate-300">{Math.round(insight.confidence * 100)}%</span>
                  </div>
                  <Progress 
                    value={insight.confidence * 100} 
                    className="h-2 bg-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{insight.timestamp.toLocaleTimeString()}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Insight View */}
      {selectedInsight && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-slate-700 rounded-lg ${getInsightColor(selectedInsight.type)}`}>
                  {getInsightIcon(selectedInsight.type)}
                </div>
                <div>
                  <CardTitle className="text-white">{selectedInsight.title}</CardTitle>
                  <CardDescription className="text-slate-300">
                    {selectedInsight.category} • {Math.round(selectedInsight.confidence * 100)}% confidence
                  </CardDescription>
                </div>
              </div>
              
              <Button
                onClick={() => setSelectedInsight(null)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">{selectedInsight.description}</p>
            
            {selectedInsight.data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(selectedInsight.data).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-sm text-slate-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {typeof value === 'number' ? 
                        (key.includes('Rate') || key.includes('Improvement') || key.includes('Accuracy') ? 
                          `${value}%` : value) : 
                        Array.isArray(value) ? value.join(', ') : 
                        String(value)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedInsight.type === 'recommendation' && (
              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-green-300">Recommended Actions</span>
                </div>
                <ul className="space-y-1 text-sm text-green-200">
                  <li>• Review and implement suggested data preprocessing improvements</li>
                  <li>• Monitor implementation progress over the recommended timeline</li>
                  <li>• Measure accuracy improvements after implementation</li>
                  <li>• Consider scaling successful optimizations to other datasets</li>
                </ul>
              </div>
            )}

            {selectedInsight.type === 'prediction' && (
              <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-purple-300">Prediction Details</span>
                </div>
                <div className="text-sm text-purple-200">
                  This forecast is based on historical data patterns and current trends. 
                  Monitor actual performance against predictions to validate model accuracy.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {insights.length === 0 && !isGenerating && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">No AI Insights Available</h3>
              <p className="text-slate-300 mb-4">
                Upload and analyze a dataset to generate intelligent insights and recommendations.
              </p>
              <Button
                onClick={generateAIInsights}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Sample Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isGenerating && insights.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Generating AI Insights</h3>
              <p className="text-slate-300">
                Our AI is analyzing your data to provide intelligent insights and recommendations...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

