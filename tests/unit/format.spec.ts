import { describe, expect, it } from 'vitest'
import {
  formatCompactNumber,
  formatMonth,
  formatSizeKb,
  formatTechDate,
} from '../../shared/utils/format'

describe('format', () => {
  it('formatta le date tecniche in UTC', () => {
    expect(formatTechDate('2024-10-15T23:30:00Z')).toBe('2024.10.15')
    expect(formatTechDate('2024-01-02T00:00:00Z')).toBe('2024.01.02')
  })

  it('formatta i mesi della story', () => {
    expect(formatMonth('2024-07')).toBe('2024.07')
  })

  it('formatta numeri compatti e dimensioni', () => {
    expect(formatCompactNumber(1200, 'en')).toBe('1.2K')
    expect(formatSizeKb(1200)).toBe('1.2 MB')
    expect(formatSizeKb(860)).toBe('860 KB')
  })
})
