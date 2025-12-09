import { config } from 'dotenv'
import { resolve } from 'path'
import { Pool } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkEnvironment() {
  console.log('[v0] Checking environment variables...')
  console.log('[v0] DATABASE_URL exists:', !!process.env.DATABASE_URL)
  
  if (!process.env.DATABASE_URL) {
    console.error('[v0] ✗ DATABASE_URL is not set in .env.local')
    console.log('[v0] Please create .env.local file with:')
    console.log('[v0] DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/friendfinder')
    process.exit(1)
  }

  // Parse the URL to check format
  try {
    const url = new URL(process.env.DATABASE_URL)
    console.log('[v0] Database host:', url.hostname)
    console.log('[v0] Database port:', url.port || '5432')
    console.log('[v0] Database name:', url.pathname.slice(1))
    console.log('[v0] Database user:', url.username)
    console.log('[v0] Password length:', url.password?.length || 0)
    
    if (!url.password) {
      console.error('[v0] ✗ Password is empty!')
      console.log('[v0] Make sure your DATABASE_URL includes the password')
      process.exit(1)
    }
  } catch (error) {
    console.error('[v0] ✗ Invalid DATABASE_URL format:', error)
    console.log('[v0] Expected format: postgresql://username:password@host:port/database')
    process.exit(1)
  }

  // Test connection
  console.log('\n[v0] Testing database connection...')
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    const result = await pool.query('SELECT NOW() as time, version() as version')
    console.log('[v0] ✓ Connection successful!')
    console.log('[v0] Server time:', result.rows[0].time)
    console.log('[v0] PostgreSQL version:', result.rows[0].version)
    
    // Check if database is empty or has tables
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    console.log('[v0] Tables in database:', tablesResult.rows[0].count)
    
    if (tablesResult.rows[0].count === '0') {
      console.log('[v0] Database is empty. Run "npm run db:setup" to initialize.')
    }
  } catch (error) {
    console.error('[v0] ✗ Connection failed:', error)
    console.log('\n[v0] Troubleshooting tips:')
    console.log('[v0] 1. Make sure PostgreSQL is running')
    console.log('[v0] 2. Check your password is correct')
    console.log('[v0] 3. If password has special characters (@, :, /, etc), encode them:')
    console.log('[v0]    Use encodeURIComponent() or replace manually')
    console.log('[v0]    Example: p@ss becomes p%40ss')
    process.exit(1)
  } finally {
    await pool.end()
  }
}

checkEnvironment()
