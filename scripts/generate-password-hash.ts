import { createHash } from 'crypto';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const password = 'test123';

function generateHash(pwd: string): string {
  return createHash('sha256').update(pwd).digest('hex');
}

console.log('[v0] Generating SHA256 hex hash for password:', password);
const hash = generateHash(password);
console.log('[v0] Generated hash:', hash);
console.log('\n[v0] Use this hash in your SQL UPDATE statement');
console.log('\n[v0] For reference:');
console.log(`  password: ${password}`);
console.log(`  hash: ${hash}`);
