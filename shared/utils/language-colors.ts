const KNOWN_LANGUAGE_COLORS: Record<string, string> = {
  C: '#555555',
  'C#': '#178600',
  'C++': '#f34b7d',
  CSS: '#563d7c',
  Clojure: '#db5855',
  Dart: '#00B4AB',
  Dockerfile: '#384d54',
  Elixir: '#6e4a7e',
  Go: '#00ADD8',
  HTML: '#e34c26',
  Haskell: '#5e5086',
  Java: '#b07219',
  JavaScript: '#f1e05a',
  'Jupyter Notebook': '#DA5B0B',
  Kotlin: '#A97BFF',
  Lua: '#000080',
  MDX: '#fcb32c',
  Nix: '#7e7eff',
  'Objective-C': '#438eff',
  PHP: '#4F5D95',
  Perl: '#0298c3',
  Python: '#3572A5',
  R: '#198CE7',
  Ruby: '#701516',
  Rust: '#dea584',
  SCSS: '#c6538c',
  Scala: '#c22d40',
  Shell: '#89e051',
  Svelte: '#ff3e00',
  Swift: '#F05138',
  TypeScript: '#3178c6',
  Vue: '#41b883',
  Astro: '#ff5a03',
}

const FALLBACK_COLORS = [
  '#6b7280',
  '#71717a',
  '#78716c',
  '#64748b',
  '#475569',
  '#52525b',
  '#57534e',
  '#3f3f46',
]

export function languageColor(name: string): string {
  const known = KNOWN_LANGUAGE_COLORS[name]
  if (known) return known

  let hash = 0
  for (const character of name) {
    hash = (hash * 31 + character.codePointAt(0)!) >>> 0
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]!
}
