import "dotenv/config"
import { config } from "dotenv"
import { resolve } from "path"
import pkg from "pg"
const { Client } = pkg

config({ path: resolve(process.cwd(), ".env.local") })

async function resetDatabase() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error("[v0] DATABASE_URL not found in .env.local")
    process.exit(1)
  }

  // Extract database name from connection string
  const dbName = connectionString.split("/").pop()?.split("?")[0]

  // Connect to postgres database (not friendfinder)
  const postgresUrl = connectionString.replace(`/${dbName}`, "/postgres")

  const client = new Client({ connectionString: postgresUrl })

  try {
    await client.connect()
    console.log("[v0] Connected to PostgreSQL server")

    // Terminate all connections to target database
    console.log(`[v0] Terminating connections to ${dbName}...`)
    await client.query(
      `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid();
    `,
      [dbName],
    )

    // Drop database
    console.log(`[v0] Dropping database ${dbName}...`)
    await client.query(`DROP DATABASE IF EXISTS ${dbName}`)

    // Recreate database
    console.log(`[v0] Creating database ${dbName}...`)
    await client.query(`CREATE DATABASE ${dbName}`)

    console.log("[v0] Database reset complete!")
    console.log("[v0] Initializing tables...")

    // Close connection to postgres db
    await client.end()

    // Reconnect to friendfinder db
    const friendfinderClient = new Client({ connectionString })
    await friendfinderClient.connect()

    // Run initialization scripts
    const fs = await import("fs")
    const path = await import("path")

    const scriptFiles = [
      "001_init_database.sql",
      "002_create_functions.sql",
      "003_seed_test_data.sql",
      "005_add_groups_and_messages.sql",
      "006_add_user_nicknames.sql",
      "007_add_group_invitations.sql",
    ]

    for (const file of scriptFiles) {
      const scriptPath = path.resolve(process.cwd(), "scripts/db", file)
      if (fs.existsSync(scriptPath)) {
        console.log(`[v0] Running ${file}...`)
        const sql = fs.readFileSync(scriptPath, "utf-8")
        await friendfinderClient.query(sql)
      }
    }

    await friendfinderClient.end()
    console.log("[v0] Database initialization complete!")
  } catch (error) {
    console.error("[v0] Error resetting database:", error)
    process.exit(1)
  }
}

resetDatabase()
