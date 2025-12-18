# FriendFinder

**Live Demo:** [http://121.196.228.85](http://121.196.228.85)

A full-stack social networking platform built with Next.js 16 and PostgreSQL. This is a group project led and primarily developed by **LEMOFFLINE**.

## About

FriendFinder is a modern social media application that enables users to connect with friends, share posts, join groups, and communicate through real-time messaging. The platform features interest-based friend recommendations, privacy controls, and a responsive user interface.

### Key Features

- User authentication with secure password hashing
- Post creation with multi-image upload and privacy settings
- Friend system with request/accept/reject functionality
- Interest-based user recommendations
- One-on-one and group messaging
- User profiles with customizable avatars and interests
- Group management with invite system
- Real-time notifications

## Tech Stack

- **Frontend:** React 19.2, Next.js 16, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL 17
- **UI Components:** shadcn/ui, Radix UI
- **Deployment:** Apache reverse proxy with PM2

## Prerequisites

Before running this project locally, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** 17.x installed and running
- **pgAdmin 4** (recommended for database management)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd friendfinder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create Database

Open pgAdmin 4 and create a new database:

1. Launch pgAdmin 4
2. Connect to your PostgreSQL 17 server
3. Right-click on "Databases"
4. Select "Create" → "Database"
5. Enter database name: `friendfinder`
6. Click "Save"

#### Configure Environment Variables

Run the interactive setup tool:

```bash
npm run db:setup-env
```

Follow the prompts to configure your database connection:
- Database host: `localhost` (press Enter for default)
- Database port: `5432` (press Enter for default)
- Database user: `postgres` (press Enter for default)
- Database password: Enter your PostgreSQL password
- Database name: `friendfinder` (press Enter for default)

This will create a `.env.local` file with your database configuration.

#### Verify Database Connection

```bash
npm run db:check
```

You should see "Connection successful" and your PostgreSQL version.

#### Initialize Database

Create all tables, indexes, and seed test data:

```bash
npm run db:setup
```

This script will:
- Create database schema (users, posts, friendships, groups, messages, etc.)
- Set up database functions and triggers
- Seed test data with 5 demo users

#### Verify Database Setup

```bash
npm run db:verify
```

You should see confirmation that all tables are created and populated.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Accounts

After database initialization, you can log in with these test accounts:

- **Email:** john@example.com | **Password:** password123
- **Email:** jane@example.com | **Password:** password123
- **Email:** bob@example.com | **Password:** password123
- **Email:** alice@example.com | **Password:** password123
- **Email:** charlie@example.com | **Password:** password123

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:setup` - Initialize database with schema and test data
- `npm run db:reset` - Drop all tables and reset database
- `npm run db:verify` - Verify database setup
- `npm run db:check` - Check database connection

## Project Structure

```
friendfinder/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (pages)/           # Application pages
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # UI component library
├── lib/                   # Utilities and services
│   └── database/         # Database services
├── scripts/              # Database and setup scripts
│   └── db/              # SQL initialization scripts
└── public/              # Static assets
```

## Troubleshooting

### Database Connection Issues

If you encounter connection errors:
1. Verify PostgreSQL is running
2. Check `.env.local` file exists and contains correct credentials
3. Run `npm run db:check` to test connection
4. Ensure database `friendfinder` exists in pgAdmin

### Port Already in Use

If port 3000 is occupied:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Missing Dependencies

If you encounter module errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

This project is for educational purposes as part of a university course assignment.

## Contributors

- **LEMOFFLINE** - Team Leader & Primary Developer
- Group project with collaborative contributions
