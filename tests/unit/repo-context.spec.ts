import { describe, expect, it } from 'vitest'
import { parseGitHubRemote, resolveSiteUrls } from '../../scripts/repo-context.mjs'

describe('parseGitHubRemote', () => {
  it('legge remote HTTPS e SSH', () => {
    expect(parseGitHubRemote('https://github.com/me/portfolio.git')).toEqual({
      owner: 'me',
      repo: 'portfolio',
    })
    expect(parseGitHubRemote('git@github.com:me/portfolio.git')).toEqual({
      owner: 'me',
      repo: 'portfolio',
    })
  })

  it('rifiuta remote non GitHub', () => {
    expect(() => parseGitHubRemote('https://gitlab.com/me/portfolio.git')).toThrow()
  })
})

describe('resolveSiteUrls', () => {
  it('project site', () => {
    expect(resolveSiteUrls({ owner: 'me', repo: 'portfolio' }, null).baseURL).toBe('/portfolio/')
  })

  it('user site', () => {
    expect(resolveSiteUrls({ owner: 'Me', repo: 'me.github.io' }, null).baseURL).toBe('/')
  })

  it('dominio custom', () => {
    expect(resolveSiteUrls({ owner: 'me', repo: 'portfolio' }, 'cv.example.com')).toEqual({
      baseURL: '/',
      siteUrl: 'https://cv.example.com/',
    })
  })
})
