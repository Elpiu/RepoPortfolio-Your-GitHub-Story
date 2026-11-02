/** Icona di marca (collezione Iconify locale) per il linguaggio principale di un repository. */
const LANGUAGE_ICONS: Record<string, string> = {
  TypeScript: 'simple-icons:typescript',
  JavaScript: 'simple-icons:javascript',
  Vue: 'simple-icons:vuedotjs',
  Java: 'simple-icons:openjdk',
  Python: 'simple-icons:python',
  Go: 'simple-icons:go',
  Rust: 'simple-icons:rust',
  HTML: 'simple-icons:html5',
  CSS: 'simple-icons:css',
  PHP: 'simple-icons:php',
  C: 'simple-icons:c',
  'C++': 'simple-icons:cplusplus',
  'C#': 'simple-icons:dotnet',
  Shell: 'simple-icons:gnubash',
  Dockerfile: 'simple-icons:docker',
  Kotlin: 'simple-icons:kotlin',
  Swift: 'simple-icons:swift',
  Dart: 'simple-icons:dart',
  Ruby: 'simple-icons:ruby',
}

export function languageIconName(language: string | null): string | null {
  return language ? (LANGUAGE_ICONS[language] ?? null) : null
}
