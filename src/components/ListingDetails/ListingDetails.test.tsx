import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ListingDetails from './ListingDetails'

describe('ListingDetails', () => {
  it('renders property type, pluralized guest details, and rating', () => {
    render(<ListingDetails propertyType="Entire apartment" guests={3} bedrooms={1} beds={1} bathrooms={1} rating={4.95} reviewCount={19} />)
    expect(screen.getByText('Entire apartment')).toBeInTheDocument()
    expect(screen.getByText('3 guests · 1 bedroom · 1 bed · 1 bathroom')).toBeInTheDocument()
    expect(screen.getByText('4.95 · 19 reviews')).toBeInTheDocument()
  })
})
