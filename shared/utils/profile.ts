/** Avatar del profilo: quello configurato in `meta.avatarUrl`, altrimenti l'avatar GitHub. */
export function profileAvatarUrl(avatarUrl: string | undefined, username: string): string | null {
  if (avatarUrl) return avatarUrl
  return username ? `https://avatars.githubusercontent.com/${encodeURIComponent(username)}` : null
}

export function githubProfileUrl(username: string): string | null {
  return username ? `https://github.com/${encodeURIComponent(username)}` : null
}
