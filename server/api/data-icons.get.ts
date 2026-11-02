import { profiles } from '#site-data'
import { getGitHubDataset } from '../utils/dataset'
import { resolveDataIcons } from '../utils/data-icons'

// Prerenderizzato nel payload della home: le icone dei dati (competenze e
// linguaggi dei repository) non pesano sul bundle JS.
export default defineEventHandler(async () => {
  const dataset = await getGitHubDataset()
  return resolveDataIcons(profiles, dataset.repositories)
})
