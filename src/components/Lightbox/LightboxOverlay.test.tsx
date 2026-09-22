import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LightboxOverlay from './LightboxOverlay'
import type { Photo } from '../../types/listing'

const photos: Photo[] = [
  { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Photo 1', category: 'Living room' },
  { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Photo 2', category: 'Bedroom' },
  { id: 'p3', url: 'https://example.com/3.jpg', alt: 'Photo 3', category: 'Kitchen' },
]

describe('LightboxOverlay', () => {
  it('shows the counter for the current index', () => {
    render(<LightboxOverlay photos={photos} open={true} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('calls onNavigate with the next index on ArrowRight', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={0} onClose={vi.fn()} onNavigate={onNavigate} />)
    await user.keyboard('{ArrowRight}')
    expect(onNavigate).toHaveBeenCalledWith(1)
  })

  it('calls onNavigate with the previous index on ArrowLeft', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={1} onClose={vi.fn()} onNavigate={onNavigate} />)
    await user.keyboard('{ArrowLeft}')
    expect(onNavigate).toHaveBeenCalledWith(0)
  })

  it('does not navigate past the last photo on ArrowRight', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={2} onClose={vi.fn()} onNavigate={onNavigate} />)
    await user.keyboard('{ArrowRight}')
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={0} onClose={onClose} onNavigate={vi.fn()} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
