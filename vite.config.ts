import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption, ViteDevServer } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from "path";
import { neon, Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables for development
dotenv.config({ path: ".env.local" });

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;

// Development API handler plugin
function apiRoutesPlugin(): PluginOption {
  return {
    name: "api-routes",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        // Handle /api/auth/google
        if (req.url === "/api/auth/google") {
          const clientId = process.env.GOOGLE_CLIENT_ID;

          // Dynamically detect the current domain from request headers
          const host = req.headers.host || "localhost:5000";
          const protocol = host.includes("localhost") ? "http" : "https";
          const appUrl = `${protocol}://${host}`;
          const redirectUri = `${appUrl}/api/auth/callback`;

          if (!clientId) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: "Google OAuth not configured",
                hint: "Add GOOGLE_CLIENT_ID to .env.local",
              })
            );
            return;
          }

          // Build Google OAuth URL
          const googleAuthUrl = new URL(
            "https://accounts.google.com/o/oauth2/v2/auth"
          );
          googleAuthUrl.searchParams.append("client_id", clientId);
          googleAuthUrl.searchParams.append("redirect_uri", redirectUri);
          googleAuthUrl.searchParams.append("response_type", "code");
          googleAuthUrl.searchParams.append("scope", "openid email profile");
          googleAuthUrl.searchParams.append("access_type", "offline");
          googleAuthUrl.searchParams.append("prompt", "consent");

          res.statusCode = 302;
          res.setHeader("Location", googleAuthUrl.toString());
          res.end();
          return;
        }

        // Handle /api/auth/callback
        if (req.url?.startsWith("/api/auth/callback")) {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");

          if (error) {
            console.error("❌ OAuth Error:", error);
            res.statusCode = 302;
            res.setHeader("Location", "/?auth=error");
            res.end();
            return;
          }

          if (!code) {
            console.error("❌ No authorization code received");
            res.statusCode = 302;
            res.setHeader("Location", "/?auth=missing_code");
            res.end();
            return;
          }

          try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

            // Dynamically detect the current domain from request headers
            const host = req.headers.host || "localhost:5000";
            const protocol = host.includes("localhost") ? "http" : "https";
            const appUrl = `${protocol}://${host}`;
            const redirectUri = `${appUrl}/api/auth/callback`;

            if (!clientId || !clientSecret) {
              throw new Error("Google OAuth credentials not configured");
            }

            // Exchange code for tokens
            const tokenResponse = await fetch(
              "https://oauth2.googleapis.com/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  code,
                  client_id: clientId,
                  client_secret: clientSecret,
                  redirect_uri: redirectUri,
                  grant_type: "authorization_code",
                }),
              }
            );

            if (!tokenResponse.ok) {
              const errorData = await tokenResponse.text();
              console.error("Token exchange error:", errorData);
              throw new Error("Failed to exchange code for tokens");
            }

            const tokens = await tokenResponse.json();

            // Get user info
            const userInfoResponse = await fetch(
              "https://www.googleapis.com/oauth2/v2/userinfo",
              {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
              }
            );

            if (!userInfoResponse.ok) {
              throw new Error("Failed to fetch user info");
            }

            const userInfo = await userInfoResponse.json();

            // Save or update user in database
            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);

            try {
              await sql`
                INSERT INTO users (id, email, name, picture, last_login)
                VALUES (${userInfo.id}, ${userInfo.email}, ${userInfo.name}, ${userInfo.picture}, NOW())
                ON CONFLICT (id) 
                DO UPDATE SET 
                  name = EXCLUDED.name,
                  picture = EXCLUDED.picture,
                  last_login = NOW(),
                  updated_at = NOW()
              `;
            } catch (dbError) {
              console.error("❌ Database error:", dbError);
              // Continue even if DB save fails - user can still use the app
            }

            // Fetch user role from database for session token
            let userRole = "free";
            try {
              const [dbUser] = await sql`
                SELECT role FROM users WHERE id = ${userInfo.id} LIMIT 1
              `;
              userRole = dbUser?.role || "free";
            } catch (roleError) {
              console.error("❌ Error fetching user role:", roleError);
            }

            // Create session token with role
            const sessionData = JSON.stringify({
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
              role: userRole,
              exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            const token = Buffer.from(sessionData).toString("base64");

            // Set cookie and redirect
            res.setHeader(
              "Set-Cookie",
              `auth_token=${token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Lax`
            );
            res.statusCode = 302;
            res.setHeader("Location", "/?auth=success");
            res.end();
            return;
          } catch (error) {
            console.error("❌ Auth callback error:", error);
            res.statusCode = 302;
            res.setHeader("Location", "/?auth=error");
            res.end();
            return;
          }
        }

        // Handle /api/auth/session
        if (req.url === "/api/auth/session") {
          try {
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ authenticated: false, user: null }));
              return;
            }

            // Decode session token
            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            // Check expiration
            if (sessionData.exp < Date.now()) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ authenticated: false, user: null }));
              return;
            }

            // Verify user still exists and is active in database
            if (!process.env.POSTGRES_POSTGRES_URL) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  authenticated: true,
                  user: {
                    id: sessionData.id,
                    email: sessionData.email,
                    name: sessionData.name,
                    picture: sessionData.picture,
                    role: sessionData.role || "free",
                  },
                })
              );
              return;
            }

            const sql = neon(process.env.POSTGRES_POSTGRES_URL);

            try {
              const [dbUser] = await sql`
                SELECT id, email, name, picture, role, is_active
                FROM users
                WHERE id = ${sessionData.id}
                LIMIT 1
              `;

              if (!dbUser || !dbUser.is_active) {
                console.warn("⚠️ User not found or inactive:", sessionData.id);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ authenticated: false, user: null }));
                return;
              }

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  authenticated: true,
                  user: {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name,
                    picture: dbUser.picture,
                    role: dbUser.role,
                  },
                })
              );
              return;
            } catch (dbError) {
              console.error("❌ Database error during session check:", dbError);
              // Fallback to token data if DB fails
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  authenticated: true,
                  user: {
                    id: sessionData.id,
                    email: sessionData.email,
                    name: sessionData.name,
                    picture: sessionData.picture,
                    role: sessionData.role || "free",
                  },
                })
              );
              return;
            }
          } catch (error) {
            console.error("❌ Session error:", error);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ authenticated: false, user: null }));
            return;
          }
        }

        // Handle /api/auth/logout
        if (req.url === "/api/auth/logout") {
          res.setHeader(
            "Set-Cookie",
            "auth_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
          );
          res.statusCode = 302;
          res.setHeader("Location", "/");
          res.end();
          return;
        }

        // Handle unified /api/admin?resource=xxx endpoint
        if (req.url?.startsWith("/api/admin?resource=")) {
          try {
            // Dynamically import the admin handler
            const adminModule = await import("./api/admin.ts");
            const handler = adminModule.default;

            // Create mock Vercel request/response objects
            const url = new URL(req.url, `http://${req.headers.host}`);
            const mockReq = {
              method: req.method,
              url: req.url,
              headers: req.headers,
              query: Object.fromEntries(url.searchParams.entries()),
              body: await new Promise((resolve) => {
                let body = "";
                req.on("data", (chunk) => (body += chunk));
                req.on("end", () => {
                  try {
                    resolve(body ? JSON.parse(body) : {});
                  } catch {
                    resolve({});
                  }
                });
              }),
            };

            const mockRes = {
              status: (code: number) => {
                res.statusCode = code;
                return mockRes;
              },
              json: (data: any) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              },
              setHeader: (name: string, value: string) => {
                res.setHeader(name, value);
              },
            };

            await handler(mockReq as any, mockRes as any);
            return;
          } catch (error) {
            console.error("❌ Admin API error:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: "Internal server error",
                message:
                  error instanceof Error ? error.message : "Unknown error",
              })
            );
            return;
          }
        }

        // Handle /api/admin/auth/check
        if (req.url === "/api/admin/auth/check") {
          try {
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  hasAccess: false,
                  role: null,
                  user: null,
                })
              );
              return;
            }

            // Decode session token
            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            // Check expiration
            if (sessionData.exp < Date.now()) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  hasAccess: false,
                  role: null,
                  user: null,
                })
              );
              return;
            }

            // Verify against database if configured
            let userRole = sessionData.role || "free";
            let userName = sessionData.name;
            let userEmail = sessionData.email;
            let userPicture = sessionData.picture;
            let isActive = true;

            if (process.env.POSTGRES_POSTGRES_URL) {
              const sql = neon(process.env.POSTGRES_POSTGRES_URL);

              try {
                const [dbUser] = await sql`
                  SELECT id, email, name, picture, role, is_active
                  FROM users
                  WHERE id = ${sessionData.id}
                  LIMIT 1
                `;

                if (!dbUser || !dbUser.is_active) {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({
                      hasAccess: false,
                      role: null,
                      user: null,
                    })
                  );
                  return;
                }

                userRole = dbUser.role;
                userName = dbUser.name;
                userEmail = dbUser.email;
                userPicture = dbUser.picture;
                isActive = dbUser.is_active;
              } catch (dbError) {
                console.error("❌ Database error during admin check:", dbError);
                // Fallback to session data
              }
            }

            // Check if user has admin or creator role
            const isAdmin = userRole === "admin" || userRole === "creator";

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                hasAccess: isAdmin,
                role: userRole,
                user: isAdmin
                  ? {
                      id: sessionData.id,
                      email: userEmail,
                      name: userName,
                      picture: userPicture,
                    }
                  : null,
              })
            );
            return;
          } catch (error) {
            console.error("❌ Admin auth check error:", error);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                hasAccess: false,
                role: null,
                user: null,
              })
            );
            return;
          }
        }

        // Handle /api/admin/users - Get all users with pagination and filters
        if (
          req.method === "GET" &&
          (req.url === "/api/admin/users" ||
            req.url?.startsWith("/api/admin/users?"))
        ) {
          try {
            // Check admin authentication
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            // Decode and verify admin access
            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            // Verify admin role from database
            if (!process.env.POSTGRES_POSTGRES_URL) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Database not configured" }));
              return;
            }

            const sql = neon(process.env.POSTGRES_POSTGRES_URL);

            const [adminUser] = await sql`
              SELECT role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              !adminUser.is_active ||
              (adminUser.role !== "admin" && adminUser.role !== "creator")
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Forbidden: Admin access required" })
              );
              return;
            }

            // Parse query parameters
            const url = new URL(req.url, `http://${req.headers.host}`);
            const page = parseInt(url.searchParams.get("page") || "1");
            const limit = parseInt(url.searchParams.get("limit") || "50");
            const roleFilter = url.searchParams.get("role") || "all";
            const statusFilter = url.searchParams.get("status") || "all";
            const searchQuery = url.searchParams.get("search") || "";
            const offset = (page - 1) * limit;

            // Build query dynamically with filters
            let countQuery;
            let usersQuery;

            if (roleFilter !== "all" && statusFilter !== "all" && searchQuery) {
              // All three filters
              const searchPattern = `%${searchQuery}%`;
              const isActive = statusFilter === "active";
              countQuery = sql`
                SELECT COUNT(*) as total 
                FROM users 
                WHERE role = ${roleFilter} 
                  AND is_active = ${isActive}
                  AND (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
              `;
              usersQuery = sql`
                SELECT id, email, name, picture, role, is_active, created_at, last_login
                FROM users
                WHERE role = ${roleFilter} 
                  AND is_active = ${isActive}
                  AND (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
            } else if (roleFilter !== "all" && statusFilter !== "all") {
              // Role and status filters
              const isActive = statusFilter === "active";
              countQuery = sql`
                SELECT COUNT(*) as total 
                FROM users 
                WHERE role = ${roleFilter} AND is_active = ${isActive}
              `;
              usersQuery = sql`
                SELECT id, email, name, picture, role, is_active, created_at, last_login
                FROM users
                WHERE role = ${roleFilter} AND is_active = ${isActive}
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
            } else if (roleFilter !== "all" && searchQuery) {
              // Role and search filters
              const searchPattern = `%${searchQuery}%`;
              countQuery = sql`
                SELECT COUNT(*) as total 
                FROM users 
                WHERE role = ${roleFilter}
                  AND (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
              `;
              usersQuery = sql`
                SELECT id, email, name, picture, role, is_active, created_at, last_login
                FROM users
                WHERE role = ${roleFilter}
                  AND (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
            } else if (statusFilter !== "all" && searchQuery) {
              // Status and search filters
              const isActive = statusFilter === "active";
              const searchPattern = `%${searchQuery}%`;
              countQuery = sql`
                SELECT COUNT(*) as total 
                FROM users 
                WHERE is_active = ${isActive}
                  AND (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
              `;
              usersQuery = sql`
                SELECT id, email, name, picture, role, is_active, created_at, last_login
                FROM users
                WHERE is_active = ${isActive}
                  AND (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
            } else if (roleFilter !== "all") {
              // Role filter only
              countQuery = sql`
                SELECT COUNT(*) as total 
                FROM users 
                WHERE role = ${roleFilter}
              `;
              usersQuery = sql`
                SELECT id, email, name, picture, role, is_active, created_at, last_login
                FROM users
                WHERE role = ${roleFilter}
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
            } else if (statusFilter !== "all") {
              // Status filter only
              const isActive = statusFilter === "active";
              countQuery = sql`
                SELECT COUNT(*) as total 
                FROM users 
                WHERE is_active = ${isActive}
              `;
              usersQuery = sql`
                SELECT id, email, name, picture, role, is_active, created_at, last_login
                FROM users
                WHERE is_active = ${isActive}
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
            } else if (searchQuery) {
              // Search filter only
              const searchPattern = `%${searchQuery}%`;
              countQuery = sql`
                SELECT COUNT(*) as total 
                FROM users 
                WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}
              `;
              usersQuery = sql`
                SELECT id, email, name, picture, role, is_active, created_at, last_login
                FROM users
                WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
            } else {
              // No filters
              countQuery = sql`SELECT COUNT(*) as total FROM users`;
              usersQuery = sql`
                SELECT id, email, name, picture, role, is_active, created_at, last_login
                FROM users
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
            }

            // Execute queries
            const [countResult] = await countQuery;
            const total = parseInt(countResult.total);
            const users = await usersQuery;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                users,
                pagination: {
                  page,
                  limit,
                  total,
                  totalPages: Math.ceil(total / limit),
                },
              })
            );
            return;
          } catch (error) {
            console.error("❌ Error fetching users:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle PUT /api/admin/users/:id - Update user
        if (
          req.method === "PUT" &&
          req.url?.match(/^\/api\/admin\/users\/[^/]+$/)
        ) {
          try {
            const userId = req.url.split("/").pop()!;

            // Check admin authentication
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            if (!process.env.POSTGRES_POSTGRES_URL) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Database not configured" }));
              return;
            }

            const sql = neon(process.env.POSTGRES_POSTGRES_URL);

            // Verify admin role
            const [adminUser] = await sql`
              SELECT role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              !adminUser.is_active ||
              (adminUser.role !== "admin" && adminUser.role !== "creator")
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Forbidden: Admin access required" })
              );
              return;
            }

            // Get request body
            let body = "";
            for await (const chunk of req) {
              body += chunk.toString();
            }
            const updates = JSON.parse(body);

            // Get current user data for activity logging
            const [currentUser] = await sql`
              SELECT id, email, name, role, is_active
              FROM users
              WHERE id = ${userId}
              LIMIT 1
            `;

            if (!currentUser) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "User not found" }));
              return;
            }

            // Track changes for activity log
            const changes: Record<string, any> = {};

            // Prepare update based on what changed
            let updateQuery;

            if (
              updates.role !== undefined &&
              updates.role !== currentUser.role &&
              updates.is_active !== undefined &&
              updates.is_active !== currentUser.is_active
            ) {
              // Both role and is_active changed
              // Only creator can promote to admin
              if (updates.role === "admin" && adminUser.role !== "creator") {
                res.statusCode = 403;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: "Only creators can promote users to admin",
                  })
                );
                return;
              }

              changes.role = { from: currentUser.role, to: updates.role };
              changes.is_active = {
                from: currentUser.is_active,
                to: updates.is_active,
              };

              updateQuery = sql`
                UPDATE users 
                SET role = ${updates.role}, 
                    is_active = ${updates.is_active},
                    updated_at = NOW()
                WHERE id = ${userId}
              `;
            } else if (
              updates.role !== undefined &&
              updates.role !== currentUser.role
            ) {
              // Only role changed
              if (updates.role === "admin" && adminUser.role !== "creator") {
                res.statusCode = 403;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: "Only creators can promote users to admin",
                  })
                );
                return;
              }

              changes.role = { from: currentUser.role, to: updates.role };

              updateQuery = sql`
                UPDATE users 
                SET role = ${updates.role}, 
                    updated_at = NOW()
                WHERE id = ${userId}
              `;
            } else if (
              updates.is_active !== undefined &&
              updates.is_active !== currentUser.is_active
            ) {
              // Only is_active changed
              changes.is_active = {
                from: currentUser.is_active,
                to: updates.is_active,
              };

              updateQuery = sql`
                UPDATE users 
                SET is_active = ${updates.is_active}, 
                    updated_at = NOW()
                WHERE id = ${userId}
              `;
            } else {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "No valid updates provided" }));
              return;
            }

            // Execute update
            await updateQuery;

            // Log activity
            const activityDetails = {
              changes,
              targetUser: {
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.name,
              },
            };

            await sql`
              INSERT INTO admin_activity_log (
                user_id,
                action_type,
                entity_type,
                entity_id,
                details,
                ip_address,
                user_agent
              ) VALUES (
                ${sessionData.id},
                'update',
                'user',
                ${userId},
                ${JSON.stringify(activityDetails)},
                ${req.socket.remoteAddress || null},
                ${req.headers["user-agent"] || null}
              )
            `;

            // Get updated user
            const [updatedUser] = await sql`
              SELECT id, email, name, picture, role, is_active, created_at, last_login, updated_at
              FROM users
              WHERE id = ${userId}
              LIMIT 1
            `;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ user: updatedUser }));
            return;
          } catch (error) {
            console.error("❌ Error updating user:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle DELETE /api/admin/users/:id - Delete user
        if (
          req.method === "DELETE" &&
          req.url?.match(/^\/api\/admin\/users\/[^/]+$/)
        ) {
          try {
            const userId = req.url.split("/").pop()!;

            // Check admin authentication
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            if (!process.env.POSTGRES_POSTGRES_URL) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Database not configured" }));
              return;
            }

            const sql = neon(process.env.POSTGRES_POSTGRES_URL);

            // Verify admin role
            const [adminUser] = await sql`
              SELECT role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              !adminUser.is_active ||
              (adminUser.role !== "admin" && adminUser.role !== "creator")
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Forbidden: Admin access required" })
              );
              return;
            }

            // Prevent self-deletion
            if (userId === sessionData.id) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Cannot delete your own account" })
              );
              return;
            }

            // Get user data for activity logging
            const [userToDelete] = await sql`
              SELECT id, email, name, role
              FROM users
              WHERE id = ${userId}
              LIMIT 1
            `;

            if (!userToDelete) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "User not found" }));
              return;
            }

            // Delete user (CASCADE will handle related records)
            await sql`DELETE FROM users WHERE id = ${userId}`;

            // Log activity
            const activityDetails = {
              deletedUser: {
                id: userToDelete.id,
                email: userToDelete.email,
                name: userToDelete.name,
                role: userToDelete.role,
              },
            };

            await sql`
              INSERT INTO admin_activity_log (
                user_id,
                action_type,
                entity_type,
                entity_id,
                details,
                ip_address,
                user_agent
              ) VALUES (
                ${sessionData.id},
                'delete',
                'user',
                ${userId},
                ${JSON.stringify(activityDetails)},
                ${req.socket.remoteAddress || null},
                ${req.headers["user-agent"] || null}
              )
            `;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
            return;
          } catch (error) {
            console.error("❌ Error deleting user:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle /api/admin/activity - Get activity log with pagination and filters
        if (
          req.method === "GET" &&
          (req.url === "/api/admin/activity" ||
            req.url?.startsWith("/api/admin/activity?"))
        ) {
          try {
            // Parse cookies
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            // Decode session token
            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            // Check expiration
            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            // Verify admin permissions from database
            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);
            const [adminUser] = await sql`
              SELECT id, role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              !adminUser.is_active ||
              (adminUser.role !== "admin" && adminUser.role !== "creator")
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Forbidden: Admin access required" })
              );
              return;
            }

            // Parse query parameters
            const url = new URL(req.url, `http://${req.headers.host}`);
            const page = parseInt(url.searchParams.get("page") || "1");
            const limit = parseInt(url.searchParams.get("limit") || "50");
            const actionType = url.searchParams.get("action_type") || "all";
            const entityType = url.searchParams.get("entity_type") || "all";
            const adminUserId = url.searchParams.get("admin_user") || "all";
            const startDate = url.searchParams.get("start_date");
            const endDate = url.searchParams.get("end_date");

            const offset = (page - 1) * limit;

            // Build WHERE clause for filters
            let whereClause = "";
            const conditions: string[] = [];

            if (actionType !== "all") {
              conditions.push(`aal.action_type = '${actionType}'`);
            }

            if (entityType !== "all") {
              conditions.push(`aal.entity_type = '${entityType}'`);
            }

            if (adminUserId !== "all") {
              conditions.push(`aal.user_id = '${adminUserId}'`);
            }

            if (startDate) {
              conditions.push(`aal.created_at >= '${startDate}'`);
            }

            if (endDate) {
              conditions.push(`aal.created_at <= '${endDate}'`);
            }

            if (conditions.length > 0) {
              whereClause = `WHERE ${conditions.join(" AND ")}`;
            }

            // Get total count
            const countQuery = `
              SELECT COUNT(*) as total
              FROM admin_activity_log aal
              ${whereClause}
            `;

            const countResult = await sql.unsafe(countQuery);
            const total = parseInt((countResult as any)[0].total);

            // Get activity logs with admin user info
            const logsQuery = `
              SELECT 
                aal.id,
                aal.user_id,
                aal.action_type,
                aal.entity_type,
                aal.entity_id,
                aal.details,
                aal.ip_address,
                aal.user_agent,
                aal.created_at,
                u.name as admin_name,
                u.email as admin_email,
                u.picture as admin_picture
              FROM admin_activity_log aal
              LEFT JOIN users u ON aal.user_id = u.id
              ${whereClause}
              ORDER BY aal.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `;

            const logs = (await sql.unsafe(logsQuery)) as unknown as any[];

            // Calculate pagination
            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                logs: logs.map((log: any) => ({
                  id: log.id,
                  userId: log.user_id,
                  actionType: log.action_type,
                  entityType: log.entity_type,
                  entityId: log.entity_id,
                  details: log.details,
                  ipAddress: log.ip_address,
                  userAgent: log.user_agent,
                  createdAt: log.created_at,
                  adminName: log.admin_name,
                  adminEmail: log.admin_email,
                  adminPicture: log.admin_picture,
                })),
                pagination: {
                  page,
                  limit,
                  total,
                  totalPages,
                  hasNext,
                  hasPrev,
                },
              })
            );
            return;
          } catch (error) {
            console.error("❌ Error fetching activity logs:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle /api/admin/questions - Get all questions with pagination and filters
        if (
          req.method === "GET" &&
          (req.url === "/api/admin/questions" ||
            req.url?.startsWith("/api/admin/questions?"))
        ) {
          try {
            // Parse cookies
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            // Decode session token
            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            // Verify admin permissions
            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);

            const [adminUser] = await sql`
              SELECT id, role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              !adminUser.is_active ||
              (adminUser.role !== "admin" && adminUser.role !== "creator")
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Forbidden: Admin access required" })
              );
              return;
            }

            // Parse query parameters
            const url = new URL(req.url, `http://${req.headers.host}`);
            const page = parseInt(url.searchParams.get("page") || "1");
            const limit = parseInt(url.searchParams.get("limit") || "50");
            const search = url.searchParams.get("search") || "";
            const category = url.searchParams.get("category") || "all";
            const setId = url.searchParams.get("set_id") || "all";
            const isActive = url.searchParams.get("is_active") || "all";
            const sort = url.searchParams.get("sort") || "updated_desc";

            const offset = (page - 1) * limit;

            // Build WHERE clause
            let whereClause = "";
            const conditions: string[] = [];

            if (search) {
              conditions.push(
                `(q.question_en ILIKE '%${search}%' OR q.question_hu ILIKE '%${search}%')`
              );
            }

            if (category !== "all") {
              conditions.push(`q.category = '${category}'`);
            }

            if (setId !== "all") {
              conditions.push(`q.set_id = ${parseInt(setId)}`);
            }

            if (isActive !== "all") {
              conditions.push(
                `q.is_active = ${isActive === "active" ? "true" : "false"}`
              );
            }

            if (conditions.length > 0) {
              whereClause = `WHERE ${conditions.join(" AND ")}`;
            }

            // Build ORDER BY clause
            let orderByClause = "ORDER BY q.updated_at DESC";
            switch (sort) {
              case "created_desc":
                orderByClause = "ORDER BY q.created_at DESC";
                break;
              case "created_asc":
                orderByClause = "ORDER BY q.created_at ASC";
                break;
              case "updated_desc":
                orderByClause = "ORDER BY q.updated_at DESC";
                break;
              case "updated_asc":
                orderByClause = "ORDER BY q.updated_at ASC";
                break;
              case "played_desc":
                orderByClause = "ORDER BY q.times_played DESC";
                break;
              case "played_asc":
                orderByClause = "ORDER BY q.times_played ASC";
                break;
              case "completed_desc":
                orderByClause = "ORDER BY q.times_completed DESC";
                break;
              case "completed_asc":
                orderByClause = "ORDER BY q.times_completed ASC";
                break;
            }

            // Get total count
            let countResult: any;
            if (conditions.length === 0) {
              countResult = await sql`SELECT COUNT(*) as total FROM questions`;
            } else {
              const countQuery = `SELECT COUNT(*) as total FROM questions q ${whereClause}`;
              countResult = await sql.unsafe(countQuery);
            }

            const total = parseInt(countResult[0]?.total || "0");

            // Get questions with answer counts
            // Use Pool for raw SQL execution since sql.unsafe() doesn't work as expected
            const pool = new Pool({
              connectionString: process.env.POSTGRES_POSTGRES_URL!,
            });

            const questionsQuery = `
              SELECT 
                q.id,
                q.set_id,
                q.question_en,
                q.question_hu,
                q.category,
                q.difficulty,
                q.source_name,
                q.source_url,
                q.order_index,
                q.is_active,
                q.created_at,
                q.updated_at,
                q.times_played,
                q.times_completed,
                question_sets.name_en as set_name,
                COUNT(answers.id) as answer_count
              FROM questions q
              LEFT JOIN question_sets ON q.set_id = question_sets.id
              LEFT JOIN answers ON q.id = answers.question_id
              ${whereClause}
              GROUP BY q.id, q.set_id, q.question_en, q.question_hu, q.category, 
                       q.difficulty, q.source_name, q.source_url, q.order_index, 
                       q.is_active, q.created_at, q.updated_at, q.times_played, 
                       q.times_completed, question_sets.name_en
              ${orderByClause}
              LIMIT ${limit} OFFSET ${offset}
            `;

            const result = await pool.query(questionsQuery);
            const questions = result.rows as any[];
            await pool.end();

            // Calculate pagination
            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                questions: questions.map((q: any) => ({
                  id: q.id,
                  setId: q.set_id,
                  setName: q.set_name,
                  questionEn: q.question_en,
                  questionHu: q.question_hu,
                  category: q.category,
                  difficulty: q.difficulty,
                  sourceName: q.source_name,
                  sourceUrl: q.source_url,
                  orderIndex: q.order_index,
                  isActive: q.is_active,
                  createdAt: q.created_at,
                  updatedAt: q.updated_at,
                  timesPlayed: q.times_played,
                  timesCompleted: q.times_completed,
                  answerCount: parseInt(q.answer_count),
                })),
                pagination: {
                  page,
                  limit,
                  total,
                  totalPages,
                  hasNext,
                  hasPrev,
                },
              })
            );
            return;
          } catch (error) {
            console.error("Error fetching questions:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: "Internal server error",
              })
            );
            return;
          }
        }

        // Handle /api/admin/questions/:id - Get single question with answers
        if (
          req.method === "GET" &&
          req.url?.match(/^\/api\/admin\/questions\/\d+\/answers/)
        ) {
          try {
            const questionId = parseInt(req.url.split("/")[4]);

            // Parse cookies
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            // Decode session token
            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            // Verify admin permissions
            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);

            const [adminUser] = await sql`
              SELECT id, role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              !adminUser.is_active ||
              (adminUser.role !== "admin" && adminUser.role !== "creator")
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Forbidden: Admin access required" })
              );
              return;
            }

            // Get answers for question
            const answers = await sql`
              SELECT 
                id,
                answer_en,
                answer_hu,
                order_index,
                is_alternative,
                parent_answer_id,
                times_given,
                created_at
              FROM answers
              WHERE question_id = ${questionId}
              ORDER BY order_index ASC
            `;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ answers }));
            return;
          } catch (error) {
            console.error("Error fetching answers:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle POST /api/admin/questions - Create new question
        if (req.method === "POST" && req.url === "/api/admin/questions") {
          try {
            // Parse cookies
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            // Decode session token
            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            // Verify admin permissions
            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);

            const [adminUser] = await sql`
              SELECT id, role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              !adminUser.is_active ||
              (adminUser.role !== "admin" && adminUser.role !== "creator")
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Forbidden: Admin access required" })
              );
              return;
            }

            // Parse request body
            let body = "";
            for await (const chunk of req) {
              body += chunk.toString();
            }
            const data = JSON.parse(body);

            // Validate required fields
            if (!data.question_en || !data.question_hu || !data.category) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing required fields" }));
              return;
            }

            if (!data.answers || data.answers.length === 0) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "At least one answer is required" })
              );
              return;
            }

            // Get default question set (id=1) - or you can make this selectable
            const [defaultSet] = await sql`
              SELECT id FROM question_sets ORDER BY id ASC LIMIT 1
            `;

            if (!defaultSet) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "No question sets available" }));
              return;
            }

            // Get max order_index for the set
            const [maxOrder] = await sql`
              SELECT COALESCE(MAX(order_index), -1) as max_order
              FROM questions
              WHERE set_id = ${defaultSet.id}
            `;

            const newOrderIndex = (maxOrder?.max_order || -1) + 1;

            // Create question
            const [newQuestion] = await sql`
              INSERT INTO questions (
                set_id,
                question_en,
                question_hu,
                category,
                difficulty,
                source_name,
                source_url,
                order_index,
                is_active
              ) VALUES (
                ${defaultSet.id},
                ${data.question_en},
                ${data.question_hu},
                ${data.category},
                ${data.difficulty || null},
                ${data.source_name || null},
                ${data.source_url || null},
                ${newOrderIndex},
                ${data.is_active !== undefined ? data.is_active : true}
              )
              RETURNING id
            `;

            // Create answers
            for (const answer of data.answers) {
              await sql`
                INSERT INTO answers (
                  question_id,
                  answer_en,
                  answer_hu,
                  order_index,
                  is_alternative
                ) VALUES (
                  ${newQuestion.id},
                  ${answer.answer_en},
                  ${answer.answer_hu},
                  ${answer.order_index},
                  ${answer.is_alternative || false}
                )
              `;
            }

            // Log activity
            await sql`
              INSERT INTO admin_activity_log (
                user_id,
                action_type,
                entity_type,
                entity_id,
                details
              ) VALUES (
                ${sessionData.id},
                'create',
                'question',
                ${newQuestion.id.toString()},
                ${JSON.stringify({
                  question_en: data.question_en,
                  question_hu: data.question_hu,
                  category: data.category,
                  difficulty: data.difficulty,
                  answer_count: data.answers.length,
                })}
              )
            `;

            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ id: newQuestion.id, success: true }));
            return;
          } catch (error) {
            console.error("Error creating question:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle PUT /api/admin/questions/:id - Update question
        if (
          req.method === "PUT" &&
          req.url?.match(/^\/api\/admin\/questions\/\d+$/)
        ) {
          try {
            const questionId = parseInt(req.url.split("/")[4]);

            // Parse cookies
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            // Decode session token
            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            // Verify admin permissions
            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);

            const [adminUser] = await sql`
              SELECT id, role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              !adminUser.is_active ||
              (adminUser.role !== "admin" && adminUser.role !== "creator")
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Forbidden: Admin access required" })
              );
              return;
            }

            // Get existing question for logging
            const [existingQuestion] = await sql`
              SELECT question_en, question_hu, category, difficulty, is_active
              FROM questions
              WHERE id = ${questionId}
            `;

            if (!existingQuestion) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Question not found" }));
              return;
            }

            // Parse request body
            let body = "";
            for await (const chunk of req) {
              body += chunk.toString();
            }
            const data = JSON.parse(body);

            console.log("📝 Updating question", questionId, "with data:", {
              question_en: data.question_en?.substring(0, 50),
              question_hu: data.question_hu?.substring(0, 50),
              category: data.category,
              difficulty: data.difficulty,
              answersCount: data.answers?.length,
            });

            // Update question
            await sql`
              UPDATE questions
              SET
                question_en = ${data.question_en},
                question_hu = ${data.question_hu},
                category = ${data.category},
                difficulty = ${data.difficulty || null},
                source_name = ${data.source_name || null},
                source_url = ${data.source_url || null},
                is_active = ${
                  data.is_active !== undefined ? data.is_active : true
                },
                updated_at = NOW()
              WHERE id = ${questionId}
            `;

            console.log("✅ Question updated, now updating answers...");

            // Update answers - delete old ones and create new ones
            await sql`DELETE FROM answers WHERE question_id = ${questionId}`;

            console.log(
              "✅ Old answers deleted, inserting",
              data.answers?.length,
              "new answers..."
            );

            for (const answer of data.answers) {
              await sql`
                INSERT INTO answers (
                  question_id,
                  answer_en,
                  answer_hu,
                  order_index,
                  is_alternative
                ) VALUES (
                  ${questionId},
                  ${answer.answer_en},
                  ${answer.answer_hu},
                  ${answer.order_index},
                  ${answer.is_alternative || false}
                )
              `;
            }

            console.log("✅ Answers inserted, building changes log...");

            // Build changes object for logging
            const changes: any = {};
            if (existingQuestion.question_en !== data.question_en) {
              changes.question_en = {
                from: existingQuestion.question_en,
                to: data.question_en,
              };
            }
            if (existingQuestion.question_hu !== data.question_hu) {
              changes.question_hu = {
                from: existingQuestion.question_hu,
                to: data.question_hu,
              };
            }
            if (existingQuestion.category !== data.category) {
              changes.category = {
                from: existingQuestion.category,
                to: data.category,
              };
            }
            if (existingQuestion.difficulty !== data.difficulty) {
              changes.difficulty = {
                from: existingQuestion.difficulty,
                to: data.difficulty,
              };
            }
            if (existingQuestion.is_active !== data.is_active) {
              changes.is_active = {
                from: existingQuestion.is_active,
                to: data.is_active,
              };
            }

            // Log activity
            await sql`
              INSERT INTO admin_activity_log (
                user_id,
                action_type,
                entity_type,
                entity_id,
                details
              ) VALUES (
                ${sessionData.id},
                'update',
                'question',
                ${questionId.toString()},
                ${JSON.stringify(changes)}
              )
            `;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
            return;
          } catch (error) {
            console.error("❌ Error updating question:", error);
            console.error(
              "Error stack:",
              error instanceof Error ? error.stack : "No stack"
            );
            console.error(
              "Error message:",
              error instanceof Error ? error.message : String(error)
            );
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: "Internal server error",
                message: error instanceof Error ? error.message : String(error),
              })
            );
            return;
          }
        }

        // Handle DELETE /api/admin/questions/:id - Delete question
        if (
          req.method === "DELETE" &&
          req.url?.match(/^\/api\/admin\/questions\/\d+$/)
        ) {
          try {
            const questionId = parseInt(req.url.split("/")[4]);

            // Parse cookies
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;

            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            // Decode session token
            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            // Verify admin permissions
            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);

            const [adminUser] = await sql`
              SELECT id, role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              !adminUser.is_active ||
              (adminUser.role !== "admin" && adminUser.role !== "creator")
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Forbidden: Admin access required" })
              );
              return;
            }

            // Get question info for logging
            const [question] = await sql`
              SELECT question_en, question_hu, category
              FROM questions
              WHERE id = ${questionId}
            `;

            if (!question) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Question not found" }));
              return;
            }

            // Delete question (answers will be cascade deleted)
            await sql`DELETE FROM questions WHERE id = ${questionId}`;

            // Log activity
            await sql`
              INSERT INTO admin_activity_log (
                user_id,
                action_type,
                entity_type,
                entity_id,
                details
              ) VALUES (
                ${sessionData.id},
                'delete',
                'question',
                ${questionId.toString()},
                ${JSON.stringify({
                  question_en: question.question_en,
                  question_hu: question.question_hu,
                  category: question.category,
                })}
              )
            `;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
            return;
          } catch (error) {
            console.error("Error deleting question:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle POST /api/questions/:id/track - Track question statistics
        if (
          req.method === "POST" &&
          req.url?.match(/^\/api\/questions\/\d+\/track/)
        ) {
          try {
            const questionId = parseInt(req.url.split("/")[3]);

            // Parse request body
            let body = "";
            for await (const chunk of req) {
              body += chunk.toString();
            }
            const data = JSON.parse(body);

            if (!process.env.POSTGRES_POSTGRES_URL) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Database not configured" }));
              return;
            }

            const sql = neon(process.env.POSTGRES_POSTGRES_URL);

            // Validate the action type
            if (!["played", "completed"].includes(data.action)) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Invalid action type" }));
              return;
            }

            // Update the appropriate counter
            if (data.action === "played") {
              await sql`
                UPDATE questions
                SET times_played = times_played + 1
                WHERE id = ${questionId}
              `;
            } else if (data.action === "completed") {
              await sql`
                UPDATE questions
                SET times_completed = times_completed + 1
                WHERE id = ${questionId}
              `;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
            return;
          } catch (error) {
            console.error("Error tracking question stats:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // ================================================================
        // PACK MANAGEMENT API ENDPOINTS
        // ================================================================

        // Handle GET /api/admin/packs - List all packs (admin only)
        if (
          req.method === "GET" &&
          (req.url === "/api/admin/packs" ||
            req.url?.startsWith("/api/admin/packs?"))
        ) {
          try {
            // Verify admin permissions (same auth as other admin endpoints)
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;
            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            if (sessionData.exp < Date.now()) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Session expired" }));
              return;
            }

            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);
            const [adminUser] = await sql`
              SELECT id, role, is_active
              FROM users
              WHERE id = ${sessionData.id}
              LIMIT 1
            `;

            if (
              !adminUser ||
              adminUser.role !== "admin" ||
              !adminUser.is_active
            ) {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Forbidden" }));
              return;
            }

            // Parse query parameters for filtering
            const url = new URL(req.url, `http://${req.headers.host}`);
            const packType = url.searchParams.get("pack_type") || "all";
            const accessLevel = url.searchParams.get("access_level") || "all";
            const isActive = url.searchParams.get("is_active") || "all";
            const isPublished = url.searchParams.get("is_published") || "all";

            // Build WHERE clause
            const conditions: string[] = [];
            if (packType !== "all")
              conditions.push(`pack_type = '${packType}'`);
            if (accessLevel !== "all")
              conditions.push(`access_level = '${accessLevel}'`);
            if (isActive !== "all")
              conditions.push(`is_active = ${isActive === "active"}`);
            if (isPublished !== "all")
              conditions.push(`is_published = ${isPublished === "published"}`);

            const whereClause =
              conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

            // Use Pool for dynamic query
            const pool = new Pool({
              connectionString: process.env.POSTGRES_POSTGRES_URL!,
            });

            const packsQuery = `
              SELECT 
                id, slug, name_en, name_hu, description_en, description_hu,
                access_level, pack_type, is_active, is_published,
                cover_image_url, icon_url, display_order,
                creator_id, created_at, updated_at, published_at,
                question_count, total_plays, metadata
              FROM question_sets
              ${whereClause}
              ORDER BY display_order ASC, created_at DESC
            `;

            const result = await pool.query(packsQuery);
            const packs = result.rows;
            await pool.end();

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                packs,
                total: packs.length,
              })
            );
            return;
          } catch (error) {
            console.error("Error fetching packs:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle GET /api/admin/packs/:id - Get single pack details
        if (
          req.method === "GET" &&
          req.url?.match(/^\/api\/admin\/packs\/\d+$/)
        ) {
          try {
            // Auth check (same as above)
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;
            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);
            const [adminUser] = await sql`
              SELECT id, role FROM users WHERE id = ${sessionData.id}
            `;

            if (!adminUser || adminUser.role !== "admin") {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Forbidden" }));
              return;
            }

            // Get pack ID from URL
            const packId = parseInt(req.url.split("/").pop()!);

            // Fetch pack details
            const [pack] = await sql`
              SELECT 
                id, slug, name_en, name_hu, description_en, description_hu,
                access_level, pack_type, is_active, is_published,
                cover_image_url, icon_url, display_order,
                creator_id, created_at, updated_at, published_at,
                question_count, total_plays, metadata
              FROM question_sets
              WHERE id = ${packId}
            `;

            if (!pack) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Pack not found" }));
              return;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, pack }));
            return;
          } catch (error) {
            console.error("Error fetching pack:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle POST /api/admin/packs - Create new pack
        if (req.method === "POST" && req.url === "/api/admin/packs") {
          try {
            // Auth check
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;
            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);
            const [adminUser] = await sql`
              SELECT id, role, name FROM users WHERE id = ${sessionData.id}
            `;

            if (!adminUser || adminUser.role !== "admin") {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Forbidden" }));
              return;
            }

            // Parse request body
            let body = "";
            for await (const chunk of req) {
              body += chunk;
            }
            const data = JSON.parse(body);

            // Validate required fields
            if (!data.slug || !data.name_en || !data.name_hu) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing required fields" }));
              return;
            }

            // Create new pack
            const [newPack] = await sql`
              INSERT INTO question_sets (
                slug, name_en, name_hu, description_en, description_hu,
                access_level, pack_type, is_active, is_published,
                display_order, creator_id
              ) VALUES (
                ${data.slug},
                ${data.name_en},
                ${data.name_hu},
                ${data.description_en || ""},
                ${data.description_hu || ""},
                ${data.access_level || "free"},
                ${data.pack_type || "quiz"},
                ${data.is_active !== undefined ? data.is_active : true},
                ${data.is_published !== undefined ? data.is_published : false},
                ${data.display_order || 0},
                ${adminUser.id}
              )
              RETURNING *
            `;

            // Log activity
            await sql`
              INSERT INTO admin_activity_log (
                user_id, action_type, entity_type, entity_id, details
              ) VALUES (
                ${adminUser.id},
                'create',
                'pack',
                ${newPack.id},
                ${{
                  pack_name: data.name_en,
                  pack_type: data.pack_type || "quiz",
                  access_level: data.access_level || "free",
                  admin_name: adminUser.name,
                }}
              )
            `;

            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, pack: newPack }));
            return;
          } catch (error) {
            console.error("Error creating pack:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle PUT /api/admin/packs/:id - Update pack
        if (
          req.method === "PUT" &&
          req.url?.match(/^\/api\/admin\/packs\/\d+$/)
        ) {
          try {
            // Auth check
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;
            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);
            const [adminUser] = await sql`
              SELECT id, role, name FROM users WHERE id = ${sessionData.id}
            `;

            if (!adminUser || adminUser.role !== "admin") {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Forbidden" }));
              return;
            }

            // Get pack ID
            const packId = parseInt(req.url.split("/").pop()!);

            // Parse request body
            let body = "";
            for await (const chunk of req) {
              body += chunk;
            }
            const data = JSON.parse(body);

            // Get old pack data for activity log
            const [oldPack] = await sql`
              SELECT * FROM question_sets WHERE id = ${packId}
            `;

            if (!oldPack) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Pack not found" }));
              return;
            }

            // Update pack
            const [updatedPack] = await sql`
              UPDATE question_sets
              SET
                slug = ${data.slug || oldPack.slug},
                name_en = ${data.name_en || oldPack.name_en},
                name_hu = ${data.name_hu || oldPack.name_hu},
                description_en = ${
                  data.description_en !== undefined
                    ? data.description_en
                    : oldPack.description_en
                },
                description_hu = ${
                  data.description_hu !== undefined
                    ? data.description_hu
                    : oldPack.description_hu
                },
                access_level = ${data.access_level || oldPack.access_level},
                pack_type = ${data.pack_type || oldPack.pack_type},
                is_active = ${
                  data.is_active !== undefined
                    ? data.is_active
                    : oldPack.is_active
                },
                is_published = ${
                  data.is_published !== undefined
                    ? data.is_published
                    : oldPack.is_published
                },
                display_order = ${
                  data.display_order !== undefined
                    ? data.display_order
                    : oldPack.display_order
                },
                updated_at = NOW()
              WHERE id = ${packId}
              RETURNING *
            `;

            // Build changes log
            const changes: any = {};
            if (data.name_en && data.name_en !== oldPack.name_en)
              changes.name_en = { old: oldPack.name_en, new: data.name_en };
            if (data.name_hu && data.name_hu !== oldPack.name_hu)
              changes.name_hu = { old: oldPack.name_hu, new: data.name_hu };
            if (data.access_level && data.access_level !== oldPack.access_level)
              changes.access_level = {
                old: oldPack.access_level,
                new: data.access_level,
              };
            if (data.pack_type && data.pack_type !== oldPack.pack_type)
              changes.pack_type = {
                old: oldPack.pack_type,
                new: data.pack_type,
              };
            if (
              data.is_active !== undefined &&
              data.is_active !== oldPack.is_active
            )
              changes.is_active = {
                old: oldPack.is_active,
                new: data.is_active,
              };
            if (
              data.is_published !== undefined &&
              data.is_published !== oldPack.is_published
            )
              changes.is_published = {
                old: oldPack.is_published,
                new: data.is_published,
              };

            // Log activity
            await sql`
              INSERT INTO admin_activity_log (
                user_id, action_type, entity_type, entity_id, details
              ) VALUES (
                ${adminUser.id},
                'update',
                'pack',
                ${packId},
                ${{
                  pack_name: updatedPack.name_en,
                  changes,
                  admin_name: adminUser.name,
                }}
              )
            `;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, pack: updatedPack }));
            return;
          } catch (error) {
            console.error("Error updating pack:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle DELETE /api/admin/packs/:id - Delete pack
        if (
          req.method === "DELETE" &&
          req.url?.match(/^\/api\/admin\/packs\/\d+$/)
        ) {
          try {
            // Auth check
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const token = cookies.auth_token;
            if (!token) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unauthorized" }));
              return;
            }

            const sessionData = JSON.parse(
              Buffer.from(token, "base64").toString()
            );

            const sql = neon(process.env.POSTGRES_POSTGRES_URL!);
            const [adminUser] = await sql`
              SELECT id, role, name FROM users WHERE id = ${sessionData.id}
            `;

            if (!adminUser || adminUser.role !== "admin") {
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Forbidden" }));
              return;
            }

            // Get pack ID
            const packId = parseInt(req.url.split("/").pop()!);

            // Get pack details for logging
            const [pack] = await sql`
              SELECT name_en, question_count FROM question_sets WHERE id = ${packId}
            `;

            if (!pack) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Pack not found" }));
              return;
            }

            // Check if pack has questions
            if (pack.question_count > 0) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error:
                    "Cannot delete pack with questions. Remove questions first.",
                })
              );
              return;
            }

            // Delete pack
            await sql`
              DELETE FROM question_sets WHERE id = ${packId}
            `;

            // Log activity
            await sql`
              INSERT INTO admin_activity_log (
                user_id, action_type, entity_type, entity_id, details
              ) VALUES (
                ${adminUser.id},
                'delete',
                'pack',
                ${packId},
                ${{
                  pack_name: pack.name_en,
                  admin_name: adminUser.name,
                }}
              )
            `;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message: "Pack deleted successfully",
              })
            );
            return;
          } catch (error) {
            console.error("Error deleting pack:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
          }
        }

        // Handle /api/question-sets (with or without query string)
        if (req.url?.startsWith("/api/question-sets")) {
          try {
            if (!process.env.POSTGRES_POSTGRES_URL) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  error: "Database not configured",
                })
              );
              return;
            }

            const sql = neon(process.env.POSTGRES_POSTGRES_URL);

            // Check authentication status
            const cookies =
              req.headers.cookie?.split(";").reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split("=");
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>) || {};

            const authToken = cookies.auth_token;
            let isAuthenticated = false;
            let userRole = "free";

            if (authToken) {
              try {
                // Decode and check if valid
                const sessionData = JSON.parse(
                  Buffer.from(authToken, "base64").toString()
                );
                isAuthenticated = sessionData.exp >= Date.now();

                // Fetch user role if authenticated
                if (isAuthenticated && sessionData.userId) {
                  const userResult = await sql`
                    SELECT role FROM users WHERE id = ${sessionData.userId}
                  `;
                  if (userResult.length > 0) {
                    userRole = userResult[0].role;
                  }
                }
              } catch (e) {
                // Invalid token
                isAuthenticated = false;
              }
            }

            // Fetch question sets based on authentication and role
            let questionSets;
            if (userRole === "admin" || userRole === "creator") {
              // Admin/Creator: Show ALL packs including admin_only
              questionSets = await sql`
                SELECT 
                  id, slug, name_en, name_hu, description_en, description_hu,
                  access_level, skin, is_active, is_published, cover_image_url, icon_url,
                  display_order, question_count, total_plays, metadata
                FROM question_sets
                WHERE is_active = true AND is_published = true
                ORDER BY display_order ASC, created_at ASC
              `;
            } else if (isAuthenticated) {
              // Premium users: Show free + premium (exclude admin_only)
              questionSets = await sql`
                SELECT 
                  id, slug, name_en, name_hu, description_en, description_hu,
                  access_level, skin, is_active, is_published, cover_image_url, icon_url,
                  display_order, question_count, total_plays, metadata
                FROM question_sets
                WHERE is_active = true AND is_published = true
                  AND access_level IN ('free', 'premium')
                ORDER BY display_order ASC, created_at ASC
              `;
            } else {
              // Unauthenticated: Show free packs only
              questionSets = await sql`
                SELECT 
                  id, slug, name_en, name_hu, description_en, description_hu,
                  access_level, skin, is_active, is_published, cover_image_url, icon_url,
                  display_order, question_count, total_plays, metadata
                FROM question_sets
                WHERE is_active = true AND is_published = true
                  AND access_level = 'free'
                ORDER BY display_order ASC, created_at ASC
              `;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                questionSets: questionSets,
                count: questionSets.length,
                isAuthenticated,
              })
            );
            return;
          } catch (error) {
            console.error("API Error:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                error: "Failed to fetch question sets",
              })
            );
            return;
          }
        }

        // Handle /api/questions/:slug
        if (req.url?.startsWith("/api/questions/")) {
          try {
            // Remove query string from slug
            const packSlug = req.url.split("/api/questions/")[1].split("?")[0];

            if (!process.env.POSTGRES_POSTGRES_URL) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  error: "Database not configured",
                })
              );
              return;
            }

            const sql = neon(process.env.POSTGRES_POSTGRES_URL);

            // Fetch question set
            const questionSets = await sql`
              SELECT id, slug, name_en, name_hu, description_en, description_hu
              FROM question_sets
              WHERE slug = ${packSlug} AND is_active = true AND is_published = true
            `;

            if (questionSets.length === 0) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  error: "Question pack not found",
                })
              );
              return;
            }

            const questionSet = questionSets[0];

            // Fetch questions with answers
            const questions = await sql`
              SELECT 
                q.id, q.question_en, q.question_hu, q.category, q.difficulty,
                q.source_name, q.source_url, q.order_index,
                json_agg(
                  json_build_object(
                    'id', a.id,
                    'answer_en', a.answer_en,
                    'answer_hu', a.answer_hu,
                    'order_index', a.order_index
                  ) ORDER BY a.order_index
                ) as answers
              FROM questions q
              LEFT JOIN answers a ON a.question_id = q.id
              WHERE q.set_id = ${questionSet.id} AND q.is_active = true
              GROUP BY q.id, q.question_en, q.question_hu, q.category, 
                       q.difficulty, q.source_name, q.source_url, q.order_index
              ORDER BY q.order_index ASC
            `;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                questionSet,
                questions,
                count: questions.length,
              })
            );
            return;
          } catch (error) {
            console.error("API Error:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                error: "Failed to fetch questions",
              })
            );
            return;
          }
        }

        // Handle /api/rooms (Multiplayer game rooms)
        if (req.url?.startsWith("/api/rooms")) {
          try {
            // Import the rooms handler dynamically
            const roomsHandler = await import("./api/rooms.ts");

            // Create Vercel-compatible request/response objects
            const vercelReq: any = {
              method: req.method,
              headers: req.headers,
              query: {},
              body: null,
              socket: req.socket,
            };

            // Parse query string
            if (req.url.includes("?")) {
              const urlParams = new URLSearchParams(req.url.split("?")[1]);
              urlParams.forEach((value, key) => {
                vercelReq.query[key] = value;
              });
            }

            // Parse body for POST requests
            if (req.method === "POST") {
              let body = "";
              for await (const chunk of req) {
                body += chunk;
              }
              if (body) {
                try {
                  vercelReq.body = JSON.parse(body);
                } catch {
                  vercelReq.body = body;
                }
              }
            }

            const vercelRes: any = {
              statusCode: 200,
              headers: {},
              setHeader(name: string, value: string | number) {
                this.headers[name] = value;
                res.setHeader(name, value);
                return this;
              },
              status(code: number) {
                this.statusCode = code;
                res.statusCode = code;
                return this;
              },
              json(data: any) {
                this.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
                return this;
              },
              end(data?: any) {
                res.end(data);
                return this;
              },
            };

            // Call the handler
            await roomsHandler.default(vercelReq, vercelRes);
            return;
          } catch (error) {
            console.error("Multiplayer API Error:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                error: "Failed to process multiplayer request",
              })
            );
            return;
          }
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiRoutesPlugin(), // Add API routes handler for development
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": resolve(projectRoot, "src"),
    },
  },
  build: {
    // Better browser compatibility - target older browsers
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    // CSS target for better color space fallbacks
    cssTarget: ["chrome87", "safari14"],
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        // Ensure service worker is not hashed
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "sw.js") {
            return "sw.js";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  // Optimize dependencies for better compatibility
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion"],
    esbuildOptions: {
      target: "es2020",
    },
  },
});
