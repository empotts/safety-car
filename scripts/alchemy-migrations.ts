import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

// Alchemy beta.87 rejects Drizzle v0 metadata. Stage flat SQL while keeping
// Drizzle's generation history and the migration filenames/bytes intact.
export function prepareAlchemyMigrations() {
  const source = './drizzle/migrations'
  const target = './.alchemy/sql-migrations'

  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (entry.isFile() && entry.name.endsWith('.sql')) {
      copyFileSync(join(source, entry.name), join(target, entry.name))
    }
  }
  return target
}
