import { describe, expect, it } from 'vitest'
import { renderReadme } from '../../server/utils/readme'
import { fixtureRepositories } from '../helpers/repositories'

const repository = fixtureRepositories().find((entry) => entry.name === 'alpha')!

describe('renderReadme', () => {
  it('rimuove script, iframe e handler inline', async () => {
    const { html } = await renderReadme(
      '<script>alert(1)</script><iframe src="https://example.com"></iframe><img src="x" onerror="alert(1)">',
      repository,
      'Elpiu',
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('onerror')
  })

  it('risolve le immagini relative sul raw del branch di default', async () => {
    const { html } = await renderReadme('![x](img/a.png)', repository, 'Elpiu')
    expect(html).toContain('https://raw.githubusercontent.com/Elpiu/alpha/develop/img/a.png')
  })

  it('rende i link esterni e relativi sicuri', async () => {
    const external = await renderReadme('[x](https://example.com)', repository, 'Elpiu')
    expect(external.html).toContain('rel="noopener noreferrer"')
    expect(external.html).toContain('target="_blank"')

    const relative = await renderReadme('[x](docs/guide.md)', repository, 'Elpiu')
    expect(relative.html).toContain('https://github.com/Elpiu/alpha/blob/develop/docs/guide.md')
  })

  it('demota i titoli del README sotto l h1 della pagina', async () => {
    const { html, headings } = await renderReadme('# Title\n\n## Section', repository, 'Elpiu')
    expect(html).toContain('<h2 id="title">')
    expect(html).toContain('<h3 id="section">')
    expect(headings).toEqual([{ id: 'section', text: 'Section', level: 3 }])
  })

  it('ogni colore della sintassi passa AA sul proprio sfondo, in entrambi i temi', async () => {
    const code = [
      '```ts',
      '// commento',
      "import { x } from './y'",
      'export const answer: number = 42 // altro commento',
      'function f(value: string) { return `${value}!` }',
      'class A<T> extends B { private y = /re/g; z = null }',
      '```',
      '```python',
      '# commento',
      'def f(a, b=1): return "x" + str(a)',
      '```',
      '```bash',
      '# commento',
      'export X="y"; echo "$X" | grep -v z',
      '```',
    ].join('\n')
    const { html } = await renderReadme(code, repository, 'Elpiu')

    const luminance = (hex: string) => {
      const channels = [1, 3, 5]
        .map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
        .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
      return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
    }
    const contrast = (left: string, right: string) => {
      const [high, low] = [luminance(left), luminance(right)].sort((a, b) => b - a)
      return (high! + 0.05) / (low! + 0.05)
    }

    for (const theme of ['light', 'dark']) {
      const background = html.match(new RegExp(`--shiki-${theme}-bg:\\s*(#[0-9a-fA-F]{6})`))?.[1]
      expect(background, theme).toBeTruthy()
      const colors = [
        ...html.matchAll(new RegExp(`--shiki-${theme}:\\s*(#[0-9a-fA-F]{6})`, 'g')),
      ].map((match) => match[1]!)
      expect(colors.length).toBeGreaterThan(5)
      for (const color of new Set(colors)) {
        expect(contrast(color, background!), `${theme} ${color}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('evidenzia il codice con Shiki a build time', async () => {
    const { html } = await renderReadme('```js\nconst x = 1\n```', repository, 'Elpiu')
    expect(html).toContain('class="shiki')
    expect(html).toContain('--shiki-dark')
  })
})
