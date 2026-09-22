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
          aria-label={`Open photo ${index + 1} in lightbox: ${photo.alt}`}
        >
          <img src={photo.url} alt={photo.alt} loading={index === 0 ? 'eager' : 'lazy'} />
        </button>
      ))}
      <button type="button" className="show-all-photos" onClick={onShowAllPhotos}>
        <span aria-hidden="true">⊞</span>
        Show all photos
      </button>
    </div>
  )
}
