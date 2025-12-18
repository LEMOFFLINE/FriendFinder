import { config } from 'dotenv'
import { resolve } from 'path'
import { getPool } from '../lib/database/pg-client'

config({ path: resolve(process.cwd(), '.env.local') })

async function verifyDatabase() {
  console.log('[v0] Verifying database connection...')
  
  const pool = getPool()
  
  try {
    // Test connection
    const result = await pool.query('SELECT NOW()')
    console.log('[v0] ✓ Database connection successful')
    console.log('[v0] Server time:', result.rows[0].now)
    
    // Check tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log('[v0] ✓ Found', tables.rows.length, 'tables:')
    tables.rows.forEach(row => {
      console.log('  -', row.table_name)
    })
    
    // Check test users
    const users = await pool.query('SELECT email, name FROM users LIMIT 5')
    console.log('[v0] ✓ Found', users.rows.length, 'test users:')
    users.rows.forEach(user => {
      console.log('  -', user.name, `(${user.email})`)
    })
    
    console.log('[v0] ✓ Database verification complete!')
    process.exit(0)
  } catch (error) {
    console.error('[v0] ✗ Database verification failed:', error)
    process.exit(1)
  }
}

verifyDatabase()
