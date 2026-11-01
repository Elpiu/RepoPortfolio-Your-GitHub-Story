import { existsSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

export const DATA_DIR_ENV = 'PORTFOLIO_DATA_DIR'
export const DEFAULT_DATA_DIR = 'data'

/**
 * Cartella dei dati owner: `data/` per default, oppure `PORTFOLIO_DATA_DIR`
 * (relativa alla root del progetto o assoluta).
 *
 * @param {string} [rootDir]
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string} percorso assoluto
 */
export function resolveDataDir(rootDir = process.cwd(), env = process.env) {
  const configured = env[DATA_DIR_ENV]?.trim() || DEFAULT_DATA_DIR
  const directory = isAbsolute(configured) ? configured : resolve(rootDir, configured)

  if (!existsSync(resolve(directory, 'site.json'))) {
    throw new Error(
      `[data-dir] "${configured}" non contiene site.json. Controlla ${DATA_DIR_ENV} (default "${DEFAULT_DATA_DIR}").`,
    )
  }

  return directory
}

/**
 * Legge `--data <dir>` o `--data=<dir>` dagli argomenti della CLI.
 *
 * @param {readonly string[]} argv
 * @returns {string | null}
 */
export function parseDataDirArg(argv) {
  for (const [index, arg] of argv.entries()) {
    if (arg.startsWith('--data=')) return arg.slice('--data='.length) || null
    if (arg === '--data') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) {
        throw new Error('[data-dir] --data richiede una cartella, es. --data datasets/me')
      }
      return value
    }
  }
  return null
}
