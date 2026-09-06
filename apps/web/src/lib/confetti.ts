import confetti from 'canvas-confetti'

/**
 * Triggers a celebratory confetti explosion when a lead contact is unlocked.
 * Automatically aligns to the button coordinates or screen center.
 */
export function triggerUnlockConfetti(event?: React.MouseEvent | HTMLElement | null) {
  if (typeof window === 'undefined') return

  let origin = { x: 0.5, y: 0.6 }

  if (event) {
    if ('clientX' in event && event.clientX && event.clientY) {
      origin = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      }
    } else if ('getBoundingClientRect' in event && typeof event.getBoundingClientRect === 'function') {
      const rect = event.getBoundingClientRect()
      origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      }
    }
  }

  // 1. Immediate crisp pop at the button position with pastel brand colors
  confetti({
    particleCount: 50,
    spread: 60,
    startVelocity: 28,
    origin,
    colors: ['#B8F36B', '#A78BFA', '#F9A8D4', '#7DD3FC', '#FFB86B', '#FDE047'],
    ticks: 180,
    gravity: 1.1,
    scalar: 0.9,
    shapes: ['circle', 'square'],
    zIndex: 99999,
  })

  // 2. Secondary wider burst for celebratory feel
  setTimeout(() => {
    confetti({
      particleCount: 35,
      spread: 90,
      startVelocity: 35,
      origin,
      colors: ['#FFFFFF', '#B8F36B', '#A78BFA', '#38BDF8', '#F43F5E'],
      ticks: 220,
      gravity: 0.95,
      scalar: 1.1,
      zIndex: 99999,
    })
  }, 100)
}
