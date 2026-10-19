/**
 * CC-only: bind the test GM auth user (TEST_GM_EMAIL in .env.local) to its own "Test GM (CC)" players row,
 * flagged is_gm, in the one campaign. Never touches Rodrigo's row, real players' rows or archived test rows.
 *
 * Usage: npx tsx scripts/auth/bind-test-gm.ts
 * Reads DATABASE_URL and TEST_GM_EMAIL from .env.local. One transaction. Prints no secrets. Idempotent.
 */

import postgres from 'postgres'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local'), quiet: true })

const ROW_NAME = 'Test GM (CC)'

async function main() {
  const email = process.env.TEST_GM_EMAIL?.trim().toLowerCase()
  if (!email) { console.error('TEST_GM_EMAIL is not set in .env.local'); process.exit(1) }
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is not set in .env.local'); process.exit(1) }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 })
  try {
    await sql.begin(async txn => {
      const tx = txn as unknown as postgres.Sql // postgres' TransactionSql loses its call signature under Omit<>
      const users = await tx<{ id: string }[]>`select id from auth.users where lower(email) = ${email}`
      if (users.length !== 1) throw new Error('Expected exactly one auth user for TEST_GM_EMAIL.')
      const userId = users[0].id

      const taken = await tx<{ display_name: string }[]>`select display_name from players where user_id = ${userId} and display_name <> ${ROW_NAME}`
      if (taken.length > 0) throw new Error('That auth user is already bound to a different players row. Stopping.')

      const campaigns = await tx<{ id: string }[]>`select id from campaigns limit 1`
      if (campaigns.length !== 1) throw new Error('Expected exactly one campaign.')

      const rows = await tx<{ id: string }[]>`select id from players where display_name = ${ROW_NAME}`
      if (rows.length > 1) throw new Error('More than one Test GM (CC) row. Stopping.')
      if (rows.length === 0) {
        await tx`insert into players (display_name, campaign_id, is_gm, user_id) values (${ROW_NAME}, ${campaigns[0].id}, true, ${userId})`
        console.log('Created the "Test GM (CC)" players row and bound the test GM.')
      } else {
        await tx`update players set is_gm = true, user_id = ${userId}, campaign_id = ${campaigns[0].id} where id = ${rows[0].id}`
        console.log('Updated the existing "Test GM (CC)" players row.')
      }
    })
  } finally {
    await sql.end()
  }
}

main().catch(e => { console.error(String(e instanceof Error ? e.message : e)); process.exit(1) })
