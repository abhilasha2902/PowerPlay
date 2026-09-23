import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GuestFavouriteBadge from './GuestFavouriteBadge'

describe('GuestFavouriteBadge', () => {
  it('renders the label, description, rating, and review count', () => {
    render(<GuestFavouriteBadge title="Guest favourite" description="One of the most loved homes on Airbnb, according to guests" rating={4.95} reviewCount={19} />)
    expect(screen.getByText('Guest favourite')).toBeInTheDocument()
    expect(screen.getByText('One of the most loved homes on Airbnb, according to guests')).toBeInTheDocument()
    expect(screen.getByText('4.95')).toBeInTheDocument()
    expect(screen.getByText('19')).toBeInTheDocument()
    expect(screen.getByText('Reviews')).toBeInTheDocument()
  })
})
