import { useEffect } from 'react'

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    document.body.classList.add('scroll-locked')
    return () => {
      document.body.classList.remove('scroll-locked')
    }
  }, [active])
}
