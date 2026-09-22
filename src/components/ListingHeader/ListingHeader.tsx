interface ListingHeaderProps {
  title: string
  propertyType: string
  rating: number
  reviewCount: number
}

import './ListingHeader.css'

export default function ListingHeader({ title, propertyType, rating, reviewCount }: ListingHeaderProps) {
  return (
    <div className="listing-header">
      <div>
        <h1 className="listing-header-title">{title}</h1>
        <p className="listing-header-subtitle">{propertyType}</p>
        <div className="listing-header-rating">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M15.1 1.58l-4.13 8.88-9.57 1.2a1 1 0 00-.57 1.74l7.15 6.7-1.9 9.9a1 1 0 001.47 1.06L16 25.85l8.45 4.21a1 1 0 001.47-1.06l-1.9-9.9 7.15-6.7a1 1 0 00-.57-1.74l-9.57-1.2L16.9 1.58a1 1 0 00-1.8 0z" />
          </svg>
          <span>{rating.toFixed(2)} · {reviewCount} reviews</span>
        </div>
      </div>
      <div className="listing-header-actions">
        <button type="button" className="action-button">
          <span className="action-button-icon" aria-hidden="true">⇪</span>
          <span className="action-button-label">Share</span>
        </button>
        <button type="button" className="action-button" aria-pressed="false">
          <span className="action-button-icon" aria-hidden="true">♡</span>
          <span className="action-button-label">Save</span>
        </button>
      </div>
    </div>
  )
}
