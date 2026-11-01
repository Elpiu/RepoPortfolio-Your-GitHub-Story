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

  it('evidenzia il codice con Shiki a build time', async () => {
    const { html } = await renderReadme('```js\nconst x = 1\n```', repository, 'Elpiu')
    expect(html).toContain('class="shiki')
    expect(html).toContain('--shiki-dark')
  })
})
