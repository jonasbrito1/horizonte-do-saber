import React, { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoData {
  url: string
  titulo?: string
  descricao?: string
  id?: string
}

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photos: PhotoData[]
  currentIndex: number
  onNext: () => void
  onPrevious: () => void
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onNext,
  onPrevious
}) => {
  const currentPhoto = photos[currentIndex]

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          onPrevious()
          break
        case 'ArrowRight':
          onNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, onClose, onNext, onPrevious])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !currentPhoto) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation buttons */}
      {photos.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-2 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-2 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Modal content */}
      <div className="relative max-w-4xl max-h-full flex flex-col">
        {/* Photo counter */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-4 z-40 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>
        )}

        {/* Photo */}
        <div className="relative flex-1 flex items-center justify-center">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.titulo || `Foto ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
          />
        </div>

        {/* Photo info */}
        {(currentPhoto.titulo || currentPhoto.descricao) && (
          <div className="mt-4 max-w-2xl mx-auto text-center text-white">
            {currentPhoto.titulo && (
              <h3 className="text-xl font-semibold mb-2">
                {currentPhoto.titulo}
              </h3>
            )}
            {currentPhoto.descricao && (
              <p className="text-gray-300 text-sm">
                {currentPhoto.descricao}
              </p>
            )}
          </div>
        )}

        {/* Thumbnail navigation */}
        {photos.length > 1 && (
          <div className="mt-6 flex justify-center space-x-2 overflow-x-auto max-w-full px-4">
            <div className="flex space-x-2 pb-2">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Navigate to this photo
                    const diff = index - currentIndex
                    if (diff > 0) {
                      for (let i = 0; i < diff; i++) onNext()
                    } else if (diff < 0) {
                      for (let i = 0; i < Math.abs(diff); i++) onPrevious()
                    }
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white ring-2 ring-white/50'
                      : 'border-gray-500 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.titulo || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background overlay - click to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}

export default PhotoModal