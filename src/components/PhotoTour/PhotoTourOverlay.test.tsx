import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import PhotoTourOverlay from './PhotoTourOverlay'
import type { Photo, Room } from '../../types/listing'

const photos: Photo[] = [
  { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Room A photo', category: 'Room A' },
  { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Room B photo 1', category: 'Room B' },
  { id: 'p3', url: 'https://example.com/3.jpg', alt: 'Room B photo 2', category: 'Room B' },
]

const rooms: Room[] = [
  { id: 'room-a', name: 'Room A', amenities: 'Sofa · TV', photos: [photos[0]] },
  { id: 'room-b', name: 'Room B', amenities: 'Bed', photos: [photos[1], photos[2]] },
]

describe('PhotoTourOverlay', () => {
  it('does not render dialog content when closed', () => {
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={false} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed while open', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={true} onClose={onClose} onOpenLightboxAt={vi.fn()} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders one thumbnail-nav button per room', () => {
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={true} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)
    expect(screen.getAllByRole('button', { name: /^Jump to (Room A|Room B)$/ })).toHaveLength(2)
  })

  it('clicking a thumbnail-nav button does NOT open the lightbox', async () => {
    const user = userEvent.setup()
    const onOpenLightboxAt = vi.fn()
    // jsdom doesn't implement scrollIntoView; stub it so the click handler doesn't throw
    Element.prototype.scrollIntoView = vi.fn()
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={true} onClose={vi.fn()} onOpenLightboxAt={onOpenLightboxAt} />)
    await user.click(screen.getByRole('button', { name: 'Jump to Room B' }))
    expect(onOpenLightboxAt).not.toHaveBeenCalled()
  })

  it('clicking a room-section photo opens the lightbox at the correct global index', async () => {
    const user = userEvent.setup()
    const onOpenLightboxAt = vi.fn()
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={true} onClose={vi.fn()} onOpenLightboxAt={onOpenLightboxAt} />)
    await user.click(screen.getByRole('button', { name: 'Open Room B photo 2 in lightbox' }))
    expect(onOpenLightboxAt).toHaveBeenCalledWith(2)
  })

  it('renders room headings and amenities, omitting the amenities line when null', () => {
    const roomsWithNoAmenities: Room[] = [...rooms, { id: 'extra', name: 'Extra', amenities: null, photos: [photos[0]] }]
    render(<PhotoTourOverlay photos={photos} rooms={roomsWithNoAmenities} open={true} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)
    expect(screen.getByText('Sofa · TV')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Extra' })).toHaveLength(1)
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
        <PhotoTourOverlay photos={photos} rooms={rooms} open={true} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />
      )
      expect(screen.getByText('Photo tour')).toBeInTheDocument()

      rerender(
        <PhotoTourOverlay photos={photos} rooms={rooms} open={false} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />
      )

      // Content is still present immediately after `open` flips false, so the
      // overlay's opacity transition has something to fade rather than
      // popping to an empty rectangle.
      expect(screen.getByText('Photo tour')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(screen.queryByText('Photo tour')).not.toBeInTheDocument()
    })
  })
})
