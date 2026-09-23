import { useEffect, useRef, useState } from 'react'
import type { Photo, Room } from '../../types/listing'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import './PhotoTourOverlay.css'

interface PhotoTourOverlayProps {
  photos: Photo[]
  rooms: Room[]
  open: boolean
  onClose: () => void
  onOpenLightboxAt: (index: number) => void
}

export default function PhotoTourOverlay({ photos, rooms, open, onClose, onOpenLightboxAt }: PhotoTourOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(open)

  useScrollLock(open)
  useFocusTrap(containerRef, open && shouldRender)

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      return
    }
    const timer = setTimeout(() => setShouldRender(false), 300)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function scrollToRoom(roomId: string) {
    document.getElementById(`photo-tour-room-${roomId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
            <button type="button" className="photo-tour-icon-button photo-tour-back" onClick={onClose} aria-label="Close photo tour">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <polyline points="15 5 9 12 15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h2 className="photo-tour-title">Photo tour</h2>
            <div className="photo-tour-header-actions">
              <button type="button" className="photo-tour-icon-button" aria-label="Share this listing">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 3v12M7 8l5-5 5 5M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="photo-tour-icon-button" aria-label="Save this listing">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4.5 2.7C11.5 5.7 13 4.5 15 4.5c3.5 0 5 3.5 3.5 7C19.5 15.65 12 20 12 20z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </header>

          <nav className="photo-tour-nav-grid" aria-label="Jump to room">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className="photo-tour-nav-item"
                onClick={() => scrollToRoom(room.id)}
                aria-label={`Jump to ${room.name}`}
              >
                <img src={room.photos[0].url} alt="" loading="lazy" />
                <span className="photo-tour-nav-caption" aria-hidden="true">{room.name}</span>
              </button>
            ))}
          </nav>

          {rooms.map((room) => {
            const [firstPhoto, ...extraPhotos] = room.photos
            return (
              <section key={room.id} id={`photo-tour-room-${room.id}`} className="photo-tour-room">
                <div className="photo-tour-room-info">
                  <h3 className="photo-tour-room-heading">{room.name}</h3>
                  {room.amenities && <p className="photo-tour-room-amenities">{room.amenities}</p>}
                </div>
                <div className="photo-tour-room-photos">
                  <button
                    type="button"
                    className="photo-tour-photo"
                    onClick={() => onOpenLightboxAt(photos.findIndex((p) => p.id === firstPhoto.id))}
                    aria-label={`Open ${firstPhoto.alt} in lightbox`}
                  >
                    <img src={firstPhoto.url} alt="" loading="lazy" />
                  </button>
                  {extraPhotos.length > 0 && (
                    <div className="photo-tour-room-photos-extra">
                      {extraPhotos.map((photo) => (
                        <button
                          key={photo.id}
                          type="button"
                          className="photo-tour-photo"
                          onClick={() => onOpenLightboxAt(photos.findIndex((p) => p.id === photo.id))}
                          aria-label={`Open ${photo.alt} in lightbox`}
                        >
                          <img src={photo.url} alt="" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
