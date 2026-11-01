import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useRelativeTime(value: MaybeRefOrGetter<string | null | undefined>) {
  const { locale } = useI18n()
  const mounted = ref(false)

  onMounted(() => {
    mounted.value = true
  })

  return computed<string | null>(() => {
    if (!mounted.value) return null
    const iso = toValue(value)
    if (!iso) return null
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return null

    const seconds = (date.getTime() - Date.now()) / 1000
    const absolute = Math.abs(seconds)
    const formatter = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })

    if (absolute < 60) return formatter.format(Math.round(seconds), 'second')
    if (absolute < 3_600) return formatter.format(Math.round(seconds / 60), 'minute')
    if (absolute < 86_400) return formatter.format(Math.round(seconds / 3_600), 'hour')
    if (absolute < 2_592_000) return formatter.format(Math.round(seconds / 86_400), 'day')
    if (absolute < 31_536_000) return formatter.format(Math.round(seconds / 2_592_000), 'month')
    return formatter.format(Math.round(seconds / 31_536_000), 'year')
  })
}
