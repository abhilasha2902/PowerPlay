import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ListingDetails from './ListingDetails'

describe('ListingDetails', () => {
  it('renders property type and pluralized guest details', () => {
    render(<ListingDetails propertyType="Entire apartment" guests={3} bedrooms={1} beds={1} bathrooms={1} />)
    expect(screen.getByText('Entire apartment')).toBeInTheDocument()
    expect(screen.getByText('3 guests · 1 bedroom · 1 bed · 1 bathroom')).toBeInTheDocument()
  })
})
