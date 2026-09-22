import type { Listing, Photo } from '../../types/listing'
import Navbar from '../Navbar/Navbar'
import HeroGallery from '../HeroGallery/HeroGallery'
import ListingHeader from '../ListingHeader/ListingHeader'
import HostInfo from '../HostInfo/HostInfo'
import GuestFavouriteCard from '../GuestFavouriteCard/GuestFavouriteCard'
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
        <HeroGallery photos={photos} onShowAllPhotos={onShowAllPhotos} onOpenLightboxAt={onOpenLightboxAt} />
        <div className="listing-page-grid">
          <main id="main-content">
            <ListingHeader
              title={listing.title}
              propertyType={listing.propertyType}
              rating={listing.rating}
              reviewCount={listing.reviewCount}
            />
            <HostInfo host={listing.host} />
            <GuestFavouriteCard favourite={listing.guestFavourite} />
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
