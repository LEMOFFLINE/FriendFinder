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
"[project]/app/api/users/[userId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/database/pg-client.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function GET(request, { params }) {
    try {
        const { userId } = await params;
        const { searchParams } = new URL(request.url);
        const currentUserId = searchParams.get("currentUserId");
        const userResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT 
        u.user_id, 
        COALESCE(un.nickname, u.name) as name,
        u.name as original_name,
        u.email, 
        u.age, 
        u.location, 
        u.bio, 
        u.created_at
       FROM users u
       LEFT JOIN user_nicknames un ON un.nicknamer_id = $2 AND un.target_user_id = u.user_id
       WHERE u.user_id = $1`, [
            userId,
            currentUserId || null
        ]);
        if (userResult.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "User not found"
            }, {
                status: 404
            });
        }
        const user = userResult.rows[0];
        const interestsResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT hobbies FROM user_interests WHERE user_id = $1", [
            userId
        ]);
        const interests = interestsResult.rows.length > 0 ? interestsResult.rows[0].hobbies || [] : [];
        const postsResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT 
        p.*,
        EXISTS(
          SELECT 1 FROM likes 
          WHERE likes.target_type = 'post' 
          AND likes.target_id = p.post_id 
          AND likes.user_id = $2
        ) as liked_by_current_user,
        
        -- Fetch original post data for reposts
        op.content as original_post_content,
        op.image_urls as original_post_image_urls,
        op.created_at as original_post_created_at,
        ou.user_id as original_post_author_id,
        ou.name as original_post_author_name,
        ou.avatar_url as original_post_author_avatar_url

       FROM posts p
       -- Left join for original post data
       LEFT JOIN posts op ON p.original_post_id = op.post_id
       LEFT JOIN users ou ON op.author_id = ou.user_id
       
       WHERE p.author_id = $1
       AND p.is_deleted = false
       AND (
         p.author_id = $2
         OR p.visibility = 'public'
         OR (
           p.visibility = 'friends'
           AND EXISTS (
             SELECT 1 FROM friendships f
             WHERE f.status = 'accepted'
             AND ((f.user_id = $2 AND f.friend_id = $1)
               OR (f.friend_id = $2 AND f.user_id = $1))
           )
         )
       )
       ORDER BY p.created_at DESC`, [
            userId,
            currentUserId || userId
        ]);
        let friendshipStatus = "none";
        if (currentUserId && currentUserId !== userId) {
            const friendshipResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$pg$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT status, user_id, friend_id
         FROM friendships
         WHERE ((user_id = $1 AND friend_id = $2)
            OR (user_id = $2 AND friend_id = $1))
         AND status IN ('accepted', 'pending')`, [
                currentUserId,
                userId
            ]);
            if (friendshipResult.rows.length > 0) {
                const friendship = friendshipResult.rows[0];
                if (friendship.status === "accepted") {
                    friendshipStatus = "friends";
                } else if (friendship.user_id === currentUserId) {
                    friendshipStatus = "pending_sent";
                } else {
                    friendshipStatus = "pending_received";
                }
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            user: {
                ...user,
                interests
            },
            posts: postsResult.rows,
            friendshipStatus
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load user profile"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4c56fc87._.js.map