import { useEffect } from 'react'

export function useKeyboardMode() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Tab') {
        document.body.classList.add('kbd')
      }
    }
    function handleMouseDown() {
      document.body.classList.remove('kbd')
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
}
