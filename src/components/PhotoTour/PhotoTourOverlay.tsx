import { useEffect, useMemo, useRef, useState } from 'react'
import type { Photo } from '../../types/listing'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import './PhotoTourOverlay.css'

interface PhotoTourOverlayProps {
  photos: Photo[]
  open: boolean
  onClose: () => void
  onOpenLightboxAt: (index: number) => void
}

export default function PhotoTourOverlay({ photos, open, onClose, onOpenLightboxAt }: PhotoTourOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const categories = useMemo(() => ['All photos', ...Array.from(new Set(photos.map((p) => p.category)))], [photos])
  const [activeCategory, setActiveCategory] = useState('All photos')

  useScrollLock(open)
  useFocusTrap(containerRef, open)

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const visiblePhotos = activeCategory === 'All photos' ? photos : photos.filter((p) => p.category === activeCategory)

  return (
    <div
      ref={containerRef}
      className={`photo-tour-overlay${open ? ' open' : ''}`}
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
      aria-label="Photo tour"
      aria-hidden={!open}
    >
      {open && (
        <>
          <header className="photo-tour-header">
            <button type="button" className="photo-tour-close" onClick={onClose} aria-label="Close photo tour">
              ✕
            </button>
            <h2 className="photo-tour-title">Photo tour</h2>
          </header>
          <div className="photo-tour-body">
            <nav className="photo-tour-nav" aria-label="Photo categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={category === activeCategory ? 'active' : ''}
                  aria-current={category === activeCategory ? 'true' : undefined}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </nav>
            <div className="photo-tour-grid">
              {visiblePhotos.map((photo) => {
                const globalIndex = photos.findIndex((p) => p.id === photo.id)
                return (
                  <button
                    key={photo.id}
                    type="button"
                    className="photo-tour-thumb"
                    onClick={() => onOpenLightboxAt(globalIndex)}
                    aria-label={photo.alt}
                  >
                    <span className="photo-tour-thumb-image">
                      <img src={photo.url} alt="" loading="lazy" />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
