import { z } from 'zod'

const isoMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Formato atteso: YYYY-MM')

const httpsUrl = z.string().url().startsWith('https://')

export const skillItemSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1).optional(),
})

export const skillGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  items: z.array(skillItemSchema).min(1),
})

export const experienceSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(['work', 'education']),
    title: z.string().min(1),
    organization: z.string().min(1),
    location: z.string().min(1),
    start: isoMonth,
    end: isoMonth.nullable(),
    description: z.string().min(1),
    highlights: z.array(z.string().min(1)).default([]),
  })
  .refine((experience) => experience.end === null || experience.end >= experience.start, {
    message: 'La data di fine deve essere successiva alla data di inizio',
    path: ['end'],
  })

export const milestoneSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['repo', 'release', 'milestone']),
  date: isoMonth,
  title: z.string().min(1),
  description: z.string().min(1),
  repo: z.string().min(1).optional(),
  link: z.string().url().optional(),
  tags: z.array(z.string().min(1)).default([]),
})

/** Letture: sezione opzionale, nascosta se la lista è vuota. */
export const bookSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1).optional(),
  status: z.enum(['read', 'reading']).default('read'),
  note: z.string().min(1).max(280).optional(),
  url: httpsUrl.optional(),
  // Immagine remota non GitHub: eccezione opt-in a ADR-013, voluta dall'owner.
  cover: httpsUrl.optional(),
})

export const profileSchema = z.object({
  $schema: z.string().optional(),
  locale: z.string().min(2),
  meta: z.object({
    name: z.string().min(1),
    fullName: z.string().min(1),
    role: z.string().min(1),
    tagline: z.string().min(1),
    avatarUrl: httpsUrl.optional(),
    location: z.string().min(1).optional(),
    available: z.boolean().default(false),
    availability: z.string().min(1).optional(),
  }),
  about: z.object({
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  skills: z
    .object({
      groups: z.array(skillGroupSchema).default([]),
    })
    .default({ groups: [] }),
  experiences: z.array(experienceSchema).default([]),
  milestones: z.array(milestoneSchema).default([]),
  books: z.array(bookSchema).default([]),
})

export type Profile = z.infer<typeof profileSchema>
export type Book = z.infer<typeof bookSchema>
export type Experience = z.infer<typeof experienceSchema>
export type Milestone = z.infer<typeof milestoneSchema>
export type SkillGroup = z.infer<typeof skillGroupSchema>
export type SkillItem = z.infer<typeof skillItemSchema>
