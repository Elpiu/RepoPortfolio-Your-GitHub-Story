export function useActiveSection(ids: readonly string[]) {
  const activeId = ref<string>(ids[0] ?? '')

  onMounted(() => {
    if (!('IntersectionObserver' in window)) return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.intersectionRatio)
        }

        let bestId = activeId.value
        let bestRatio = 0
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }
        if (bestRatio > 0) activeId.value = bestId
      },
      {
        rootMargin: '-35% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    for (const element of elements) observer.observe(element)

    onBeforeUnmount(() => observer.disconnect())
  })

  return activeId
}
