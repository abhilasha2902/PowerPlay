import './GuestFavouriteBadge.css'

interface GuestFavouriteBadgeProps {
  title: string
  description: string
  rating: number
  reviewCount: number
}

function Laurel({ mirrored }: { mirrored?: boolean }) {
  return (
    <svg
      className={`guest-favourite-badge-laurel${mirrored ? ' guest-favourite-badge-laurel-right' : ''}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2c-4 2-6 6-6 11s2 8 6 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="8" cy="6" rx="1.8" ry="1" transform="rotate(-30 8 6)" />
      <ellipse cx="6" cy="10" rx="1.8" ry="1" transform="rotate(-10 6 10)" />
      <ellipse cx="6" cy="14" rx="1.8" ry="1" transform="rotate(10 6 14)" />
      <ellipse cx="8" cy="18" rx="1.8" ry="1" transform="rotate(30 8 18)" />
    </svg>
  )
}

export default function GuestFavouriteBadge({ title, description, rating, reviewCount }: GuestFavouriteBadgeProps) {
  return (
    <div className="guest-favourite-badge">
      <div className="guest-favourite-badge-label">
        <Laurel />
        <span>{title}</span>
        <Laurel mirrored />
      </div>
      <p className="guest-favourite-badge-description">{description}</p>
      <div className="guest-favourite-badge-stats">
        <div className="guest-favourite-badge-stat">
          <span className="guest-favourite-badge-number">{rating.toFixed(2)}</span>
          <span className="guest-favourite-badge-stars" aria-hidden="true">★★★★★</span>
        </div>
        <span className="guest-favourite-badge-divider" aria-hidden="true" />
        <div className="guest-favourite-badge-stat">
          <span className="guest-favourite-badge-number">{reviewCount}</span>
          <span className="guest-favourite-badge-reviews-label">Reviews</span>
        </div>
      </div>
    </div>
  )
}
