import { useEffect, useRef, useState } from 'react'
import type { Photo } from '../../types/listing'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import './LightboxOverlay.css'

interface LightboxOverlayProps {
  photos: Photo[]
  open: boolean
  index: number
  isPhotoTourOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function LightboxOverlay({ photos, open, index, isPhotoTourOpen, onClose, onNavigate }: LightboxOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const photo = photos[index]
  const [shouldRender, setShouldRender] = useState(open)

  useScrollLock(open)
  useFocusTrap(containerRef, open && shouldRender, closeButtonRef)

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
            <button type="button" className="lightbox-icon-button" onClick={onClose} aria-label={isPhotoTourOpen ? 'Back to photo tour' : 'Close lightbox'}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <h2 id="lightbox-title" className="lightbox-title">{photo.category}</h2>
            <div className="lightbox-controls">
              <span className="lightbox-counter">{index + 1} of {photos.length}</span>
              <span className="sr-only" aria-live="polite" aria-atomic="true">{photo.alt}, {index + 1} of {photos.length}</span>
              <button ref={closeButtonRef} type="button" className="lightbox-icon-button" onClick={onClose} aria-label="Close lightbox">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </header>
          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-prev"
            onClick={() => { if (index > 0) onNavigate(index - 1) }}
            aria-disabled={index === 0}
            aria-label="Previous photo"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <polyline points="15 5 9 12 15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <polyline points="9 5 15 12 9 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
