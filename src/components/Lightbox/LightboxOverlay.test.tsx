import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
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

  it('moves focus into the dialog when transitioning from closed to open', () => {
    // Render closed first, then flip `open` true via rerender — this is the
    // actual closed->open transition where the focus-trap race lived (a
    // fresh mount with open=true already has shouldRender=true on the same
    // render, so it can't exercise the bug that the closed->open rerender
    // does: shouldRender starts false and only flips true a render later).
    const { rerender } = render(
      <LightboxOverlay photos={photos} open={false} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />
    )

    rerender(<LightboxOverlay photos={photos} open={true} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    expect(document.activeElement).not.toBe(document.body)
  })

  it('focuses the Close button (not the Share button) when opened via keyboard', () => {
    const { rerender } = render(
      <LightboxOverlay photos={photos} open={false} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />
    )

    rerender(<LightboxOverlay photos={photos} open={true} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Close lightbox' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Share this photo' })).not.toHaveFocus()
  })

  it('keeps the last-photo Next arrow focusable (aria-disabled, not disabled) so focus cannot escape the trap', () => {
    render(<LightboxOverlay photos={photos} open={true} index={2} onClose={vi.fn()} onNavigate={vi.fn()} />)
    const nextButton = screen.getByRole('button', { name: 'Next photo' })
    expect(nextButton).not.toBeDisabled()
    expect(nextButton).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not call onNavigate when clicking the Previous arrow at the first photo', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={0} onClose={vi.fn()} onNavigate={onNavigate} />)
    await user.click(screen.getByRole('button', { name: 'Previous photo' }))
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('does not call onNavigate when clicking the Next arrow at the last photo', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={2} onClose={vi.fn()} onNavigate={onNavigate} />)
    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(onNavigate).not.toHaveBeenCalled()
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
        <LightboxOverlay photos={photos} open={true} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />
      )
      expect(screen.getByText('1 of 3')).toBeInTheDocument()

      rerender(<LightboxOverlay photos={photos} open={false} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />)

      // Content is still present immediately after `open` flips false, so the
      // container's opacity transition has something to fade rather than
      // popping to an empty rectangle.
      expect(screen.getByText('1 of 3')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(250)
      })

      expect(screen.queryByText('1 of 3')).not.toBeInTheDocument()
    })
  })
})
