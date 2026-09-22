import type { GuestFavourite } from '../../types/listing'
import './GuestFavouriteCard.css'

interface GuestFavouriteCardProps {
  favourite: GuestFavourite
}

export default function GuestFavouriteCard({ favourite }: GuestFavouriteCardProps) {
  return (
    <div className="guest-favourite-card">
      <svg className="guest-favourite-icon" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
        <circle cx="12" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 14.5L7 21l5-3 5 3-2-6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <div>
        <p className="guest-favourite-title">{favourite.title}</p>
        <p className="guest-favourite-description">{favourite.description}</p>
      </div>
    </div>
  )
}
