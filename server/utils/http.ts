const REQUEST_TIMEOUT_MS = 5_000

function withTimeout(): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  }
}

export async function fetchText(
  url: string,
  options: { maxBytes?: number; method?: 'GET' | 'HEAD' } = {},
): Promise<string | null> {
  const { signal, clear } = withTimeout()
  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      signal,
      headers: { 'User-Agent': 'RepoPortfolio' },
      redirect: 'follow',
    })
    if (!response.ok) return null
    if (options.method === 'HEAD') return ''
    const text = await response.text()
    const maxBytes = options.maxBytes ?? 200_000
    return text.length > maxBytes ? text.slice(0, maxBytes) : text
  } catch {
    return null
  } finally {
    clear()
  }
}

export async function headOk(url: string): Promise<boolean> {
  const { signal, clear } = withTimeout()
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal,
      headers: { 'User-Agent': 'RepoPortfolio' },
      redirect: 'follow',
    })
    return response.ok
  } catch {
    return false
  } finally {
    clear()
  }
}
