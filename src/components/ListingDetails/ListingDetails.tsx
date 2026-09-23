import './ListingDetails.css'

interface ListingDetailsProps {
  propertyType: string
  guests: number
  bedrooms: number
  beds: number
  bathrooms: number
  rating: number
  reviewCount: number
}

function pluralize(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}

export default function ListingDetails({ propertyType, guests, bedrooms, beds, bathrooms, rating, reviewCount }: ListingDetailsProps) {
  return (
    <div className="listing-details">
      <p className="listing-details-subtitle">{propertyType}</p>
      <p className="listing-details-guests">
        {pluralize(guests, 'guest')} · {pluralize(bedrooms, 'bedroom')} · {pluralize(beds, 'bed')} · {pluralize(bathrooms, 'bathroom')}
      </p>
      <div className="listing-details-rating">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M15.1 1.58l-4.13 8.88-9.57 1.2a1 1 0 00-.57 1.74l7.15 6.7-1.9 9.9a1 1 0 001.47 1.06L16 25.85l8.45 4.21a1 1 0 001.47-1.06l-1.9-9.9 7.15-6.7a1 1 0 00-.57-1.74l-9.57-1.2L16.9 1.58a1 1 0 00-1.8 0z" />
        </svg>
        <span>{rating.toFixed(2)} · {reviewCount} reviews</span>
      </div>
    </div>
  )
}
