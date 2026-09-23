import type { Listing, Photo } from '../../types/listing'
import Navbar from '../Navbar/Navbar'
import HeroGallery from '../HeroGallery/HeroGallery'
import ListingHeader from '../ListingHeader/ListingHeader'
import ListingDetails from '../ListingDetails/ListingDetails'
import GuestFavouriteBadge from '../GuestFavouriteBadge/GuestFavouriteBadge'
import HostInfo from '../HostInfo/HostInfo'
import ReserveWidget from '../ReserveWidget/ReserveWidget'
import './ListingPage.css'

interface ListingPageProps {
  listing: Listing
  photos: Photo[]
  onShowAllPhotos: () => void
  onOpenLightboxAt: (index: number) => void
}

export default function ListingPage({ listing, photos, onShowAllPhotos, onOpenLightboxAt }: ListingPageProps) {
  return (
    <div>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <div className="listing-page-container">
        <ListingHeader title={listing.title} />
        <HeroGallery photos={photos} onShowAllPhotos={onShowAllPhotos} onOpenLightboxAt={onOpenLightboxAt} />
        <div className="listing-page-grid">
          <main id="main-content">
            <ListingDetails
              propertyType={listing.propertyType}
              guests={listing.guests}
              bedrooms={listing.bedrooms}
              beds={listing.beds}
              bathrooms={listing.bathrooms}
            />
            <GuestFavouriteBadge
              title={listing.guestFavourite.title}
              description={listing.guestFavourite.description}
              rating={listing.rating}
              reviewCount={listing.reviewCount}
            />
            <HostInfo host={listing.host} />
          </main>
          <ReserveWidget
            pricePerNight={listing.pricePerNight}
            nights={listing.nights}
            rating={listing.rating}
            reviewCount={listing.reviewCount}
          />
        </div>
      </div>
    </div>
  )
}
