const pad = (value: number): string => String(value).padStart(2, '0')

export function formatTechDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return `${date.getUTCFullYear()}.${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())}`
}

export function formatMonth(value: string): string {
  return value.replace('-', '.')
}

export function formatCompactNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatSizeKb(sizeKb: number): string {
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`
  return `${sizeKb} KB`
}
