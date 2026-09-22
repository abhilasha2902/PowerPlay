// src/hooks/useFocusTrap.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFocusTrap } from './useFocusTrap'

function TestOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, active)
  return (
    <div>
      <button>outside</button>
      <div ref={ref}>
        <button>first</button>
        <button>last</button>
      </div>
    </div>
  )
}

function TestOverlayWithInitialFocus({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const secondButtonRef = useRef<HTMLButtonElement>(null)
  useFocusTrap(ref, active, secondButtonRef as RefObject<HTMLElement | null>)
  return (
    <div>
      <button>outside</button>
      <div ref={ref}>
        <button>first</button>
        <button ref={secondButtonRef}>second</button>
      </div>
    </div>
  )
}

describe('useFocusTrap', () => {
  it('moves focus into the container when activated', () => {
    render(<TestOverlay active={true} />)
    expect(screen.getByText('first')).toHaveFocus()
  })

  it('wraps Tab from the last focusable element back to the first', async () => {
    const user = userEvent.setup()
    render(<TestOverlay active={true} />)
    screen.getByText('last').focus()
    await user.tab()
    expect(screen.getByText('first')).toHaveFocus()
  })

  it('wraps Shift+Tab from the first focusable element to the last', async () => {
    const user = userEvent.setup()
    render(<TestOverlay active={true} />)
    expect(screen.getByText('first')).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByText('last')).toHaveFocus()
  })

  it('restores focus to the previously focused element when deactivated', () => {
    const { rerender } = render(<TestOverlay active={false} />)
    const outsideButton = screen.getByText('outside')
    outsideButton.focus()
    expect(outsideButton).toHaveFocus()

    rerender(<TestOverlay active={true} />)
    expect(screen.getByText('first')).toHaveFocus()

    rerender(<TestOverlay active={false} />)
    expect(outsideButton).toHaveFocus()
  })

  it('focuses the provided initialFocusRef element instead of the first focusable element', () => {
    render(<TestOverlayWithInitialFocus active={true} />)
    expect(screen.getByText('second')).toHaveFocus()
    expect(screen.getByText('first')).not.toHaveFocus()
  })
})
