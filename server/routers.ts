import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as licenseDb from "./license-db";
import { getLicenseGenerator, LicenseGenerator } from "./license-generator";
import { trainingScheduler } from "./training-scheduler";
import { DataCollector } from "./data-collector";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Automation & Training
  automation: router({
    // Start automated 24/7 training
    start: publicProcedure.mutation(async () => {
      await trainingScheduler.start();
      return { success: true, message: "Automated training started" };
    }),

    // Stop automated training
    stop: publicProcedure.mutation(async () => {
      trainingScheduler.stop();
      return { success: true, message: "Automated training stopped" };
    }),

    // Get training status
    status: publicProcedure.query(async () => {
      return trainingScheduler.getStatus();
    }),

    // Get available specialized models
    models: publicProcedure.query(async () => {
      return trainingScheduler.getAvailableModels();
    }),

    // Collect data manually
    collect: publicProcedure.mutation(async () => {
      const collector = new DataCollector();
      const data = await collector.collectAll();
      return { success: true, data: data.summary };
    }),
  }),

  // Agent Management
  agents: router({
    list: publicProcedure.query(async () => {
      return await db.getAllAgents();
    }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAgentById(input.id);
      }),
    
    byType: publicProcedure
      .input(z.object({ 
        type: z.enum(["research", "development", "content", "project_management", "business", "tutor"])
      }))
      .query(async ({ input }) => {
        return await db.getAgentsByType(input.type);
      }),
    
    byStatus: publicProcedure
      .input(z.object({ 
        status: z.enum(["active", "inactive", "busy", "error"])
      }))
      .query(async ({ input }) => {
        return await db.getAgentsByStatus(input.status);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(["research", "development", "content", "project_management", "business", "tutor"]),
        description: z.string().optional(),
        capabilities: z.string().optional(),
        config: z.string().optional(),
        toolIntegrations: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAgent(input);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        capabilities: z.string().optional(),
        status: z.enum(["active", "inactive", "busy", "error"]).optional(),
        config: z.string().optional(),
        toolIntegrations: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateAgent(id, updates);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAgent(input.id);
      }),
  }),

  // Task Management
  tasks: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTasks();
    }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTaskById(input.id);
      }),
    
    byAgent: publicProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTasksByAgent(input.agentId);
      }),
    
    byUser: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTasksByUser(ctx.user.id);
    }),
    
    byStatus: publicProcedure
      .input(z.object({ 
        status: z.enum(["pending", "queued", "running", "completed", "failed", "cancelled"])
      }))
      .query(async ({ input }) => {
        return await db.getTasksByStatus(input.status);
      }),
    
    pending: publicProcedure.query(async () => {
      return await db.getPendingTasks();
    }),
    
    create: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        workflowId: z.number().optional(),
        type: z.string(),
        title: z.string(),
        description: z.string().optional(),
        input: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTask({
          ...input,
          userId: ctx.user.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        agentId: z.number().optional(),
        status: z.enum(["pending", "queued", "running", "completed", "failed", "cancelled"]).optional(),
        progress: z.number().optional(),
        output: z.string().optional(),
        errorMessage: z.string().optional(),
        startedAt: z.date().optional(),
        completedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateTask(id, updates);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTask(input.id);
      }),
  }),

  // Workflow Management
  workflows: router({
    list: publicProcedure.query(async () => {
      return await db.getAllWorkflows();
    }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getWorkflowById(input.id);
      }),
    
    active: publicProcedure.query(async () => {
      return await db.getActiveWorkflows();
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        steps: z.string().optional(),
        triggers: z.string().optional(),
        status: z.enum(["active", "inactive", "draft"]).default("draft"),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createWorkflow({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        steps: z.string().optional(),
        triggers: z.string().optional(),
        status: z.enum(["active", "inactive", "draft"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateWorkflow(id, updates);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteWorkflow(input.id);
      }),
  }),

  // Agent Logs
  logs: router({
    byAgent: publicProcedure
      .input(z.object({ 
        agentId: z.number(),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return await db.getAgentLogs(input.agentId, input.limit);
      }),
    
    byTask: publicProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTaskLogs(input.taskId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        taskId: z.number().optional(),
        level: z.enum(["info", "warning", "error", "debug"]).default("info"),
        message: z.string(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAgentLog(input);
      }),
  }),

  // Licensing System
  licensing: router({
    // Generate new license
    generate: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        maxActivations: z.number().default(1),
        expiresInDays: z.number().optional(),
        purchaseId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const generator = getLicenseGenerator();
        const licenseKey = generator.generateLicenseKey(
          input.email,
          input.maxActivations,
          input.expiresInDays
        );

        await licenseDb.createLicense({
          licenseKey,
          email: input.email,
          purchaseId: input.purchaseId,
          maxActivations: input.maxActivations,
          currentActivations: 0,
          expiresAt: input.expiresInDays 
            ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
            : undefined,
          status: 'active',
        });

        return { licenseKey };
      }),

    // Validate license key
    validate: publicProcedure
      .input(z.object({
        licenseKey: z.string(),
      }))
      .query(async ({ input }) => {
        const generator = getLicenseGenerator();
        const validation = generator.validateLicenseKey(input.licenseKey);
        
        if (!validation.valid) {
          return { valid: false, error: validation.error };
        }

        const license = await licenseDb.getLicenseByKey(input.licenseKey);
        if (!license) {
          return { valid: false, error: 'License not found in database' };
        }

        if (license.status !== 'active') {
          return { valid: false, error: `License is ${license.status}` };
        }

        return {
          valid: true,
          license: {
            email: license.email,
            maxActivations: license.maxActivations,
            currentActivations: license.currentActivations,
            expiresAt: license.expiresAt,
          }
        };
      }),

    // Activate license on a machine
    activate: publicProcedure
      .input(z.object({
        licenseKey: z.string(),
        hardwareId: z.string(),
        machineName: z.string().optional(),
        os: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const license = await licenseDb.getLicenseByKey(input.licenseKey);
        if (!license) {
          throw new Error('License not found');
        }

        if (license.status !== 'active') {
          throw new Error(`License is ${license.status}`);
        }

        // Check if already activated on this machine
        const existingActivation = await licenseDb.getActivationByHardwareId(
          license.id,
          input.hardwareId
        );

        if (existingActivation) {
          await licenseDb.updateLastSeen(existingActivation.id);
          return { success: true, alreadyActivated: true };
        }

        // Check activation limit
        if (license.currentActivations >= license.maxActivations) {
          throw new Error('Maximum activations reached');
        }

        // Create activation
        await licenseDb.createActivation({
          licenseId: license.id,
          hardwareId: input.hardwareId,
          machineName: input.machineName,
          os: input.os,
          status: 'active',
        });

        await licenseDb.incrementActivationCount(license.id);

        const generator = getLicenseGenerator();
        const activationToken = generator.createActivationToken(
          input.licenseKey,
          input.hardwareId
        );

        return {
          success: true,
          alreadyActivated: false,
          activationToken,
        };
      }),

    // Deactivate license on a machine
    deactivate: publicProcedure
      .input(z.object({
        licenseKey: z.string(),
        hardwareId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const license = await licenseDb.getLicenseByKey(input.licenseKey);
        if (!license) {
          throw new Error('License not found');
        }

        const activation = await licenseDb.getActivationByHardwareId(
          license.id,
          input.hardwareId
        );

        if (!activation) {
          throw new Error('Activation not found');
        }

        await licenseDb.deactivateActivation(activation.id);
        await licenseDb.decrementActivationCount(license.id);

        return { success: true };
      }),

    // Get license info
    info: publicProcedure
      .input(z.object({
        licenseKey: z.string(),
      }))
      .query(async ({ input }) => {
        const license = await licenseDb.getLicenseByKey(input.licenseKey);
        if (!license) {
          throw new Error('License not found');
        }

        const activations = await licenseDb.getActivationsByLicense(license.id);

        return {
          email: license.email,
          status: license.status,
          maxActivations: license.maxActivations,
          currentActivations: license.currentActivations,
          expiresAt: license.expiresAt,
          createdAt: license.createdAt,
          activations: activations.map(a => ({
            machineName: a.machineName,
            os: a.os,
            activatedAt: a.activatedAt,
            lastSeenAt: a.lastSeenAt,
          })),
        };
      }),

    // Get licenses by email
    byEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .query(async ({ input }) => {
        return await licenseDb.getLicensesByEmail(input.email);
      }),

    // Admin: Get all license stats
    stats: protectedProcedure.query(async () => {
      return await licenseDb.getLicenseStats();
    }),

    // Admin: Get recent purchases
    recentPurchases: protectedProcedure
      .input(z.object({
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        return await licenseDb.getRecentPurchases(input.limit);
      }),
  }),

  // Integrations
  integrations: router({
    list: publicProcedure.query(async () => {
      return await db.getAllIntegrations();
    }),
    
    active: publicProcedure.query(async () => {
      return await db.getActiveIntegrations();
    }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "inactive", "error"]).optional(),
        healthCheck: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateIntegration(id, updates);
      }),
  }),
});

export type AppRouter = typeof appRouter;
