# Test Accounts

## Default Test Users

All test accounts use the password: **`test123`**

| Email | Name | Age | Location | Bio |
|-------|------|-----|----------|-----|
| alice@test.com | Alice Chen | 22 | Hangzhou | Photography and travel enthusiast |
| bob@test.com | Bob Wang | 23 | Shanghai | Music lover, guitarist |
| carol@test.com | Carol Li | 21 | Beijing | Computer science major, AI research |
| david@test.com | David Zhang | 24 | Shenzhen | Entrepreneur, tech enthusiast |
| emma@test.com | Emma Liu | 20 | Hangzhou | Food explorer, designer |

## How to View Database in pgAdmin 4

1. **Open pgAdmin 4**
2. **Expand the server tree**:
   - Servers > PostgreSQL 17 > Databases > friendfinder
3. **View tables**:
   - Right-click on "Tables" > Refresh
   - You'll see all tables: users, posts, comments, etc.
4. **View data**:
   - Right-click on "users" table > View/Edit Data > All Rows
   - This shows all users in the database
5. **Run SQL queries**:
   - Click "Tools" > "Query Tool"
   - Example queries:
     \`\`\`sql
     -- View all users
     SELECT user_id, email, name, age, location FROM users;
     
     -- View all posts with author info
     SELECT p.content, u.name as author, p.created_at 
     FROM posts p 
     JOIN users u ON p.author_id = u.user_id 
     ORDER BY p.created_at DESC;
     
     -- View friendships
     SELECT u1.name as user, u2.name as friend, f.status 
     FROM friendships f
     JOIN users u1 ON f.user_id = u1.user_id
     JOIN users u2 ON f.friend_id = u2.user_id;
     \`\`\`

## Password Information

- All passwords are hashed using bcrypt with 10 rounds
- Password hashes are stored in the `password_hash` column
- You cannot see the original password in the database (this is secure by design)
- To test login, use: **`test123`** for any test account

## Update Test Passwords

If you need to reset test passwords, run:
\`\`\`bash
npm run db:update-passwords
