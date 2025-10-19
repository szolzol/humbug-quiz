/**
 * Set Admin Role for User
 *
 * This script sets a user's role to 'admin' in the database.
 * Use this to grant admin access to specific users.
 *
 * Usage:
 *   node set-admin-role.js <email>
 *
 * Example:
 *   node set-admin-role.js user@example.com
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../.env.local" });

async function setAdminRole() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Error: Email address is required");
    console.log("\nUsage:");
    console.log("  node set-admin-role.js <email>");
    console.log("\nExample:");
    console.log("  node set-admin-role.js user@example.com");
    process.exit(1);
  }

  const dbUrl = process.env.POSTGRES_POSTGRES_URL;

  if (!dbUrl) {
    console.error("❌ Error: POSTGRES_POSTGRES_URL not found in environment");
    console.log("Make sure .env.local exists with database connection string");
    process.exit(1);
  }

  console.log("🔧 Setting admin role...");
  console.log(`   Email: ${email}`);
  console.log(`   Database: ${dbUrl.split("@")[1]?.split("?")[0] || "hidden"}`);
  console.log();

  try {
    const sql = neon(dbUrl);

    // First, check if user exists
    const [existingUser] = await sql`
      SELECT id, email, name, role, is_active
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (!existingUser) {
      console.error(`❌ User not found with email: ${email}`);
      console.log(
        "\nThe user must log in at least once before you can grant admin access."
      );
      console.log("After they log in, run this script again.");
      process.exit(1);
    }

    console.log("✅ User found:");
    console.log(`   ID: ${existingUser.id}`);
    console.log(`   Name: ${existingUser.name}`);
    console.log(`   Email: ${existingUser.email}`);
    console.log(`   Current Role: ${existingUser.role}`);
    console.log(`   Active: ${existingUser.is_active}`);
    console.log();

    if (existingUser.role === "admin") {
      console.log("ℹ️  User already has admin role. Nothing to do.");
      process.exit(0);
    }

    // Update user role to admin
    const [updatedUser] = await sql`
      UPDATE users
      SET role = 'admin',
          updated_at = NOW()
      WHERE email = ${email}
      RETURNING id, email, name, role, is_active
    `;

    console.log("✅ Role updated successfully!");
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   New Role: ${updatedUser.role}`);
    console.log();
    console.log("🎉 User now has admin access!");
    console.log();
    console.log(
      "⚠️  Important: The user needs to log out and log back in for the role change to take effect."
    );
    console.log(
      "   The role is cached in their session token, which expires in 7 days."
    );
    console.log();
    console.log("   To force immediate effect:");
    console.log("   1. Have the user click 'Logout' in the app");
    console.log("   2. Have them log in again");
    console.log("   3. They should now see the admin panel");
  } catch (error) {
    console.error("❌ Error updating role:", error);
    process.exit(1);
  }
}

setAdminRole();
