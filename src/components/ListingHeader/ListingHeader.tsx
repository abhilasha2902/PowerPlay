import { useState } from 'react'

interface ListingHeaderProps {
  title: string
  propertyType: string
  guests: number
  bedrooms: number
  beds: number
  bathrooms: number
  rating: number
  reviewCount: number
}

import './ListingHeader.css'

function pluralize(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}

export default function ListingHeader({ title, propertyType, guests, bedrooms, beds, bathrooms, rating, reviewCount }: ListingHeaderProps) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="listing-header">
      <div>
        <h1 className="listing-header-title">{title}</h1>
        <p className="listing-header-subtitle">{propertyType}</p>
        <p className="listing-header-details">
          {pluralize(guests, 'guest')} · {pluralize(bedrooms, 'bedroom')} · {pluralize(beds, 'bed')} · {pluralize(bathrooms, 'bathroom')}
        </p>
        <div className="listing-header-rating">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M15.1 1.58l-4.13 8.88-9.57 1.2a1 1 0 00-.57 1.74l7.15 6.7-1.9 9.9a1 1 0 001.47 1.06L16 25.85l8.45 4.21a1 1 0 001.47-1.06l-1.9-9.9 7.15-6.7a1 1 0 00-.57-1.74l-9.57-1.2L16.9 1.58a1 1 0 00-1.8 0z" />
          </svg>
          <span>{rating.toFixed(2)} · {reviewCount} reviews</span>
        </div>
      </div>
      <div className="listing-header-actions">
        <button type="button" className="action-button">
          <span className="action-button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 3v12M7 8l5-5 5 5M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="action-button-label">Share</span>
        </button>
        <button
          type="button"
          className="action-button"
          aria-pressed={saved}
          onClick={() => setSaved((s) => !s)}
        >
          <span className={`action-button-icon${saved ? ' saved' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4.5 2.7C11.5 5.7 13 4.5 15 4.5c3.5 0 5 3.5 3.5 7C19.5 15.65 12 20 12 20z"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="action-button-label">Save</span>
        </button>
      </div>
    </div>
  )
}
