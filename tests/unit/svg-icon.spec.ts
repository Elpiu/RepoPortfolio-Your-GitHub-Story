import { describe, expect, it } from 'vitest'
import { resolveDataIcon } from '../../server/utils/data-icons'
import { parseIconBody, splitIconName } from '../../shared/utils/svg-icon'

describe('parseIconBody', () => {
  it('legge un path singolo (simple-icons)', () => {
    expect(parseIconBody('<path fill="currentColor" d="M0 0h24v24H0z"/>')).toEqual([
      { tag: 'path', attrs: { fill: 'currentColor', d: 'M0 0h24v24H0z' }, children: [] },
    ])
  })

  it('legge un gruppo con figli (lucide)', () => {
    const nodes = parseIconBody(
      '<g fill="none" stroke="currentColor"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14"/></g>',
    )
    expect(nodes?.[0]?.tag).toBe('g')
    expect(nodes?.[0]?.children.map((child) => child.tag)).toEqual(['ellipse', 'path'])
  })

  it('rifiuta elementi e attributi fuori allowlist', () => {
    expect(parseIconBody('<script>alert(1)</script>')).toBeNull()
    expect(parseIconBody('<path d="M0 0" onclick="alert(1)"/>')).toBeNull()
    expect(parseIconBody('<image href="https://example.com/x.png"/>')).toBeNull()
    expect(parseIconBody('testo<path d="M0 0"/>')).toBeNull()
    expect(parseIconBody('<g><path d="M0 0"/>')).toBeNull()
  })
})

describe('splitIconName', () => {
  it('accetta solo collezione:nome', () => {
    expect(splitIconName('simple-icons:typescript')).toEqual({
      prefix: 'simple-icons',
      name: 'typescript',
    })
    expect(splitIconName('i-lucide-star')).toBeNull()
  })
})

describe('resolveDataIcon', () => {
  it('risolve icone dalle collezioni installate', () => {
    expect(resolveDataIcon('simple-icons:typescript')?.viewBox).toBe('0 0 24 24')
    expect(resolveDataIcon('lucide:database')?.nodes[0]?.tag).toBe('g')
  })

  it('restituisce null per icone o collezioni sconosciute', () => {
    expect(resolveDataIcon('simple-icons:non-esiste-davvero')).toBeNull()
    expect(resolveDataIcon('collezione-inesistente:x')).toBeNull()
  })
})
