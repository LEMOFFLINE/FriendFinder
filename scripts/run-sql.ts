import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Pool } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function runSqlFile(filePath: string) {
  if (!process.env.DATABASE_URL) {
    console.error('[v0] ✗ DATABASE_URL not found in environment')
    console.log('[v0] Please create .env.local with DATABASE_URL')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log(`[v0] Connecting to database...`)
    await pool.query('SELECT NOW()')
    console.log(`[v0] Connected successfully!`)

    console.log(`[v0] Reading SQL file: ${filePath}`)
    const sql = readFileSync(filePath, 'utf-8')

    console.log(`[v0] Executing SQL...`)
    await pool.query(sql)

    console.log(`[v0] ✓ SQL file executed successfully: ${filePath}`)
  } catch (error) {
    console.error(`[v0] ✗ Error executing SQL file:`, error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Get SQL file path from command line
const sqlFile = process.argv[2]
if (!sqlFile) {
  console.error('[v0] Usage: npm run db:init <path-to-sql-file>')
  process.exit(1)
}

runSqlFile(sqlFile)
