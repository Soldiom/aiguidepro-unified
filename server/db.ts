import { eq, desc, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, agents, tasks, workflows, agentLogs, integrations, Agent, Task, Workflow, InsertAgent, InsertTask, InsertWorkflow, InsertAgentLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// AGENTS
// ============================================================================

export async function createAgent(agent: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(agents).values(agent);
  return result;
}

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(agents).orderBy(desc(agents.createdAt));
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAgentsByType(type: Agent['type']) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(agents).where(eq(agents.type, type));
}

export async function getAgentsByStatus(status: Agent['status']) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(agents).where(eq(agents.status, status));
}

export async function updateAgent(id: number, updates: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(agents).set(updates).where(eq(agents.id, id));
}

export async function deleteAgent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(agents).where(eq(agents.id, id));
}

// ============================================================================
// TASKS
// ============================================================================

export async function createTask(task: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tasks).values(task);
  return result;
}

export async function getAllTasks() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTasksByAgent(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks).where(eq(tasks.agentId, agentId)).orderBy(desc(tasks.createdAt));
}

export async function getTasksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
}

export async function getTasksByStatus(status: Task['status']) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks).where(eq(tasks.status, status)).orderBy(desc(tasks.createdAt));
}

export async function getPendingTasks() {
  const db = await getDb();
  if (!db) return [];
  
  const pendingTasks = await db.select().from(tasks)
    .where(eq(tasks.status, 'pending'))
    .orderBy(desc(tasks.priority), desc(tasks.createdAt));
  
  const queuedTasks = await db.select().from(tasks)
    .where(eq(tasks.status, 'queued'))
    .orderBy(desc(tasks.priority), desc(tasks.createdAt));
  
  return [...pendingTasks, ...queuedTasks];
}

export async function updateTask(id: number, updates: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(tasks).set(updates).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(tasks).where(eq(tasks.id, id));
}

// ============================================================================
// WORKFLOWS
// ============================================================================

export async function createWorkflow(workflow: InsertWorkflow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workflows).values(workflow);
  return result;
}

export async function getAllWorkflows() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(workflows).orderBy(desc(workflows.createdAt));
}

export async function getWorkflowById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getActiveWorkflows() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(workflows).where(eq(workflows.status, 'active'));
}

export async function updateWorkflow(id: number, updates: Partial<InsertWorkflow>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(workflows).set(updates).where(eq(workflows.id, id));
}

export async function deleteWorkflow(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(workflows).where(eq(workflows.id, id));
}

// ============================================================================
// AGENT LOGS
// ============================================================================

export async function createAgentLog(log: InsertAgentLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(agentLogs).values(log);
}

export async function getAgentLogs(agentId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(agentLogs)
    .where(eq(agentLogs.agentId, agentId))
    .orderBy(desc(agentLogs.timestamp))
    .limit(limit);
}

export async function getTaskLogs(taskId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(agentLogs)
    .where(eq(agentLogs.taskId, taskId))
    .orderBy(desc(agentLogs.timestamp));
}

// ============================================================================
// INTEGRATIONS
// ============================================================================

export async function getAllIntegrations() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(integrations).orderBy(desc(integrations.createdAt));
}

export async function getActiveIntegrations() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(integrations).where(eq(integrations.status, 'active'));
}

export async function updateIntegration(id: number, updates: Partial<typeof integrations.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(integrations).set(updates).where(eq(integrations.id, id));
}
