import './ListingDetails.css'

interface ListingDetailsProps {
  propertyType: string
  guests: number
  bedrooms: number
  beds: number
  bathrooms: number
}

function pluralize(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}

export default function ListingDetails({ propertyType, guests, bedrooms, beds, bathrooms }: ListingDetailsProps) {
  return (
    <div className="listing-details">
      <p className="listing-details-subtitle">{propertyType}</p>
      <p className="listing-details-guests">
        {pluralize(guests, 'guest')} · {pluralize(bedrooms, 'bedroom')} · {pluralize(beds, 'bed')} · {pluralize(bathrooms, 'bathroom')}
      </p>
    </div>
  )
}
