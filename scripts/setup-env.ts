// Interactive script to help create .env.local file
import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

function encodePassword(password: string): string {
  // URL encode special characters in password
  return encodeURIComponent(password)
}

async function setup() {
  console.log('[v0] FriendFinder Database Setup')
  console.log('[v0] ================================\n')
  
  console.log('[v0] This will help you create the .env.local file\n')
  
  const host = await question('[v0] Database host [localhost]: ') || 'localhost'
  const port = await question('[v0] Database port [5432]: ') || '5432'
  const user = await question('[v0] Database user [postgres]: ') || 'postgres'
  const password = await question('[v0] Database password: ')
  const database = await question('[v0] Database name [friendfinder]: ') || 'friendfinder'
  
  if (!password) {
    console.error('[v0] ✗ Password cannot be empty!')
    rl.close()
    process.exit(1)
  }
  
  // Encode password for URL
  const encodedPassword = encodePassword(password)
  
  if (password !== encodedPassword) {
    console.log(`\n[v0] Note: Your password contains special characters`)
    console.log(`[v0] Original: ${password}`)
    console.log(`[v0] Encoded: ${encodedPassword}`)
  }
  
  const databaseUrl = `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}`
  
  console.log('\n[v0] Generated DATABASE_URL:')
  console.log(`[v0] ${databaseUrl}\n`)
  
  const confirm = await question('[v0] Create .env.local file with this configuration? (y/n): ')
  
  if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = `DATABASE_URL=${databaseUrl}\n`
    
    try {
      fs.writeFileSync(envPath, envContent, 'utf-8')
      console.log('[v0] ✓ .env.local file created successfully!')
      console.log('\n[v0] Next steps:')
      console.log('[v0] 1. Make sure the friendfinder database exists in PostgreSQL')
      console.log('[v0] 2. Run: npm run db:check')
      console.log('[v0] 3. Run: npm run db:setup')
    } catch (error) {
      console.error('[v0] ✗ Error creating .env.local:', error)
      process.exit(1)
    }
  } else {
    console.log('[v0] Setup cancelled.')
  }
  
  rl.close()
}

setup()
