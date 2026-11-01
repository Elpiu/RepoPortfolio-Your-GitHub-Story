export function useSpotlight() {
  const container = ref<HTMLElement | null>(null)
  let frame = 0
  let handler: ((event: PointerEvent) => void) | null = null

  onMounted(() => {
    const element = container.value
    if (!element) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    handler = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const card = target.closest<HTMLElement>('[data-spotlight]')
      if (!card || !element.contains(card)) return
      if (frame !== 0) return

      frame = window.requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`)
        card.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`)
        frame = 0
      })
    }

    element.addEventListener('pointermove', handler, { passive: true })
  })

  onBeforeUnmount(() => {
    if (handler) container.value?.removeEventListener('pointermove', handler)
    if (frame !== 0) window.cancelAnimationFrame(frame)
  })

  return { container }
}
