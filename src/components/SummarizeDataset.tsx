import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import { useZgCompute } from '@/hooks/useZgCompute'
import React, { useState } from 'react'

import { AlertCircle, CheckCircle, Loader2, MessageSquareText, Wallet } from "@/lib/icons"

interface SummarizeDatasetProps {
  // Add any necessary props here, e.g., walletAuth if needed for future features
}

export const SummarizeDataset: React.FC<SummarizeDatasetProps> = () => {
  const [inputText, setInputText] = useState('')
  const { health, account, analysis, services } = useZgCompute()

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      return
    }

    try {
      await analysis.runAnalysis({
        text: `Please provide a clear, concise summary of the following text:\n\n${inputText}`,
        model: 'deepseek'
      })
    } catch (err) {
      console.error('Summarization failed:', err)
    }
  }

  const handleAddCredit = async () => {
    try {
      await account.addCredit('0.1') // Add 0.1 OG credits
    } catch (err) {
      console.error('Failed to add credit:', err)
    }
  }

  const renderHealthStatus = () => {
    if (health.loading) {
      return (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Checking 0G Compute status...</span>
        </div>
      )
    }

    if (health.error || !health.isHealthy) {
      return (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-red-50 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            0G Compute is not available: {health.error || 'Service unhealthy'}
          </span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50 text-green-700">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">
          0G Compute is ready • {services.serviceCount} services available
        </span>
      </div>
    )
  }

  const renderAccountStatus = () => {
    if (account.loading) {
      return <div className="text-sm text-muted-foreground">Loading account...</div>
    }

    if (account.error) {
      return <div className="text-sm text-red-500">Account error: {account.error}</div>
    }

    if (!account.account) {
      return <div className="text-sm text-muted-foreground">No account information</div>
    }

    const hasBalance = account.hasBalance
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          <span className="text-sm">
            Balance: {account.account.availableFormatted} OG
          </span>
        </div>
        {!hasBalance && (
          <Button 
            size="sm" 
            onClick={handleAddCredit}
            disabled={account.loading}
          >
            {account.loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Add Credit'
            )}
          </Button>
        )}
      </div>
    )
  }

  const canSummarize = health.isHealthy && account.hasBalance && !analysis.loading && inputText.trim()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="w-6 h-6" />
          Summarize Dataset with 0G Compute
        </CardTitle>
        <CardDescription>
          Leverage 0G Compute to get AI-powered summaries of your dataset descriptions or any text.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Status */}
        {renderHealthStatus()}
        
        {/* Account Status */}
        {renderAccountStatus()}

        <div>
          <Label htmlFor="inputText">Text to Summarize</Label>
          <Textarea
            id="inputText"
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
            placeholder="Paste your dataset description or any text here..."
            rows={8}
            disabled={analysis.loading}
          />
        </div>
        
        <Button 
          onClick={handleSummarize} 
          disabled={!canSummarize} 
          className="w-full"
        >
          {analysis.loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing with 0G Compute...
            </>
          ) : (
            'Summarize'
          )}
        </Button>
        
        {analysis.error && (
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-red-50 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{analysis.error}</span>
          </div>
        )}
        
        {analysis.result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">AI Summary:</h3>
              {analysis.result.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="p-4 border rounded-lg bg-muted whitespace-pre-wrap">
              {analysis.result.content}
            </div>
            <div className="text-xs text-muted-foreground">
              Model: {analysis.result.model} • Provider: {analysis.result.provider} • {analysis.result.timestamp}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

