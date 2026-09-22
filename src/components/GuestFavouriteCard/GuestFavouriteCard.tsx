import type { GuestFavourite } from '../../types/listing'
import './GuestFavouriteCard.css'

interface GuestFavouriteCardProps {
  favourite: GuestFavourite
}

export default function GuestFavouriteCard({ favourite }: GuestFavouriteCardProps) {
  return (
    <div className="guest-favourite-card">
      <span aria-hidden="true" style={{ fontSize: 32 }}>🏅</span>
      <div>
        <p className="guest-favourite-title">{favourite.title}</p>
        <p className="guest-favourite-description">{favourite.description}</p>
      </div>
    </div>
  )
}
