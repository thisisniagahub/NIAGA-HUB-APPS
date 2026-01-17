import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  wocsUsers,
  wocsTasks,
  wocsTaskLogs,
  wocsAttachments,
  wocsLandingVersions,
  wocsAppConfigs,
  type WocsUser,
  type InsertWocsUser,
  type WocsTask,
  type InsertWocsTask,
  type WocsTaskLog,
  type InsertWocsTaskLog,
} from "../drizzle/schema";

// ============================================================================
// WOCS Users
// ============================================================================

export async function getWocsUserByWaNumber(waNumber: string): Promise<WocsUser | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db.select().from(wocsUsers).where(eq(wocsUsers.waNumber, waNumber)).limit(1);
  return results[0] || null;
}

export async function createWocsUser(data: InsertWocsUser): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(wocsUsers).values(data);
  return result[0].insertId;
}

export async function getAllWocsUsers(): Promise<WocsUser[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(wocsUsers);
}

// ============================================================================
// WOCS Tasks
// ============================================================================

export async function createWocsTask(data: InsertWocsTask): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(wocsTasks).values(data);
  return data.id;
}

export async function getWocsTask(taskId: string): Promise<WocsTask | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db.select().from(wocsTasks).where(eq(wocsTasks.id, taskId)).limit(1);
  return results[0] || null;
}

export async function updateWocsTaskStatus(
  taskId: string,
  status: WocsTask["status"],
  updates?: Partial<WocsTask>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(wocsTasks)
    .set({
      status,
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(wocsTasks.id, taskId));
}

export async function getWocsTasksByStatus(status: WocsTask["status"]): Promise<WocsTask[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(wocsTasks).where(eq(wocsTasks.status, status)).orderBy(desc(wocsTasks.createdAt));
}

export async function getWocsTasksByAssignee(userId: number): Promise<WocsTask[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(wocsTasks).where(eq(wocsTasks.assignedTo, userId)).orderBy(desc(wocsTasks.createdAt));
}

export async function getAllWocsTasks(limit: number = 50): Promise<WocsTask[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(wocsTasks).orderBy(desc(wocsTasks.createdAt)).limit(limit);
}

// ============================================================================
// WOCS Task Logs
// ============================================================================

export async function createWocsTaskLog(data: InsertWocsTaskLog): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(wocsTaskLogs).values(data);
  return result[0].insertId;
}

export async function getWocsTaskLogs(taskId: string): Promise<WocsTaskLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(wocsTaskLogs).where(eq(wocsTaskLogs.taskId, taskId)).orderBy(desc(wocsTaskLogs.createdAt));
}

// ============================================================================
// WOCS Attachments
// ============================================================================

export async function createWocsAttachment(data: {
  taskId: string;
  type: "image" | "video" | "audio" | "document";
  originalName?: string;
  storageUrl: string;
  mimeType?: string;
  sizeBytes?: number;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(wocsAttachments).values(data);
  return result[0].insertId;
}

export async function getWocsTaskAttachments(taskId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(wocsAttachments).where(eq(wocsAttachments.taskId, taskId));
}

// ============================================================================
// WOCS Landing Pages
// ============================================================================

export async function createLandingVersion(data: {
  pageSlug: string;
  version: number;
  content: string; // JSON string
  status?: "draft" | "published" | "archived";
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(wocsLandingVersions).values(data);
  return result[0].insertId;
}

export async function getLatestLandingVersion(pageSlug: string) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(wocsLandingVersions)
    .where(eq(wocsLandingVersions.pageSlug, pageSlug))
    .orderBy(desc(wocsLandingVersions.version))
    .limit(1);

  return results[0] || null;
}

// ============================================================================
// WOCS App Configs
// ============================================================================

export async function upsertAppConfig(data: {
  appName: string;
  configKey: string;
  configValue: string; // JSON string
  updatedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if exists
  const existing = await db
    .select()
    .from(wocsAppConfigs)
    .where(and(eq(wocsAppConfigs.appName, data.appName), eq(wocsAppConfigs.configKey, data.configKey)))
    .limit(1);

  if (existing.length > 0) {
    // Update
    await db
      .update(wocsAppConfigs)
      .set({
        configValue: data.configValue,
        updatedBy: data.updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(wocsAppConfigs.id, existing[0].id));
    return existing[0].id;
  } else {
    // Insert
    const result = await db.insert(wocsAppConfigs).values(data);
    return result[0].insertId;
  }
}

export async function getAppConfig(appName: string, configKey: string) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(wocsAppConfigs)
    .where(and(eq(wocsAppConfigs.appName, appName), eq(wocsAppConfigs.configKey, configKey)))
    .limit(1);

  return results[0] || null;
}

// ============================================================================
// Helper: Generate Task ID
// ============================================================================

export async function generateTaskId(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get latest task ID
  const latest = await db.select().from(wocsTasks).orderBy(desc(wocsTasks.id)).limit(1);

  if (latest.length === 0) {
    return "TASK-1001";
  }

  const lastId = latest[0].id;
  const lastNumber = parseInt(lastId.split("-")[1]);
  const nextNumber = lastNumber + 1;

  return `TASK-${nextNumber}`;
}
