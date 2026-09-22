import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
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

  it('calls onOpenLightboxAt with the global index after filtering by category', async () => {
    const filterablePhotos: Photo[] = [
      { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Photo A', category: 'Bedroom' },
      { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Photo B', category: 'Kitchen' },
      { id: 'p3', url: 'https://example.com/3.jpg', alt: 'Photo C', category: 'Bedroom' },
    ]
    const user = userEvent.setup()
    const onOpenLightboxAt = vi.fn()
    render(
      <PhotoTourOverlay
        photos={filterablePhotos}
        open={true}
        onClose={vi.fn()}
        onOpenLightboxAt={onOpenLightboxAt}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Kitchen' }))
    await user.click(screen.getByRole('button', { name: /Photo B/i }))

    expect(onOpenLightboxAt).toHaveBeenCalledWith(1)
  })

  it('resets the category filter to "All photos" when reopened', async () => {
    const filterablePhotos: Photo[] = [
      { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Photo A', category: 'Bedroom' },
      { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Photo B', category: 'Kitchen' },
    ]
    const user = userEvent.setup()
    const { rerender } = render(
      <PhotoTourOverlay photos={filterablePhotos} open={true} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />
    )

    await user.click(screen.getByRole('button', { name: 'Kitchen' }))
    expect(screen.queryByRole('button', { name: /Photo A/i })).not.toBeInTheDocument()

    rerender(<PhotoTourOverlay photos={filterablePhotos} open={false} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)
    rerender(<PhotoTourOverlay photos={filterablePhotos} open={true} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'All photos' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: /Photo A/i })).toBeInTheDocument()
  })

  describe('close fade-out', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('keeps content mounted immediately after open becomes false, then unmounts after the fade duration', () => {
      const { rerender } = render(
        <PhotoTourOverlay photos={photos} open={true} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />
      )
      expect(screen.getByText('Photo tour')).toBeInTheDocument()

      rerender(<PhotoTourOverlay photos={photos} open={false} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)

      // Content is still present immediately after `open` flips false, so the
      // container's transition has something to fade/slide rather than
      // popping to an empty overlay.
      expect(screen.getByText('Photo tour')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(screen.queryByText('Photo tour')).not.toBeInTheDocument()
    })
  })
})
