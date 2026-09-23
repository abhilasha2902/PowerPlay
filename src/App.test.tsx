import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('closes only the Lightbox (not the Photo Tour) on a single Escape when stacked on top of it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Show all photos/i }))
    // "Open Living room 1 in lightbox" (room-section photo button) is now distinct from
    // "Jump to Living room 1" (nav-grid thumbnail), so no scoping is needed to disambiguate.
    await user.click(screen.getByRole('button', { name: 'Open Living room 1 in lightbox' }))

    // Both overlays are open: Photo Tour underneath, Lightbox on top.
    expect(screen.getAllByRole('dialog')).toHaveLength(2)

    await user.keyboard('{Escape}')

    // A single Escape should only dismiss the topmost (Lightbox) overlay.
    const dialogs = screen.getAllByRole('dialog')
    expect(dialogs).toHaveLength(1)
    expect(dialogs[0]).toHaveAccessibleName('Photo tour')
  })

  it('opens the Lightbox at the clicked hero cell index', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Hero cells 1-5 are the first 5 flattened photos: the 5 heroPhotos entries
    // (hero-1..hero-5), prepended ahead of the room photos. Click the 3rd (index 2, "Full bathroom" category).
    await user.click(screen.getByRole('button', { name: 'Open photo 3 in lightbox: Full bathroom' }))

    expect(screen.getByText('3 of 15')).toBeInTheDocument()
  })

  it('opens the Lightbox at the correct global index when a room-section photo is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /show all photos/i }))
    // 5 heroPhotos occupy global indices 0-4. "Full kitchen" is the 3rd room in rooms.json;
    // its one photo is global index 7 (8th of 15 total: 5 hero + living-room-1 + living-room-2 + full-kitchen).
    const kitchenPhotoButton = screen.getByRole('button', { name: 'Open Full kitchen in lightbox' })
    await user.click(kitchenPhotoButton)
    expect(screen.getByText('8 of 15')).toBeInTheDocument()
  })
})
