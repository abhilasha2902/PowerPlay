import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PhotoTourOverlay from './PhotoTourOverlay'
import type { Photo } from '../../types/listing'

const photos: Photo[] = [
  { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Photo 1', category: 'Living room' },
  { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Photo 2', category: 'Bedroom' },
]

describe('PhotoTourOverlay', () => {
  it('does not render dialog content when closed', () => {
    render(<PhotoTourOverlay photos={photos} open={false} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed while open', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<PhotoTourOverlay photos={photos} open={true} onClose={onClose} onOpenLightboxAt={vi.fn()} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenLightboxAt with the clicked thumbnail index', async () => {
    const user = userEvent.setup()
    const onOpenLightboxAt = vi.fn()
    render(<PhotoTourOverlay photos={photos} open={true} onClose={vi.fn()} onOpenLightboxAt={onOpenLightboxAt} />)
    await user.click(screen.getByRole('button', { name: /Photo 2/i }))
    expect(onOpenLightboxAt).toHaveBeenCalledWith(1)
  })
})
