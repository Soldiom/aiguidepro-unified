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
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

/**
 * Licensing system tables
 */
export const licenses = mysqlTable("licenses", {
  id: int("id").autoincrement().primaryKey(),
  licenseKey: varchar("licenseKey", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  purchaseId: varchar("purchaseId", { length: 255 }),
  maxActivations: int("maxActivations").default(1).notNull(),
  currentActivations: int("currentActivations").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  status: mysqlEnum("status", ["active", "expired", "revoked"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const activations = mysqlTable("activations", {
  id: int("id").autoincrement().primaryKey(),
  licenseId: int("licenseId").notNull(),
  hardwareId: varchar("hardwareId", { length: 255 }).notNull(),
  machineName: varchar("machineName", { length: 255 }),
  os: varchar("os", { length: 100 }),
  activatedAt: timestamp("activatedAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "deactivated"]).default("active").notNull(),
});

export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  quantity: int("quantity").default(1).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentId: varchar("paymentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type License = typeof licenses.$inferSelect;
export type InsertLicense = typeof licenses.$inferInsert;
export type Activation = typeof activations.$inferSelect;
export type InsertActivation = typeof activations.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

// TODO: Add your tables here

/**
 * Agentic AI employees
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["research", "development", "content", "project_management", "business", "tutor"]).notNull(),
  description: text("description"),
  capabilities: text("capabilities"), // JSON array of capabilities
  status: mysqlEnum("status", ["active", "inactive", "busy", "error"]).default("inactive").notNull(),
  config: text("config"), // JSON configuration for the agent
  toolIntegrations: text("toolIntegrations"), // JSON array of integrated tools
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Tasks table - stores all tasks assigned to agents
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").references(() => agents.id),
  userId: int("userId").references(() => users.id),
  workflowId: int("workflowId"),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  input: text("input"), // JSON input data
  output: text("output"), // JSON output/result
  status: mysqlEnum("status", ["pending", "queued", "running", "completed", "failed", "cancelled"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  progress: int("progress").default(0),
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Workflows table - stores workflow definitions
 */
export const workflows = mysqlTable("workflows", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  steps: text("steps"), // JSON array of workflow steps
  triggers: text("triggers"), // JSON array of trigger conditions
  status: mysqlEnum("status", ["active", "inactive", "draft"]).default("draft").notNull(),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

/**
 * Agent Logs table - stores all agent activity logs
 */
export const agentLogs = mysqlTable("agentLogs", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").references(() => agents.id),
  taskId: int("taskId").references(() => tasks.id),
  level: mysqlEnum("level", ["info", "warning", "error", "debug"]).default("info").notNull(),
  message: text("message").notNull(),
  metadata: text("metadata"), // JSON metadata
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = typeof agentLogs.$inferInsert;

/**
 * Integrations table - stores external tool integrations
 */
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["agenticseek", "flowise", "browser_use", "metagpt", "custom"]).notNull(),
  endpoint: varchar("endpoint", { length: 500 }),
  apiKey: varchar("apiKey", { length: 500 }),
  status: mysqlEnum("status", ["active", "inactive", "error"]).default("inactive").notNull(),
  config: text("config"), // JSON configuration
  healthCheck: timestamp("healthCheck"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;