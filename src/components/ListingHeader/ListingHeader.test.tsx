import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListingHeader from './ListingHeader'

describe('ListingHeader', () => {
  it('toggles the Save button\'s pressed state and heart fill on click', async () => {
    const user = userEvent.setup()
    render(<ListingHeader title="Test" propertyType="Test type" rating={4.5} reviewCount={10} />)
    const saveButton = screen.getByRole('button', { name: /save/i })
    expect(saveButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(saveButton)
    expect(saveButton).toHaveAttribute('aria-pressed', 'true')
    await user.click(saveButton)
    expect(saveButton).toHaveAttribute('aria-pressed', 'false')
  })
})
