import { Pool, type QueryResult } from "pg"

// Singleton pool instance
let pool: Pool | null = null

// Get or create database pool
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/friendfinder",
      max: 10, // Reduced from 20 to save memory
      idleTimeoutMillis: 60000, // Increased from 30s to 60s
      connectionTimeoutMillis: 10000, // Increased from 2s to 10s for slow server
      statement_timeout: 30000, // 30 second query timeout
    })

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
      pool = null
    })
  }

  return pool
}

// Query helper function
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const pool = getPool()
  const start = Date.now()

  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start
    if (duration > 1000) {
      console.warn("Slow query detected:", duration, "ms")
    }
    return result
  } catch (error) {
    console.error("Query error:", error)
    throw error
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
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
export type { QueryResult } from "pg"
