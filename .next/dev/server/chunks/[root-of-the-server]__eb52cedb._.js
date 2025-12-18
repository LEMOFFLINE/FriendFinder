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
"[project]/lib/database/pg-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "closePool",
    ()=>closePool,
    "getPool",
    ()=>getPool,
    "query",
    ()=>query,
    "transaction",
    ()=>transaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Singleton pool instance
let pool = null;
function getPool() {
    if (!pool) {
        pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
            connectionString: process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/friendfinder",
            max: 10,
            idleTimeoutMillis: 60000,
            connectionTimeoutMillis: 10000,
            statement_timeout: 30000
        });
        pool.on("error", (err)=>{
            console.error("Unexpected error on idle client", err);
            pool = null;
        });
    }
    return pool;
}
async function query(text, params) {
    const pool = getPool();
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.warn("Slow query detected:", duration, "ms");
        }
        return result;
    } catch (error) {
        console.error("Query error:", error);
        throw error;
    }
}
async function transaction(callback) {
    const pool = getPool();
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally{
        client.release();
    }
}
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/database/services/pg-post-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "pgPostService",
    ()=>pgPostService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/database/pg-client.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
class PgPostService {
    // Create a new post
    async createPost(data) {
        try {
            if (!data.content && (!data.image_urls || data.image_urls.length === 0)) {
                return {
                    success: false,
                    error: "Post must have content or images"
                };
            }
            if (data.content && data.content.length > 1000) {
                return {
                    success: false,
                    error: "Post content cannot exceed 1000 characters"
                };
            }
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO posts (author_id, content, image_urls, visibility)
         VALUES ($1, $2, $3, $4)
         RETURNING *`, [
                data.author_id,
                data.content || null,
                data.image_urls || [],
                data.visibility || "friends"
            ]);
            const post = result.rows[0];
            console.log("[v0] Post created:", post.post_id);
            return {
                success: true,
                post
            };
        } catch (error) {
            console.error("[v0] Error creating post:", error);
            return {
                success: false,
                error: "Failed to create post"
            };
        }
    }
    // Get feed for a user (their posts + friends' posts)
    async getFeed(userId) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT 
          p.*,
          u.name as author_name,
          u.email as author_email,
          u.avatar_url as author_avatar_url,
          EXISTS(
            SELECT 1 FROM likes 
            WHERE likes.target_type = 'post' 
            AND likes.target_id = p.post_id 
            AND likes.user_id = $1
          ) as liked_by_current_user,
          
          -- Fetch original post data if it's a repost
          op.content as original_post_content,
          op.image_urls as original_post_image_urls,
          op.created_at as original_post_created_at,
          ou.user_id as original_post_author_id,
          ou.name as original_post_author_name,
          ou.avatar_url as original_post_author_avatar_url

         FROM posts p
         JOIN users u ON p.author_id = u.user_id
         -- Left join for reposts
         LEFT JOIN posts op ON p.original_post_id = op.post_id
         LEFT JOIN users ou ON op.author_id = ou.user_id
         
         WHERE p.is_deleted = false
         AND (
           p.author_id = $1
           OR p.visibility = 'public'
           OR (
             p.visibility = 'friends'
             AND EXISTS (
               SELECT 1 FROM friendships f
               WHERE f.status = 'accepted'
               AND ((f.user_id = $1 AND f.friend_id = p.author_id)
                 OR (f.friend_id = $1 AND f.user_id = p.author_id))
             )
           )
         )
         ORDER BY p.created_at DESC
         LIMIT 100`, [
                userId
            ]);
            console.log("[v0] Loaded", result.rows.length, "posts for feed");
            return result.rows;
        } catch (error) {
            console.error("[v0] Error loading feed:", error);
            return [];
        }
    }
    // Toggle like on a post
    async toggleLike(userId, postId) {
        try {
            // Check if already liked
            const existingLike = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT like_id FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3", [
                userId,
                "post",
                postId
            ]);
            if (existingLike.rows.length > 0) {
                // Unlike
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3", [
                    userId,
                    "post",
                    postId
                ]);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("UPDATE posts SET like_count = like_count - 1 WHERE post_id = $1", [
                    postId
                ]);
                const countResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT like_count FROM posts WHERE post_id = $1", [
                    postId
                ]);
                console.log("[v0] Post unliked:", postId);
                return {
                    success: true,
                    liked: false,
                    newCount: countResult.rows[0]?.like_count || 0
                };
            } else {
                // Like
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("INSERT INTO likes (user_id, target_type, target_id) VALUES ($1, $2, $3)", [
                    userId,
                    "post",
                    postId
                ]);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("UPDATE posts SET like_count = like_count + 1 WHERE post_id = $1", [
                    postId
                ]);
                const countResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT like_count FROM posts WHERE post_id = $1", [
                    postId
                ]);
                console.log("[v0] Post liked:", postId);
                return {
                    success: true,
                    liked: true,
                    newCount: countResult.rows[0]?.like_count || 1
                };
            }
        } catch (error) {
            console.error("[v0] Error toggling like:", error);
            return {
                success: false,
                liked: false,
                newCount: 0
            };
        }
    }
    // Add a comment to a post
    async addComment(data) {
        try {
            if (!data.content || data.content.length > 500) {
                return {
                    success: false,
                    error: "Comment must be between 1 and 500 characters"
                };
            }
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO comments (post_id, author_id, content, comment_type, depth)
         VALUES ($1, $2, $3, 'main', 0)
         RETURNING *`, [
                data.post_id,
                data.user_id,
                data.content
            ]);
            // Update post comment count
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = $1", [
                data.post_id
            ]);
            // Get author name
            const authorResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT name FROM users WHERE user_id = $1", [
                data.user_id
            ]);
            const commentWithAuthor = {
                ...result.rows[0],
                author_name: authorResult.rows[0]?.name || "Unknown"
            };
            console.log("[v0] Comment added to post:", data.post_id);
            return {
                success: true,
                comment: commentWithAuthor
            };
        } catch (error) {
            console.error("[v0] Error adding comment:", error);
            return {
                success: false,
                error: "Failed to add comment"
            };
        }
    }
    // Get comments for a post
    async getComments(postId) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT c.*, u.name as author_name
         FROM comments c
         JOIN users u ON c.author_id = u.user_id
         WHERE c.post_id = $1 AND c.is_deleted = false
         ORDER BY c.created_at ASC`, [
                postId
            ]);
            return result.rows;
        } catch (error) {
            console.error("[v0] Error loading comments:", error);
            return [];
        }
    }
    // Delete a post
    async deletePost(postId, userId) {
        try {
            // Check if user owns the post
            const postResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT * FROM posts WHERE post_id = $1", [
                postId
            ]);
            if (postResult.rows.length === 0) {
                return {
                    success: false,
                    error: "Post not found"
                };
            }
            if (postResult.rows[0].author_id !== userId) {
                return {
                    success: false,
                    error: "Unauthorized"
                };
            }
            // First delete related data (comments, likes, etc.)
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("DELETE FROM comments WHERE post_id = $1", [
                postId
            ]);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("DELETE FROM likes WHERE target_type = 'post' AND target_id = $1", [
                postId
            ]);
            // Delete reposts of this post
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("DELETE FROM posts WHERE original_post_id = $1", [
                postId
            ]);
            // Finally delete the post itself
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("DELETE FROM posts WHERE post_id = $1", [
                postId
            ]);
            console.log("[v0] Post deleted from database:", postId);
            return {
                success: true
            };
        } catch (error) {
            console.error("[v0] Error deleting post:", error);
            return {
                success: false,
                error: "Failed to delete post"
            };
        }
    }
}
const pgPostService = new PgPostService();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/app/api/posts/feed/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$services$2f$pg$2d$post$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/database/services/pg-post-service.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$services$2f$pg$2d$post$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$services$2f$pg$2d$post$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function GET(request) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        if (!userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User ID is required'
            }, {
                status: 400
            });
        }
        const posts = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$services$2f$pg$2d$post$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgPostService"].getFeed(userId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            posts
        });
    } catch (error) {
        console.error('[v0] Feed API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to load feed'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__eb52cedb._.js.map