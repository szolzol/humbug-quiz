/**
 * Activity Logger for Admin Panel
 * Provides functions to log administrative actions for audit trail
 */

import { neon } from "@neondatabase/serverless";
import type { IncomingMessage } from "http";

const sql = neon(process.env.DATABASE_URL!);

export interface ActivityLogEntry {
  userId: string; // Google user ID (TEXT)
  actionType: "create" | "update" | "delete" | "view" | "export" | "login" | "logout";
  entityType?: "user" | "question" | "pack" | "settings" | string;
  entityId?: string | number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an administrative action to the activity log
 */
export async function logActivity(entry: ActivityLogEntry): Promise<void> {
  try {
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
        ${entry.userId},
        ${entry.actionType},
        ${entry.entityType || null},
        ${entry.entityId?.toString() || null},
        ${entry.details ? JSON.stringify(entry.details) : null},
        ${entry.ipAddress || null},
        ${entry.userAgent || null}
      )
    `;
  } catch (error) {
    // Log the error but don't throw - activity logging should not break the app
    console.error("Failed to log activity:", error);
  }
}

/**
 * Extract IP address from request
 */
export function extractIpAddress(req: IncomingMessage): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress;
}

/**
 * Extract user agent from request
 */
export function extractUserAgent(req: IncomingMessage): string | undefined {
  const userAgent = req.headers["user-agent"];
  return typeof userAgent === "string" ? userAgent : undefined;
}

/**
 * Log activity from an HTTP request context
 */
export async function logActivityFromRequest(
  req: IncomingMessage,
  userId: string,
  actionType: ActivityLogEntry["actionType"],
  options?: Omit<ActivityLogEntry, "userId" | "actionType" | "ipAddress" | "userAgent">
): Promise<void> {
  await logActivity({
    userId,
    actionType,
    ...options,
    ipAddress: extractIpAddress(req),
    userAgent: extractUserAgent(req),
  });
}
