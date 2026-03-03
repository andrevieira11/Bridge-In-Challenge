'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface CopyLinkSectionProps {
  url: string
}

export function CopyLinkSection({ url: initialUrl }: CopyLinkSectionProps) {
  const [url, setUrl] = useState(initialUrl)
  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Could not copy — please select and copy manually.')
    }
  }

  const regenerateLink = async () => {
    setIsRegenerating(true)
    try {
      const res = await fetch('/api/magic-link', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const newUrl = url.replace(/\/report\/[^/]+$/, `/report/${data.token}`)
      setUrl(newUrl)
      setDialogOpen(false)
      toast.success('Link regenerated. The old link is now inactive.')
    } catch {
      toast.error('Could not regenerate link. Please try again.')
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <code className="flex-1 text-xs text-navy font-mono break-all">{url}</code>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={copyToClipboard}>
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy link
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
          Preview
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Regenerate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerate submission link?</DialogTitle>
              <DialogDescription>
                This will create a new unique link and immediately deactivate the current one.
                Any employees who have bookmarked the old link will need the new one.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={regenerateLink}
                disabled={isRegenerating}
              >
                {isRegenerating ? 'Regenerating…' : 'Yes, regenerate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
