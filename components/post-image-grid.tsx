"use client"

interface PostImageGridProps {
  images: string[]
  onImageClick: (image: string) => void
}

export function PostImageGrid({ images, onImageClick }: PostImageGridProps) {
  if (!images || images.length === 0) return null

  const count = images.length

  if (count === 1) {
    return (
      <div className="rounded-lg overflow-hidden">
        <img
          src={images[0] || "/placeholder.svg"}
          alt="Post image"
          className="w-full h-auto object-cover max-h-[500px] cursor-zoom-in hover:opacity-95 transition-opacity"
          onClick={() => onImageClick(images[0])}
        />
      </div>
    )
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square overflow-hidden">
            <img
              src={image || "/placeholder.svg"}
              alt={`Post image ${index + 1}`}
              className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
              onClick={() => onImageClick(image)}
            />
          </div>
        ))}
      </div>
    )
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square overflow-hidden">
            <img
              src={image || "/placeholder.svg"}
              alt={`Post image ${index + 1}`}
              className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
              onClick={() => onImageClick(image)}
            />
          </div>
        ))}
      </div>
    )
  }

  if (count === 4) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square overflow-hidden">
            <img
              src={image || "/placeholder.svg"}
              alt={`Post image ${index + 1}`}
              className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
              onClick={() => onImageClick(image)}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
      {images.slice(0, 9).map((image, index) => (
        <div key={index} className="relative aspect-square overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={`Post image ${index + 1}`}
            className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
            onClick={() => onImageClick(image)}
          />
          {/* Show count overlay on last image if more than 9 */}
          {index === 8 && images.length > 9 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+{images.length - 9}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
