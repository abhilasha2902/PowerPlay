import { useState } from 'react'
import ListingPage from './components/ListingPage/ListingPage'
import PhotoTourOverlay from './components/PhotoTour/PhotoTourOverlay'
import LightboxOverlay from './components/Lightbox/LightboxOverlay'
import { useKeyboardMode } from './hooks/useKeyboardMode'
import listingData from './data/listing.json'
import photosData from './data/photos.json'
import type { Listing, Photo } from './types/listing'

const listing = listingData as Listing
const photos = photosData as Photo[]

export default function App() {
  const [photoTourOpen, setPhotoTourOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useKeyboardMode()

  function openLightboxAt(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <ListingPage
        listing={listing}
        photos={photos}
        onShowAllPhotos={() => setPhotoTourOpen(true)}
        onOpenLightboxAt={openLightboxAt}
      />
      <PhotoTourOverlay
        photos={photos}
        open={photoTourOpen}
        onClose={() => setPhotoTourOpen(false)}
        onOpenLightboxAt={openLightboxAt}
      />
      <LightboxOverlay
        photos={photos}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
  )
}
