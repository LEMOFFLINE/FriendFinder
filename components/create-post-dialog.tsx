"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, X, Loader2 } from "lucide-react"

interface CreatePostDialogProps {
  currentUser: any
  onPostCreated: () => void
}

export function CreatePostDialog({ currentUser, onPostCreated }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<{ url: string; name: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileProcessing = (files: FileList) => {
    const newImages: { url: string; name: string }[] = []
    const maxImages = 9

    const filesToProcess = Math.min(files.length, maxImages - selectedImages.length)

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i]
      if (!file.type.startsWith("image/")) {
        continue
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push({
          url: reader.result as string,
          name: file.name,
        })

        if (newImages.length === filesToProcess) {
          setSelectedImages((prev) => [...prev, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileProcessing(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileProcessing(files)
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_id: currentUser.user_id,
          content,
          image_urls: selectedImages.map((img) => img.url),
          visibility: "friends",
        }),
      })

      if (response.ok) {
        setContent("")
        setSelectedImages([])
        setOpen(false)
        onPostCreated()
      } else {
        alert("Failed to create post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="bg-white p-4 rounded-lg shadow cursor-pointer border border-gray-200 flex gap-3 items-center hover:bg-gray-50 transition-colors">
          <Avatar>
            <AvatarImage src={currentUser.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-gray-500 text-sm">
            What's on your mind, {currentUser.name?.split(" ")[0]}?
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center">Create Post</DialogTitle>
        </DialogHeader>

        <div
          className={`p-4 space-y-4 transition-colors ${isDragging ? "bg-blue-50/50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={currentUser.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{currentUser.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Friends</span>
              </div>
            </div>
          </div>

          <Textarea
            placeholder={
              isDragging ? "Drop images to upload..." : `What's on your mind, ${currentUser.name?.split(" ")[0]}?`
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`min-h-[150px] border-none focus-visible:ring-0 p-0 text-lg resize-none placeholder:text-gray-400 ${
              isDragging ? "pointer-events-none" : ""
            }`}
          />

          {selectedImages.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {selectedImages.map((image, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-900 text-white p-2 rounded-lg animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="h-8 w-8 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[150px]">{image.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full ml-1"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {selectedImages.length < 9 && (
                <p className="text-xs text-gray-500 text-center">{9 - selectedImages.length} more image(s) allowed</p>
              )}
            </div>
          )}

          {isDragging && (
            <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg m-4 flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm text-blue-600 font-medium flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Drop images to upload
              </div>
            </div>
          )}

          <div className="border rounded-lg p-3 flex items-center justify-between mt-4">
            <span className="text-sm font-medium text-gray-700">Add to your post</span>
            <div className="flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedImages.length >= 9}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Button
            className="w-full text-base py-5"
            onClick={handleSubmit}
            disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
