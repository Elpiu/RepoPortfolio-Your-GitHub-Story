import type { SvgIcon } from '~~/shared/utils/svg-icon'

const KEY = 'data-icons'

/** Carica le icone dei dati (payload della home). Da chiamare una volta nella pagina. */
export function useDataIcons() {
  return useAsyncData(KEY, () => $fetch<Record<string, SvgIcon>>('/api/data-icons'))
}

/** Le icone già caricate dalla pagina, senza una nuova richiesta (per i componenti figli). */
export function useLoadedDataIcons() {
  return useNuxtData<Record<string, SvgIcon>>(KEY).data
}
