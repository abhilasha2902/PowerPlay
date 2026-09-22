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
  const [shouldRender, setShouldRender] = useState(open)

  useScrollLock(open)
  useFocusTrap(containerRef, open && shouldRender)

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      return
    }
    const timer = setTimeout(() => setShouldRender(false), 300) // matches the 0.3s opacity/transform transition
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (open) setActiveCategory('All photos')
  }, [open])

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
      {shouldRender && (
        <>
          <header className="photo-tour-header">
            <button type="button" className="photo-tour-close" onClick={onClose} aria-label="Close photo tour">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
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
