const pad = (value: number): string => String(value).padStart(2, '0')

export function formatTechDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return `${date.getUTCFullYear()}.${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())}`
}

export function formatMonth(value: string): string {
  return value.replace('-', '.')
}
