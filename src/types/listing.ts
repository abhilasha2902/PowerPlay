export interface Photo {
  id: string
  url: string
  alt: string
  category: string
}

export interface HostInfo {
  name: string
  avatarUrl: string
  meta: string
}

export interface GuestFavourite {
  title: string
  description: string
  ratingsCount: number
  reviewsCount: number
}

export interface Listing {
  id: string
  title: string
  propertyType: string
  rating: number
  reviewCount: number
  pricePerNight: number
  nights: number
  host: HostInfo
  guestFavourite: GuestFavourite
}
