import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('closes only the Lightbox (not the Photo Tour) on a single Escape when stacked on top of it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Show all photos/i }))
    await user.click(screen.getByRole('button', { name: 'Living room — photo 1 of 43' }))

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

    // Click the 3rd hero cell (index 2) so the index assertion is meaningful.
    await user.click(screen.getByRole('button', { name: 'Open photo 3 in lightbox: Kitchen' }))

    expect(screen.getByText('3 of 43')).toBeInTheDocument()
  })

  it('opens the Lightbox at the thumbnail global index, not its index within a filtered category view', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Show all photos/i }))
    await user.click(screen.getByRole('button', { name: 'Kitchen' }))

    // photo-9 ("Kitchen — photo 9 of 43") is the 2nd photo in the Kitchen
    // filter, but the 9th photo overall (global index 8).
    await user.click(screen.getByRole('button', { name: 'Kitchen — photo 9 of 43' }))

    expect(screen.getByText('9 of 43')).toBeInTheDocument()
  })
})
