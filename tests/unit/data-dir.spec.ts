import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { parseDataDirArg, resolveDataDir } from '../../scripts/data-dir.mjs'

const root = mkdtempSync(join(tmpdir(), 'rp-data-dir-'))
mkdirSync(join(root, 'data'))
writeFileSync(join(root, 'data', 'site.json'), '{}')
mkdirSync(join(root, 'datasets', 'me'), { recursive: true })
writeFileSync(join(root, 'datasets', 'me', 'site.json'), '{}')

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe('resolveDataDir', () => {
  it('usa data/ per default', () => {
    expect(resolveDataDir(root, {})).toBe(resolve(root, 'data'))
  })

  it('ignora una variabile vuota', () => {
    expect(resolveDataDir(root, { PORTFOLIO_DATA_DIR: '  ' })).toBe(resolve(root, 'data'))
  })

  it('risolve PORTFOLIO_DATA_DIR relativo alla root', () => {
    expect(resolveDataDir(root, { PORTFOLIO_DATA_DIR: 'datasets/me' })).toBe(
      resolve(root, 'datasets', 'me'),
    )
  })

  it('fallisce con un messaggio chiaro se manca site.json', () => {
    expect(() => resolveDataDir(root, { PORTFOLIO_DATA_DIR: 'missing' })).toThrow(
      /non contiene site\.json/,
    )
  })
})

describe('parseDataDirArg', () => {
  it('legge --data <dir> e --data=<dir>', () => {
    expect(parseDataDirArg(['--other', '--data', 'datasets/me'])).toBe('datasets/me')
    expect(parseDataDirArg(['--data=datasets/me'])).toBe('datasets/me')
  })

  it('restituisce null senza flag e fallisce senza valore', () => {
    expect(parseDataDirArg(['--other'])).toBeNull()
    expect(() => parseDataDirArg(['--data', '--other'])).toThrow(/richiede una cartella/)
  })
})
