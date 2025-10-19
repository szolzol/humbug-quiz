/**
 * List All Users
 *
 * This script lists all users in the database with their roles.
 * Useful for checking who has admin access and managing users.
 *
 * Usage:
 *   node list-users.js
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../.env.local" });

async function listUsers() {
  const dbUrl = process.env.POSTGRES_POSTGRES_URL;

  if (!dbUrl) {
    console.error("❌ Error: POSTGRES_POSTGRES_URL not found in environment");
    console.log("Make sure .env.local exists with database connection string");
    process.exit(1);
  }

  console.log("📋 Fetching all users from database...");
  console.log(`   Database: ${dbUrl.split("@")[1]?.split("?")[0] || "hidden"}`);
  console.log();

  try {
    const sql = neon(dbUrl);

    const users = await sql`
      SELECT 
        id,
        email,
        name,
        role,
        is_active,
        last_login,
        created_at
      FROM users
      ORDER BY 
        CASE role 
          WHEN 'creator' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'premium' THEN 3
          WHEN 'free' THEN 4
        END,
        created_at DESC
    `;

    if (users.length === 0) {
      console.log("ℹ️  No users found in database.");
      console.log("   Users are created automatically when they first log in.");
      process.exit(0);
    }

    console.log(`✅ Found ${users.length} user(s):\n`);

    // Count by role
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log("📊 User Breakdown:");
    Object.entries(roleCounts).forEach(([role, count]) => {
      const emoji =
        {
          creator: "👑",
          admin: "🔑",
          premium: "⭐",
          free: "👤",
        }[role] || "❓";
      console.log(`   ${emoji} ${role}: ${count}`);
    });
    console.log();

    // Display user table
    console.log("━".repeat(120));
    console.log(
      "ID".padEnd(25) +
        "EMAIL".padEnd(30) +
        "NAME".padEnd(25) +
        "ROLE".padEnd(15) +
        "ACTIVE".padEnd(10) +
        "LAST LOGIN"
    );
    console.log("━".repeat(120));

    users.forEach((user) => {
      const roleEmoji =
        {
          creator: "👑",
          admin: "🔑",
          premium: "⭐",
          free: "👤",
        }[user.role] || "❓";

      const activeStatus = user.is_active ? "✅" : "❌";

      const lastLogin = user.last_login
        ? new Date(user.last_login).toLocaleDateString()
        : "Never";

      console.log(
        user.id.substring(0, 23).padEnd(25) +
          user.email.substring(0, 28).padEnd(30) +
          (user.name || "N/A").substring(0, 23).padEnd(25) +
          `${roleEmoji} ${user.role}`.padEnd(15) +
          activeStatus.padEnd(10) +
          lastLogin
      );
    });
    console.log("━".repeat(120));
    console.log();

    // Show admin users specifically
    const admins = users.filter(
      (u) => u.role === "admin" || u.role === "creator"
    );
    if (admins.length > 0) {
      console.log("🔑 Admin Users:");
      admins.forEach((admin) => {
        console.log(
          `   ${admin.role === "creator" ? "👑" : "🔑"} ${admin.email} (${
            admin.name
          })`
        );
      });
      console.log();
    }

    // Show suggestions
    console.log("💡 To grant admin access to a user:");
    console.log("   node set-admin-role.js <email>");
    console.log();
    console.log("   Example:");
    console.log("   node set-admin-role.js user@example.com");
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    process.exit(1);
  }
}

listUsers();
