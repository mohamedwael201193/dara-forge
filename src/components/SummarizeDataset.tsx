import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import React, { useState } from 'react'


import { Loader2, MessageSquareText } from "@/lib/icons"


interface SummarizeDatasetProps {
  // Add any necessary props here, e.g., walletAuth if needed for future features
}

export const SummarizeDataset: React.FC<SummarizeDatasetProps> = () => {
  const [inputText, setInputText] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to summarize.')
      return
    }

    setLoading(true)
    setError('')
    setSummary('')

    try {
      const response = await fetch('/api/compute?action=chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
            { role: 'user', content: `Summarize the following text: ${inputText}` },
          ],
          modelHint: 'llama-3.3-70b-instruct', // Or other preferred model
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to get summary from 0G Compute.')
      }

      setSummary(data.response.choices[0].message.content)
    } catch (err: any) {
      console.error('Summarization failed:', err)
      setError(`Summarization failed: ${err.message || String(err)}`)
    } finally {
      setLoading(false)
    }
  }

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
        <div>
          <Label htmlFor="inputText">Text to Summarize</Label>
          <Textarea
            id="inputText"
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
            placeholder="Paste your dataset description or any text here..."
            rows={8}
            disabled={loading}
          />
        </div>
        <Button onClick={handleSummarize} disabled={loading || !inputText.trim()} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Summarizing...
            </>
          ) : (
            'Summarize'
          )}
        </Button>
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        {summary && (
          <div className="space-y-2">
            <h3 className="font-semibold">Summary:</h3>
            <div className="p-4 border rounded-lg bg-muted whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

