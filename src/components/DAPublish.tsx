import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Send } from 'lucide-react'

interface DAPublishProps {
  // Add any necessary props here
}

export const DAPublish: React.FC<DAPublishProps> = () => {
  const [rootHash, setRootHash] = useState('')
  const [metadata, setMetadata] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePublish = async () => {
    if (!rootHash.trim()) {
      setError('Please enter a root hash.')
      return
    }

    setLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('/api/da/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rootHash,
          metadata: metadata ? JSON.parse(metadata) : {},
          signer: '0x...', // Placeholder for signer address
          block: '0x...', // Placeholder for block hash/number
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to publish to DA.')
      }

      setResponse(JSON.stringify(data, null, 2))
    } catch (err: any) {
      console.error('DA Publish failed:', err)
      setError(`DA Publish failed: ${err.message || String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-6 h-6" />
          DA Publish Stub
        </CardTitle>
        <CardDescription>
          This is a stub for Data Availability (DA) integration. It simulates publishing data to a DA client.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="rootHash">Root Hash *</Label>
          <Input
            id="rootHash"
            value={rootHash}
            onChange={(e) => setRootHash(e.target.value)}
            placeholder="Enter root hash (e.g., 0x123...)"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="metadata">Metadata (JSON)</Label>
          <Textarea
            id="metadata"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder="Enter metadata as JSON (optional)"
            rows={5}
            disabled={loading}
          />
        </div>
        <Button onClick={handlePublish} disabled={loading || !rootHash.trim()} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish to DA'
          )}
        </Button>
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        {response && (
          <div className="space-y-2">
            <h3 className="font-semibold">Response:</h3>
            <div className="p-4 border rounded-lg bg-muted whitespace-pre-wrap text-sm">
              {response}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

