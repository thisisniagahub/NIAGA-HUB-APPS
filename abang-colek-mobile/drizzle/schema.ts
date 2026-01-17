import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// WOCS (WhatsApp OPS Control System) Tables

export const wocsUsers = mysqlTable("wocs_users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["admin", "agent", "viewer"]).notNull(),
  waNumber: varchar("waNumber", { length: 20 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const wocsTasks = mysqlTable("wocs_tasks", {
  id: varchar("id", { length: 20 }).primaryKey(), // TASK-XXXX
  type: varchar("type", { length: 50 }).notNull(),
  commandRaw: text("commandRaw").notNull(),
  payload: text("payload").notNull(), // JSON string
  status: mysqlEnum("status", [
    "pending",
    "awaiting_approval",
    "running",
    "done",
    "failed",
    "cancelled",
    "rolled_back",
  ]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["high", "normal", "low"]).default("normal").notNull(),
  requestedBy: int("requestedBy"),
  assignedTo: int("assignedTo"),
  scheduledAt: timestamp("scheduledAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  result: text("result"), // JSON string
  retryCount: int("retryCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const wocsTaskLogs = mysqlTable("wocs_task_logs", {
  id: int("id").autoincrement().primaryKey(),
  taskId: varchar("taskId", { length: 20 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  actorId: int("actorId"),
  details: text("details"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const wocsAttachments = mysqlTable("wocs_attachments", {
  id: int("id").autoincrement().primaryKey(),
  taskId: varchar("taskId", { length: 20 }).notNull(),
  type: mysqlEnum("type", ["image", "video", "audio", "document"]).notNull(),
  originalName: varchar("originalName", { length: 255 }),
  storageUrl: text("storageUrl").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  sizeBytes: int("sizeBytes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const wocsLandingVersions = mysqlTable("wocs_landing_versions", {
  id: int("id").autoincrement().primaryKey(),
  pageSlug: varchar("pageSlug", { length: 100 }).notNull(),
  version: int("version").notNull(),
  content: text("content").notNull(), // JSON string
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const wocsAppConfigs = mysqlTable("wocs_app_configs", {
  id: int("id").autoincrement().primaryKey(),
  appName: varchar("appName", { length: 50 }).notNull(),
  configKey: varchar("configKey", { length: 100 }).notNull(),
  configValue: text("configValue").notNull(), // JSON string
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Type exports
export type WocsUser = typeof wocsUsers.$inferSelect;
export type InsertWocsUser = typeof wocsUsers.$inferInsert;
export type WocsTask = typeof wocsTasks.$inferSelect;
export type InsertWocsTask = typeof wocsTasks.$inferInsert;
export type WocsTaskLog = typeof wocsTaskLogs.$inferSelect;
export type InsertWocsTaskLog = typeof wocsTaskLogs.$inferInsert;
