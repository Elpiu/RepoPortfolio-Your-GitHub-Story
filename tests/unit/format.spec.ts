import { describe, expect, it } from 'vitest'
import { formatMonth, formatTechDate } from '../../shared/utils/format'

describe('format', () => {
  it('formatta le date tecniche in UTC', () => {
    expect(formatTechDate('2024-10-15T23:30:00Z')).toBe('2024.10.15')
    expect(formatTechDate('2024-01-02T00:00:00Z')).toBe('2024.01.02')
  })

  it('formatta i mesi della story', () => {
    expect(formatMonth('2024-07')).toBe('2024.07')
  })
})
