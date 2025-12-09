# Database Migration Guide

## Overview

This project has been migrated from localStorage to a structured database design. The current implementation uses localStorage as a temporary storage layer with a database-like API, making it easy to migrate to a real database (PostgreSQL) when deploying to production.

## Database Architecture

### Current State (Development)
- **Storage**: localStorage (browser-based)
- **API Layer**: Database client (`lib/database/client.ts`)
- **Services**: Business logic layer (`lib/database/services/`)
- **Schema**: TypeScript types matching PostgreSQL schema

### Production Ready
- **Storage**: PostgreSQL on your Aliyun server
- **API Layer**: Same interface, different implementation
- **Services**: No changes needed
- **Schema**: SQL tables defined in database design documents

## Key Components

### 1. Database Client (`lib/database/client.ts`)
- Provides unified API for all database operations
- Currently uses localStorage
- In production, replace with PostgreSQL client (e.g., `node-postgres` or Prisma)

### 2. Services Layer
- **UserService**: User registration, login, interests management
- **PostService**: Posts, comments, likes functionality
- **FriendshipService**: Friend requests and connections (to be implemented)

### 3. Schema (`lib/database/schema.ts`)
- TypeScript interfaces matching PostgreSQL tables
- Ensures type safety across the application

## Migration Checklist

### Completed
- ✅ Created database schema types
- ✅ Implemented database client with localStorage
- ✅ Created UserService with registration/login
- ✅ Created PostService with posts/comments/likes
- ✅ Generated utilities for ID generation

### In Progress
- ⏳ Migrate all pages to use new services
- ⏳ Remove direct localStorage access
- ⏳ Update Feed page to use PostService
- ⏳ Update authentication flow

### To Do
- 🔲 Implement FriendshipService
- 🔲 Implement NotificationService
- 🔲 Implement MessageService
- 🔲 Migrate all remaining pages
- 🔲 Create SQL migration scripts
- 🔲 Deploy PostgreSQL database
- 🔲 Replace localStorage client with PostgreSQL client

## How to Deploy to Production

### Step 1: Setup PostgreSQL on Aliyun Server
\`\`\`bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb friendfinder

# Run migration scripts (from database design docs)
psql -U postgres -d friendfinder -f migrations/001_create_tables.sql
\`\`\`

### Step 2: Update Database Client
\`\`\`typescript
// Replace lib/database/client.ts with PostgreSQL implementation
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

class DatabaseClient {
  async getUsers() {
    const result = await pool.query('SELECT * FROM users')
    return result.rows
  }
  // ... other methods
}
\`\`\`

### Step 3: Update Environment Variables
\`\`\`env
DATABASE_URL=postgresql://username:password@your-server:5432/friendfinder
\`\`\`

### Step 4: Deploy
- Build the application: `npm run build`
- Deploy to your Aliyun server
- Run with PM2: `pm2 start npm --name friendfinder -- start`

## API Comparison

### Current (localStorage)
\`\`\`typescript
const users = db.getUsers()
\`\`\`

### Future (PostgreSQL)
\`\`\`typescript
const users = await pool.query('SELECT * FROM users')
\`\`\`

The service layer abstracts this difference, so application code doesn't need to change.

## Benefits of This Architecture

1. **Easy Testing**: Can run entire app without database setup
2. **Type Safety**: TypeScript ensures data consistency
3. **Clean Migration**: Just replace the client implementation
4. **Business Logic Isolation**: Services contain all logic
5. **Future Proof**: Ready for PostgreSQL, MongoDB, or any other database

## Next Steps

1. Complete migration of all pages to use services
2. Test thoroughly in development
3. Create SQL migration scripts
4. Setup PostgreSQL on server
5. Deploy with confidence
