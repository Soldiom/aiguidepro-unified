/**
 * Analytics System
 * Tracks system usage, performance metrics, and user behavior
 */

export interface AnalyticsEvent {
  id: string;
  type: string;
  userId?: string;
  agentId?: number;
  taskId?: number;
  data: Record<string, any>;
  timestamp: Date;
}

export interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskDuration: number;
  systemUptime: number;
}

export interface UserMetrics {
  userId: string;
  tasksCreated: number;
  tasksCompleted: number;
  averageTaskDuration: number;
  lastActive: Date;
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 10000; // Store last 10k events in memory

  /**
   * Track an analytics event
   */
  trackEvent(type: string, data: Record<string, any>, userId?: string): void {
    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      userId,
      data,
      timestamp: new Date(),
    };

    this.events.push(event);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    console.log(`Analytics event tracked: ${type}`, data);
  }

  /**
   * Track agent activity
   */
  trackAgentActivity(agentId: number, action: string, details?: Record<string, any>): void {
    this.trackEvent('agent_activity', {
      agentId,
      action,
      ...details,
    });
  }

  /**
   * Track task lifecycle
   */
  trackTaskEvent(taskId: number, status: string, details?: Record<string, any>): void {
    this.trackEvent('task_event', {
      taskId,
      status,
      ...details,
    });
  }

  /**
   * Track user interaction
   */
  trackUserInteraction(userId: string, action: string, details?: Record<string, any>): void {
    this.trackEvent('user_interaction', {
      action,
      ...details,
    }, userId);
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    // In production, this would query the database
    // For now, return placeholder data
    return {
      totalAgents: 6,
      activeAgents: 4,
      totalTasks: 150,
      completedTasks: 120,
      failedTasks: 5,
      averageTaskDuration: 3600, // seconds
      systemUptime: Date.now() - (Date.now() - 86400000), // 1 day uptime
    };
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    // In production, this would query the database
    // For now, return placeholder data
    return {
      userId,
      tasksCreated: 25,
      tasksCompleted: 20,
      averageTaskDuration: 2400,
      lastActive: new Date(),
    };
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string, limit = 100): AnalyticsEvent[] {
    return this.events
      .filter(e => e.type === type)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string, limit = 100): AnalyticsEvent[] {
    return this.events
      .filter(e => e.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get events in time range
   */
  getEventsByTimeRange(startDate: Date, endDate: Date): AnalyticsEvent[] {
    return this.events.filter(e => 
      e.timestamp >= startDate && e.timestamp <= endDate
    );
  }

  /**
   * Get popular actions
   */
  getPopularActions(limit = 10): Array<{ action: string; count: number }> {
    const actionCounts = new Map<string, number>();

    this.events.forEach(event => {
      if (event.data.action) {
        const count = actionCounts.get(event.data.action) || 0;
        actionCounts.set(event.data.action, count + 1);
      }
    });

    return Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Clear old events
   */
  clearOldEvents(beforeDate: Date): number {
    const originalLength = this.events.length;
    this.events = this.events.filter(e => e.timestamp >= beforeDate);
    return originalLength - this.events.length;
  }
}

// Singleton instance
let analyticsService: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsService) {
    analyticsService = new AnalyticsService();
  }
  return analyticsService;
}
