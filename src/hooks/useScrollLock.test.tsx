// src/hooks/useScrollLock.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { useScrollLock } from './useScrollLock'

function LockingComponent({ active }: { active: boolean }) {
  useScrollLock(active)
  return null
}

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.classList.remove('scroll-locked')
  })

  it('adds scroll-locked to the body when activated', () => {
    render(<LockingComponent active={true} />)
    expect(document.body.classList.contains('scroll-locked')).toBe(true)
  })

  it('removes scroll-locked from the body when the only lock deactivates', () => {
    const { unmount } = render(<LockingComponent active={true} />)
    expect(document.body.classList.contains('scroll-locked')).toBe(true)
    unmount()
    expect(document.body.classList.contains('scroll-locked')).toBe(false)
  })

  it('keeps scroll-locked while another overlay is still open, and removes it once both release', () => {
    const first = render(<LockingComponent active={true} />)
    const second = render(<LockingComponent active={true} />)
    expect(document.body.classList.contains('scroll-locked')).toBe(true)

    // Simulate one overlay (e.g. Lightbox) closing while the other (e.g. Photo Tour) stays open.
    first.unmount()
    expect(document.body.classList.contains('scroll-locked')).toBe(true)

    second.unmount()
    expect(document.body.classList.contains('scroll-locked')).toBe(false)
  })
})
