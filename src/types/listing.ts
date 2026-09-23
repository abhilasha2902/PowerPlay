export interface Photo {
  id: string
  url: string
  alt: string
  category: string
}

export interface Room {
  id: string
  name: string
  amenities: string | null
  thumbnailUrl: string
  photos: Photo[]
}

export interface HostInfo {
  name: string
  avatarUrl: string
  meta: string
}

export interface GuestFavourite {
  title: string
  description: string
}

export interface Listing {
  id: string
  title: string
  propertyType: string
  guests: number
  bedrooms: number
  beds: number
  bathrooms: number
  rating: number
  reviewCount: number
  pricePerNight: number
  nights: number
  host: HostInfo
  guestFavourite: GuestFavourite
}
