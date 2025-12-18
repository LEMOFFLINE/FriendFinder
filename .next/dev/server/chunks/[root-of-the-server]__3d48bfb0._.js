module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/database/postgres-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// PostgreSQL Database Client
// This replaces the localStorage client with a real PostgreSQL connection
__turbopack_context__.s([
    "postgresDb",
    ()=>postgresDb
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
class PostgresClient {
    pool;
    constructor(){
        // Initialize connection pool
        this.pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
            connectionString: process.env.DATABASE_URL,
            ssl: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : false,
            max: 10,
            idleTimeoutMillis: 60000,
            connectionTimeoutMillis: 10000,
            statement_timeout: 30000,
            query_timeout: 30000
        });
        // Handle pool errors
        this.pool.on("error", (err)=>{
            console.error("Unexpected database error:", err);
        });
    }
    // ============================================================
    // USERS
    // ============================================================
    async getUsers() {
        const result = await this.pool.query("SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC");
        return result.rows;
    }
    async getUserById(userId) {
        const result = await this.pool.query("SELECT * FROM users WHERE user_id = $1", [
            userId
        ]);
        return result.rows[0] || null;
    }
    async getUserByEmail(email) {
        const result = await this.pool.query("SELECT * FROM users WHERE email = $1", [
            email
        ]);
        return result.rows[0] || null;
    }
    async createUser(user) {
        const query = `
      INSERT INTO users (
        user_id, email, password_hash, name, age, location, bio, avatar_url,
        background_image_url, post_count, follower_count, following_count,
        profile_visibility, post_default_visibility, allow_message_from,
        require_friend_confirmation, is_active, last_active_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
        const values = [
            user.user_id,
            user.email,
            user.password_hash,
            user.name,
            user.age || null,
            user.location || null,
            user.bio || null,
            user.avatar_url || null,
            user.background_image_url || null,
            user.post_count || 0,
            user.follower_count || 0,
            user.following_count || 0,
            user.profile_visibility || "public",
            user.post_default_visibility || "friends",
            user.allow_message_from || "friends",
            user.require_friend_confirmation !== false,
            user.is_active !== false,
            user.last_active_at || new Date().toISOString()
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async updateUser(userId, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        Object.entries(updates).forEach(([key, value])=>{
            if (key !== "user_id" && key !== "updated_at" && value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });
        if (fields.length === 0) return this.getUserById(userId);
        values.push(userId);
        const query = `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE user_id = $${paramIndex} RETURNING *`;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }
    // ============================================================
    // USER INTERESTS
    // ============================================================
    async getUserInterests(userId) {
        const result = await this.pool.query("SELECT hobbies FROM user_interests WHERE user_id = $1", [
            userId
        ]);
        return result.rows[0]?.hobbies || [];
    }
    async setUserInterests(userId, hobbies) {
        const query = `
      INSERT INTO user_interests (user_id, hobbies)
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET hobbies = $2
      RETURNING hobbies
    `;
        const result = await this.pool.query(query, [
            userId,
            hobbies
        ]);
        return result.rows[0].hobbies;
    }
    async deleteUserInterests(userId) {
        await this.pool.query("DELETE FROM user_interests WHERE user_id = $1", [
            userId
        ]);
    }
    // ============================================================
    // FRIENDSHIPS
    // ============================================================
    async getFriendships(userId) {
        const result = await this.pool.query("SELECT * FROM friendships WHERE user_id = $1 OR friend_id = $1 ORDER BY created_at DESC", [
            userId
        ]);
        return result.rows;
    }
    async createFriendship(friendship) {
        const query = `
      INSERT INTO friendships (friendship_id, user_id, friend_id, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const result = await this.pool.query(query, [
            friendship.friendship_id,
            friendship.user_id,
            friendship.friend_id,
            friendship.status
        ]);
        return result.rows[0];
    }
    async updateFriendship(friendshipId, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        Object.entries(updates).forEach(([key, value])=>{
            if (key !== "friendship_id" && value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });
        if (fields.length === 0) {
            const result = await this.pool.query("SELECT * FROM friendships WHERE friendship_id = $1", [
                friendshipId
            ]);
            return result.rows[0] || null;
        }
        values.push(friendshipId);
        const query = `UPDATE friendships SET ${fields.join(", ")} WHERE friendship_id = $${paramIndex} RETURNING *`;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }
    async deleteFriendship(userId, friendId) {
        await this.pool.query("DELETE FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)", [
            userId,
            friendId
        ]);
    }
    // ============================================================
    // POSTS
    // ============================================================
    async getPosts() {
        const result = await this.pool.query("SELECT * FROM posts WHERE is_deleted = false ORDER BY created_at DESC");
        return result.rows;
    }
    async getPostById(postId) {
        const result = await this.pool.query("SELECT * FROM posts WHERE post_id = $1 AND is_deleted = false", [
            postId
        ]);
        return result.rows[0] || null;
    }
    async getUserPosts(userId) {
        const result = await this.pool.query("SELECT * FROM posts WHERE author_id = $1 AND is_deleted = false ORDER BY created_at DESC", [
            userId
        ]);
        return result.rows;
    }
    async createPost(post) {
        const query = `
      INSERT INTO posts (
        post_id, author_id, content, image_urls, visibility, type,
        original_post_id, root_post_id, like_count, repost_count, 
        comment_count, hot_score, is_deleted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
        const values = [
            post.post_id,
            post.author_id,
            post.content || null,
            post.image_urls || [],
            post.visibility || "friends",
            post.type || "original",
            post.original_post_id || null,
            post.root_post_id || null,
            post.like_count || 0,
            post.repost_count || 0,
            post.comment_count || 0,
            post.hot_score || 0,
            post.is_deleted || false
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async updatePost(postId, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        Object.entries(updates).forEach(([key, value])=>{
            if (key !== "post_id" && key !== "updated_at" && value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });
        if (fields.length === 0) return this.getPostById(postId);
        values.push(postId);
        const query = `UPDATE posts SET ${fields.join(", ")}, updated_at = NOW() WHERE post_id = $${paramIndex} RETURNING *`;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }
    async deletePost(postId) {
        await this.pool.query("UPDATE posts SET is_deleted = true, deleted_at = NOW() WHERE post_id = $1", [
            postId
        ]);
    }
    // ============================================================
    // COMMENTS
    // ============================================================
    async getCommentsByPostId(postId) {
        const result = await this.pool.query("SELECT * FROM comments WHERE post_id = $1 AND is_deleted = false ORDER BY created_at ASC", [
            postId
        ]);
        return result.rows;
    }
    async createComment(comment) {
        const query = `
      INSERT INTO comments (
        comment_id, post_id, author_id, parent_comment_id, content,
        image_urls, depth, like_count, is_deleted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const values = [
            comment.comment_id,
            comment.post_id,
            comment.author_id,
            comment.parent_comment_id || null,
            comment.content,
            comment.image_urls || [],
            comment.depth || 0,
            comment.like_count || 0,
            comment.is_deleted || false
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async updateComment(commentId, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        Object.entries(updates).forEach(([key, value])=>{
            if (key !== "comment_id" && key !== "updated_at" && value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });
        if (fields.length === 0) {
            const result = await this.pool.query("SELECT * FROM comments WHERE comment_id = $1", [
                commentId
            ]);
            return result.rows[0] || null;
        }
        values.push(commentId);
        const query = `UPDATE comments SET ${fields.join(", ")}, updated_at = NOW() WHERE comment_id = $${paramIndex} RETURNING *`;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }
    // ============================================================
    // LIKES
    // ============================================================
    async getLikes(targetType, targetId) {
        const result = await this.pool.query("SELECT * FROM likes WHERE target_type = $1 AND target_id = $2 ORDER BY created_at DESC", [
            targetType,
            targetId
        ]);
        return result.rows;
    }
    async getUserLike(userId, targetType, targetId) {
        const result = await this.pool.query("SELECT * FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3", [
            userId,
            targetType,
            targetId
        ]);
        return result.rows[0] || null;
    }
    async createLike(like) {
        const query = "INSERT INTO likes (like_id, user_id, target_type, target_id) VALUES ($1, $2, $3, $4) RETURNING *";
        const result = await this.pool.query(query, [
            like.like_id,
            like.user_id,
            like.target_type,
            like.target_id
        ]);
        return result.rows[0];
    }
    async deleteLike(userId, targetType, targetId) {
        await this.pool.query("DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3", [
            userId,
            targetType,
            targetId
        ]);
    }
    // ============================================================
    // REPOSTS
    // ============================================================
    async createRepost(repost) {
        const query = `
      INSERT INTO reposts (
        repost_id, user_id, original_post_id, root_post_id,
        content, image_urls, depth
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [
            repost.repost_id,
            repost.user_id,
            repost.original_post_id,
            repost.root_post_id,
            repost.content || null,
            repost.image_urls || [],
            repost.depth || 0
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    // ============================================================
    // NOTIFICATIONS
    // ============================================================
    async getUserNotifications(userId) {
        const result = await this.pool.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50", [
            userId
        ]);
        return result.rows;
    }
    async createNotification(notification) {
        const query = `
      INSERT INTO notifications (
        notification_id, user_id, type, actor_id,
        post_id, comment_id, is_read
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [
            notification.notification_id,
            notification.user_id,
            notification.type,
            notification.actor_id,
            notification.post_id || null,
            notification.comment_id || null,
            notification.is_read || false
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async markNotificationAsRead(notificationId) {
        await this.pool.query("UPDATE notifications SET is_read = true WHERE notification_id = $1", [
            notificationId
        ]);
    }
    // ============================================================
    // UTILITY METHODS
    // ============================================================
    async testConnection() {
        try {
            const result = await this.pool.query("SELECT NOW()");
            console.log("Database connection successful:", result.rows[0]);
            return true;
        } catch (error) {
            console.error("Database connection failed:", error);
            return false;
        }
    }
    async close() {
        await this.pool.end();
    }
}
const postgresDb = new PostgresClient();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/app/api/users/[userId]/profile/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$postgres$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/database/postgres-client.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$postgres$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$postgres$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function PUT(request, { params }) {
    try {
        const { userId } = await params;
        const body = await request.json();
        const { name, location, avatar_url, bio } = body;
        // Validate required fields
        if (!name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Name is required"
            }, {
                status: 400
            });
        }
        // Update user profile
        const updatedUser = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$postgres$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["postgresDb"].updateUser(userId, {
            name,
            location: location || undefined,
            avatar_url: avatar_url || undefined,
            bio: bio || undefined,
            updated_at: new Date().toISOString()
        });
        if (!updatedUser) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "User not found"
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to update profile"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3d48bfb0._.js.map