/**
 * Multi-Agent Orchestration System
 * Coordinates multiple AI agents to work together on complex tasks
 */

import type { Agent, Task } from '../drizzle/schema';
import { getDb } from './db';
import { agents, tasks } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface AgentCapability {
  agentId: number;
  type: string;
  skills: string[];
  availability: 'available' | 'busy' | 'offline';
}

export interface OrchestrationTask {
  id: number;
  description: string;
  requiredSkills: string[];
  priority: string;
  status: string;
}

export interface TaskAssignment {
  taskId: number;
  agentId: number;
  subtasks: string[];
  dependencies: number[];
}

export class MultiAgentOrchestrator {
  private agentCapabilities: Map<number, AgentCapability> = new Map();

  /**
   * Initialize orchestrator with available agents
   */
  async initialize(): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn('[Orchestrator] Database not available, using empty agent list');
        return;
      }
      
      const allAgents = await db.select().from(agents).where(eq(agents.status, 'active'));
      
      for (const agent of allAgents) {
        const capabilities = JSON.parse(agent.capabilities || '[]');
        this.agentCapabilities.set(agent.id, {
          agentId: agent.id,
          type: agent.type,
          skills: capabilities,
          availability: 'available',
        });
      }
      
      console.log(`Initialized orchestrator with ${this.agentCapabilities.size} agents`);
    } catch (error) {
      console.error('Failed to initialize orchestrator:', error);
      throw error;
    }
  }

  /**
   * Find the best agent for a specific task
   */
  findBestAgent(requiredSkills: string[]): number | null {
    let bestAgent: number | null = null;
    let maxMatch = 0;

    const entries = Array.from(this.agentCapabilities.entries());
    for (const [agentId, capability] of entries) {
      if (capability.availability !== 'available') continue;

      const matchCount = requiredSkills.filter(skill =>
        capability.skills.includes(skill)
      ).length;

      if (matchCount > maxMatch) {
        maxMatch = matchCount;
        bestAgent = agentId;
      }
    }

    return bestAgent;
  }

  /**
   * Decompose a complex task into subtasks
   */
  decomposeTask(task: OrchestrationTask): TaskAssignment[] {
    const assignments: TaskAssignment[] = [];
    
    // Simple decomposition based on required skills
    const skillGroups = this.groupSkills(task.requiredSkills);
    
    for (const skillGroup of skillGroups) {
      const agentId = this.findBestAgent(skillGroup);
      
      if (agentId) {
        assignments.push({
          taskId: task.id,
          agentId,
          subtasks: skillGroup,
          dependencies: [],
        });
      }
    }

    return assignments;
  }

  /**
   * Group related skills together
   */
  private groupSkills(skills: string[]): string[][] {
    // Simple grouping - can be enhanced with ML
    const groups: string[][] = [];
    const skillCategories: Record<string, string[]> = {
      research: ['research', 'analysis', 'data-collection'],
      development: ['coding', 'debugging', 'testing'],
      content: ['writing', 'design', 'image-generation'],
      automation: ['web-scraping', 'task-automation', 'workflow'],
    };

    for (const [category, categorySkills] of Object.entries(skillCategories)) {
      const matchingSkills = skills.filter(s => categorySkills.includes(s));
      if (matchingSkills.length > 0) {
        groups.push(matchingSkills);
      }
    }

    // Add any ungrouped skills
    const groupedSkills = groups.flat();
    const ungrouped = skills.filter(s => !groupedSkills.includes(s));
    if (ungrouped.length > 0) {
      groups.push(ungrouped);
    }

    return groups;
  }

  /**
   * Assign tasks to agents
   */
  async assignTasks(task: OrchestrationTask): Promise<TaskAssignment[]> {
    const assignments = this.decomposeTask(task);
    
    // Mark agents as busy
    for (const assignment of assignments) {
      const capability = this.agentCapabilities.get(assignment.agentId);
      if (capability) {
        capability.availability = 'busy';
      }
    }

    return assignments;
  }

  /**
   * Execute task with multiple agents
   */
  async executeOrchestration(taskId: number): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }
      
      const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
      
      if (!task.length) {
        throw new Error(`Task ${taskId} not found`);
      }

      const taskData = task[0];
      const requiredSkills = JSON.parse(taskData.input || '{}').skills || [];

      const orchestrationTask: OrchestrationTask = {
        id: taskId,
        description: taskData.input || '',
        requiredSkills,
        priority: taskData.priority,
        status: taskData.status,
      };

      const assignments = await this.assignTasks(orchestrationTask);

      console.log(`Task ${taskId} assigned to ${assignments.length} agents`);

      // Execute subtasks in parallel
      await Promise.all(
        assignments.map(async (assignment) => {
          try {
            await this.executeSubtask(assignment);
          } catch (error) {
            console.error(`Subtask execution failed:`, error);
          }
        })
      );

      // Update task status
      await db
        .update(tasks)
        .set({ status: 'completed', completedAt: new Date() })
        .where(eq(tasks.id, taskId));

      console.log(`Task ${taskId} completed successfully`);
    } catch (error) {
      console.error(`Orchestration failed for task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Execute a subtask assigned to an agent
   */
  private async executeSubtask(assignment: TaskAssignment): Promise<void> {
    const capability = this.agentCapabilities.get(assignment.agentId);
    
    if (!capability) {
      throw new Error(`Agent ${assignment.agentId} not found`);
    }

    console.log(`Agent ${assignment.agentId} executing subtasks:`, assignment.subtasks);

    // Simulate subtask execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mark agent as available
    capability.availability = 'available';
  }

  /**
   * Get orchestration status
   */
  getStatus(): Record<string, any> {
    const status: Record<string, any> = {
      totalAgents: this.agentCapabilities.size,
      available: 0,
      busy: 0,
      offline: 0,
      agents: [],
    };

    const entries = Array.from(this.agentCapabilities.entries());
    for (const [agentId, capability] of entries) {
      status[capability.availability]++;
      status.agents.push({
        id: agentId,
        type: capability.type,
        skills: capability.skills,
        status: capability.availability,
      });
    }

    return status;
  }
}

// Singleton instance
let orchestratorInstance: MultiAgentOrchestrator | null = null;

export async function getOrchestrator(): Promise<MultiAgentOrchestrator> {
  if (!orchestratorInstance) {
    orchestratorInstance = new MultiAgentOrchestrator();
    await orchestratorInstance.initialize();
  }
  return orchestratorInstance;
}
