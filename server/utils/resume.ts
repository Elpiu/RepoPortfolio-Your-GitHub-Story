import type { Profile } from '~~/shared/schemas/profile'
import type { SiteConfig } from '~~/shared/schemas/site'
import type { Repository } from '~~/shared/types'
import { profileAvatarUrl } from '~~/shared/utils/profile'
import { featuredRepositories } from '~~/shared/utils/repo'

type ResumeDate = string

export type ResumeProject = {
  name: string
  description: string
  keywords: string[]
  url: string
}

export type Resume = {
  basics: {
    name: string
    label: string
    image?: string
    email: string
    phone?: string
    url: string
    summary: string
    location?: { city: string }
    profiles: Array<{ network: string; username: string; url: string }>
  }
  work: Array<{
    name: string
    position: string
    url?: string
    startDate: ResumeDate
    endDate?: ResumeDate
    summary: string
    highlights: string[]
    location?: string
  }>
  education: Array<{
    institution: string
    area: string
    studyType: string
    startDate: ResumeDate
    endDate?: ResumeDate
    summary: string
    location?: string
  }>
  skills: Array<{ name: string; keywords: string[] }>
  projects: ResumeProject[]
  meta: {
    version: string
    canonical: string
    lastModified: string
  }
}

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
}

export function buildResume(
  profile: Profile,
  site: SiteConfig,
  repositories: readonly Repository[],
  context: { username: string; siteUrl: string; syncedAt: string },
): Resume {
  const siteUrl = normalizeSiteUrl(context.siteUrl)
  const avatar = profileAvatarUrl(profile.meta.avatarUrl, context.username)

  const profiles: Resume['basics']['profiles'] = []
  if (context.username) {
    profiles.push({
      network: 'GitHub',
      username: context.username,
      url: `https://github.com/${encodeURIComponent(context.username)}`,
    })
  }
  if (site.links.linkedin) {
    profiles.push({
      network: 'LinkedIn',
      username: site.links.linkedin,
      url: site.links.linkedin,
    })
  }

  const work = profile.experiences
    .filter((experience) => experience.type === 'work')
    .sort((left, right) => right.start.localeCompare(left.start))
    .map((experience) => ({
      name: experience.organization,
      position: experience.title,
      startDate: `${experience.start}-01`,
      ...(experience.end ? { endDate: `${experience.end}-01` } : {}),
      summary: experience.description,
      highlights: experience.highlights,
      location: experience.location,
    }))

  const education = profile.experiences
    .filter((experience) => experience.type === 'education')
    .sort((left, right) => right.start.localeCompare(left.start))
    .map((experience) => ({
      institution: experience.organization,
      area: experience.title,
      studyType: 'degree',
      startDate: `${experience.start}-01`,
      ...(experience.end ? { endDate: `${experience.end}-01` } : {}),
      summary: experience.description,
      location: experience.location,
    }))

  const projects = featuredRepositories(repositories, 6).map((repository) => ({
    name: repository.name,
    description: repository.description ?? '',
    keywords: [...repository.topics, ...(repository.language ? [repository.language] : [])],
    url: repository.url,
  }))

  return {
    basics: {
      name: profile.meta.fullName,
      label: profile.meta.role,
      ...(avatar ? { image: avatar } : {}),
      email: site.links.email,
      ...(site.links.phone ? { phone: site.links.phone } : {}),
      url: site.links.website ?? siteUrl,
      summary: profile.about.paragraphs.join(' '),
      ...(profile.meta.location ? { location: { city: profile.meta.location } } : {}),
      profiles,
    },
    work,
    education,
    skills: profile.skills.groups.map((group) => ({
      name: group.label,
      keywords: group.items.map((item) => item.name),
    })),
    projects,
    meta: {
      version: 'v1.0.0',
      canonical: siteUrl,
      lastModified: context.syncedAt,
    },
  }
}
