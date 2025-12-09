'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, ImageIcon } from 'lucide-react'

interface RepostDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (content: string, images: string[]) => Promise<void>
  originalPost: {
    author_name: string
    content?: string
  }
}

const MAX_IMAGES = 3
const MAX_CHARS = 300

export function RepostDialog({ open, onClose, onSubmit, originalPost }: RepostDialogProps) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const remainingChars = MAX_CHARS - content.length

  const handleImageSelect = () => {
    if (images.length >= MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return

      const newImages: string[] = []
      const remainingSlots = MAX_IMAGES - images.length

      Array.from(files).slice(0, remainingSlots).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string)
            if (newImages.length === Math.min(files.length, remainingSlots)) {
              setImages([...images, ...newImages])
            }
          }
        }
        reader.readAsDataURL(file)
      })

      if (files.length > remainingSlots) {
        alert(`Only ${remainingSlots} more image(s) can be added`)
      }
    }
    input.click()
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit(content, images)
      setContent('')
      setImages([])
      onClose()
    } catch (error) {
      console.error('Failed to repost:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Repost</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original post preview */}
          <div className="rounded-lg border bg-muted p-3 text-sm">
            <p className="font-medium">{originalPost.author_name}</p>
            {originalPost.content && (
              <p className="mt-1 text-muted-foreground">{originalPost.content}</p>
            )}
          </div>

          {/* Repost content */}
          <div>
            <Textarea
              placeholder="Add your comment (optional)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHARS}
              className="min-h-[100px] resize-none"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{images.length}/{MAX_IMAGES} images</span>
              <span className={remainingChars < 0 ? 'text-destructive' : ''}>
                {remainingChars} characters remaining
              </span>
            </div>
          </div>

          {/* Image preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Upload ${idx + 1}`}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Image upload button */}
          {images.length < MAX_IMAGES && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleImageSelect}
              className="w-full"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Add Images ({images.length}/{MAX_IMAGES})
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || remainingChars < 0}
          >
            {loading ? 'Reposting...' : 'Repost'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
