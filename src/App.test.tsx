import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('closes only the Lightbox (not the Photo Tour) on a single Escape when stacked on top of it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Show all photos/i }))
    // Scope to the room section (not the nav-grid thumbnail, which shares the same accessible name).
    const livingRoomSection = document.getElementById('photo-tour-room-living-room-1')!
    await user.click(within(livingRoomSection).getByRole('button', { name: 'Living room 1' }))

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

    // Hero cells 1-5 are the first 5 flattened photos: Living room 1, Living room 2,
    // Full kitchen, Bedroom, Full bathroom. Click the 3rd (index 2, "Full kitchen").
    await user.click(screen.getByRole('button', { name: 'Open photo 3 in lightbox: Full kitchen' }))

    expect(screen.getByText('3 of 10')).toBeInTheDocument()
  })

  it('opens the Lightbox at the correct global index when a room-section photo is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /show all photos/i }))
    // "Full kitchen" is the 3rd room in rooms.json; its one photo is global index 2 (3rd of 10 total).
    const kitchenSection = document.getElementById('photo-tour-room-full-kitchen')!
    const kitchenPhotoButton = within(kitchenSection).getByRole('button', { name: 'Full kitchen' })
    await user.click(kitchenPhotoButton)
    expect(screen.getByText('3 of 10')).toBeInTheDocument()
  })
})
