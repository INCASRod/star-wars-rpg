/**
 * Bind a signed-in auth user to the campaign's GM `players` row, so public.is_gm() is true for them.
 *
 * Usage (after you have logged in once at /login with that email):
 *   npx tsx scripts/auth/make-gm.ts you@example.com
 *
 * Reads DATABASE_URL from .env.local. One transaction. Prints no secrets.
 * Stops without changing anything if the GM row cannot be identified unambiguously.
 */

import postgres from 'postgres'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') })

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) { console.error('Usage: npx tsx scripts/auth/make-gm.ts <email>'); process.exit(1) }
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is not set in .env.local'); process.exit(1) }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 })
  try {
    await sql.begin(async txn => {
      const tx = txn as unknown as postgres.Sql // postgres' TransactionSql loses its call signature under Omit<>
      const users = await tx<{ id: string }[]>`select id from auth.users where lower(email) = ${email}`
      if (users.length !== 1) {
        throw new Error(users.length === 0
          ? `No auth user with that email. Log in once at /login first, then re-run.`
          : `More than one auth user matches that email. Stopping.`)
      }
      const userId = users[0].id

      // The GM row: flagged is_gm and either unbound or already bound to this same user.
      // (CC's test GM row is bound to its own user, so it never matches here.)
      const rows = await tx<{ id: string; display_name: string; campaign_id: string; user_id: string | null }[]>`
        select id, display_name, campaign_id, user_id from players
        where is_gm = true and (user_id is null or user_id = ${userId})`
      if (rows.length === 0) throw new Error('No unbound players row is flagged is_gm. Stopping; nothing changed.')
      if (rows.length > 1) throw new Error(`${rows.length} players rows are flagged is_gm and unbound. Stopping; nothing changed.`)

      const row = rows[0]
      if (row.user_id === userId) { console.log(`Already bound: "${row.display_name}" is this account's GM row.`); return }
      await tx`update players set user_id = ${userId} where id = ${row.id}`
      console.log(`Bound the GM row "${row.display_name}" to ${email}. is_gm() is now true for that account.`)
    })
  } finally {
    await sql.end()
  }
}

main().catch(e => { console.error(String(e instanceof Error ? e.message : e)); process.exit(1) })
