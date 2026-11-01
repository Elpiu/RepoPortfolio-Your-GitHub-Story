import { profiles } from '#site-data'
import { resolveProfileIcons } from '../utils/data-icons'

// Prerenderizzato nel payload della home: le icone dei dati non pesano sul bundle JS.
export default defineEventHandler(() => resolveProfileIcons(profiles))
