import { useMemo, useState } from 'react'
import ListingPage from './components/ListingPage/ListingPage'
import PhotoTourOverlay from './components/PhotoTour/PhotoTourOverlay'
import LightboxOverlay from './components/Lightbox/LightboxOverlay'
import { useKeyboardMode } from './hooks/useKeyboardMode'
import listingData from './data/listing.json'
import roomsData from './data/rooms.json'
import heroPhotosData from './data/heroPhotos.json'
import type { Listing, Photo, Room } from './types/listing'

const listing = listingData as Listing
const rooms = roomsData as Room[]

export default function App() {
  const photos = useMemo(() => [...(heroPhotosData as Photo[]), ...rooms.flatMap((room) => room.photos)], [])

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
      <div inert={photoTourOpen || lightboxOpen}>
        <ListingPage
          listing={listing}
          photos={photos}
          onShowAllPhotos={() => setPhotoTourOpen(true)}
          onOpenLightboxAt={openLightboxAt}
        />
      </div>
      <div inert={lightboxOpen}>
        <PhotoTourOverlay
          photos={photos}
          rooms={rooms}
          open={photoTourOpen}
          onClose={() => {
            if (!lightboxOpen) setPhotoTourOpen(false)
          }}
          onOpenLightboxAt={openLightboxAt}
        />
      </div>
      <LightboxOverlay
        photos={photos}
        open={lightboxOpen}
        index={lightboxIndex}
        isPhotoTourOpen={photoTourOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
  )
}
