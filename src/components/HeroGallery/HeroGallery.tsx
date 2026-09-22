import type { Photo } from '../../types/listing'
import './HeroGallery.css'

interface HeroGalleryProps {
  photos: Photo[]
  onShowAllPhotos: () => void
  onOpenLightboxAt: (index: number) => void
}

export default function HeroGallery({ photos, onShowAllPhotos, onOpenLightboxAt }: HeroGalleryProps) {
  const cells = photos.slice(0, 5)

  return (
    <div className="hero-gallery">
      {cells.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          className="hero-cell"
          onClick={() => onOpenLightboxAt(index)}
          aria-label={`Open photo ${index + 1} in lightbox: ${photo.category}`}
        >
          <img src={photo.url} alt={photo.alt} loading={index === 0 ? 'eager' : 'lazy'} />
        </button>
      ))}
      <button type="button" className="show-all-photos" onClick={onShowAllPhotos}>
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="13" y="3" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="13" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="13" y="13" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        Show all photos
      </button>
    </div>
  )
}
