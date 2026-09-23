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
        <svg viewBox="0 0 15 15" width="15" height="15" aria-hidden="true">
          {[2, 7.5, 13].flatMap((cy) =>
            [2, 7.5, 13].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.3" fill="currentColor" />)
          )}
        </svg>
        Show all photos
      </button>
    </div>
  )
}
