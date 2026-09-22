import { useEffect, useRef, useState } from 'react'
import type { Photo } from '../../types/listing'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import './LightboxOverlay.css'

interface LightboxOverlayProps {
  photos: Photo[]
  open: boolean
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function LightboxOverlay({ photos, open, index, onClose, onNavigate }: LightboxOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const photo = photos[index]
  const [shouldRender, setShouldRender] = useState(open)

  useScrollLock(open)
  useFocusTrap(containerRef, open && shouldRender)

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      return
    }
    const timer = setTimeout(() => setShouldRender(false), 250) // matches the 0.25s opacity transition
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowRight' && index < photos.length - 1) {
        onNavigate(index + 1)
      } else if (event.key === 'ArrowLeft' && index > 0) {
        onNavigate(index - 1)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, index, photos.length, onClose, onNavigate])

  if (!photo) return null

  return (
    <div
      ref={containerRef}
      className={`lightbox-overlay${open ? ' open' : ''}`}
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
      aria-labelledby="lightbox-title"
      aria-hidden={!open}
    >
      {shouldRender && (
        <>
          <header className="lightbox-header">
            <span className="lightbox-counter" aria-live="polite" aria-atomic="true">{index + 1} of {photos.length}</span>
            <h2 id="lightbox-title" className="lightbox-title">{photo.category}</h2>
            <div className="lightbox-controls">
              <button type="button" className="lightbox-icon-button" aria-label="Share this photo">⇪</button>
              <button type="button" className="lightbox-icon-button" onClick={onClose} aria-label="Close lightbox">✕</button>
            </div>
          </header>
          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-prev"
            onClick={() => { if (index > 0) onNavigate(index - 1) }}
            aria-disabled={index === 0}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <div className="lightbox-image-wrap">
            <img src={photo.url} alt={photo.alt} />
          </div>
          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-next"
            onClick={() => { if (index < photos.length - 1) onNavigate(index + 1) }}
            aria-disabled={index === photos.length - 1}
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
