import { useEffect } from 'react'

let lockCount = 0

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    lockCount++
    document.body.classList.add('scroll-locked')
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        document.body.classList.remove('scroll-locked')
      }
    }
  }, [active])
}
