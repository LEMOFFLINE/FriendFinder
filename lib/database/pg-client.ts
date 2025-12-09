import { Pool, QueryResult } from 'pg'

// Singleton pool instance
let pool: Pool | null = null

// Get or create database pool
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/friendfinder',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    })

    // Error handler
    pool.on('error', (err) => {
      console.error('[v0] Unexpected error on idle client', err)
    })
  }

  return pool
}

// Query helper function
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const pool = getPool()
  console.log('[v0] Executing query:', text.substring(0, 100))
  const start = Date.now()
  
  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start
    console.log('[v0] Query executed in', duration, 'ms')
    return result
  } catch (error) {
    console.error('[v0] Query error:', error)
    throw error
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Close pool (useful for graceful shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Export types for convenience
export type { QueryResult } from 'pg'
