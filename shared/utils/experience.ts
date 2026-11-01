export function yearsOfExperience(start: string | null, nowIso: string): number | null {
  if (!start) return null
  const [startYear, startMonth] = start.split('-').map(Number)
  if (!startYear || !startMonth) return null

  const now = new Date(nowIso)
  if (Number.isNaN(now.getTime())) return null

  const months = (now.getUTCFullYear() - startYear) * 12 + (now.getUTCMonth() + 1 - startMonth)
  if (months < 0) return null
  return Math.floor(months / 12)
}
