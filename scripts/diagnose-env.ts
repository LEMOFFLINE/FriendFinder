import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

console.log('[v0] Diagnosing .env.local file...\n')

const projectRoot = process.cwd()
const envPath = resolve(projectRoot, '.env.local')

console.log('[v0] Project root:', projectRoot)
console.log('[v0] Looking for .env.local at:', envPath)
console.log('[v0] File exists:', existsSync(envPath))

if (existsSync(envPath)) {
  console.log('\n[v0] File content (first 100 chars):')
  const content = readFileSync(envPath, 'utf-8')
  console.log(content.substring(0, 100))
  console.log('\n[v0] File size:', content.length, 'bytes')
  
  // Check for DATABASE_URL
  const lines = content.split('\n')
  const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL'))
  if (dbUrlLine) {
    console.log('[v0] DATABASE_URL line found:', dbUrlLine.substring(0, 50) + '...')
  } else {
    console.log('[v0] DATABASE_URL line NOT found in file')
  }
  
  console.log('\n[v0] Environment variable check:')
  console.log('[v0] process.env.DATABASE_URL exists:', !!process.env.DATABASE_URL)
  if (process.env.DATABASE_URL) {
    console.log('[v0] ✓ .env.local loaded successfully!')
  } else {
    console.log('[v0] ✗ .env.local file exists but environment variable not loaded')
  }
} else {
  console.log('\n[v0] ✗ File does not exist!')
  console.log('[v0] Please create it with the following content:\n')
  console.log('DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/friendfinder')
  console.log('\n[v0] Make sure:')
  console.log('  1. The file is named exactly ".env.local" (no .txt extension)')
  console.log('  2. It is in the project root directory')
  console.log('  3. You can create it using: notepad .env.local')
}
