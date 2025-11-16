/**
 * Performance Monitoring System
 * Tracks system performance, resource usage, and optimization metrics
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: string;
}

export interface ResourceUsage {
  cpu: number; // percentage
  memory: number; // bytes
  storage: number; // bytes
  network: number; // bytes/sec
}

export interface PerformanceReport {
  timestamp: Date;
  duration: number;
  metrics: PerformanceMetric[];
  resources: ResourceUsage;
  alerts: PerformanceAlert[];
}

export interface PerformanceAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  threshold: number;
  actualValue: number;
  timestamp: Date;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;
  private alerts: PerformanceAlert[] = [];
  private thresholds: Map<string, { value: number; severity: string }> = new Map();

  constructor() {
    // Set default thresholds
    this.thresholds.set('cpu_usage', { value: 80, severity: 'high' });
    this.thresholds.set('memory_usage', { value: 85, severity: 'high' });
    this.thresholds.set('response_time', { value: 5000, severity: 'medium' });
    this.thresholds.set('error_rate', { value: 5, severity: 'critical' });
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, unit: string, category: string): void {
    const metric: PerformanceMetric = {
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      unit,
      timestamp: new Date(),
      category,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check thresholds
    this.checkThresholds(metric);
  }

  /**
   * Check if metric exceeds threshold
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    
    if (!threshold) return;

    if (metric.value > threshold.value) {
      const alert: PerformanceAlert = {
        id: `alert-${Date.now()}`,
        severity: threshold.severity as any,
        message: `${metric.name} exceeded threshold: ${metric.value}${metric.unit} > ${threshold.value}${metric.unit}`,
        metric: metric.name,
        threshold: threshold.value,
        actualValue: metric.value,
        timestamp: new Date(),
      };

      this.alerts.push(alert);
      console.warn(`Performance alert: ${alert.message}`);
    }
  }

  /**
   * Track API response time
   */
  trackResponseTime(endpoint: string, duration: number): void {
    this.recordMetric('response_time', duration, 'ms', 'api');
    this.recordMetric(`${endpoint}_response_time`, duration, 'ms', 'api');
  }

  /**
   * Track database query time
   */
  trackQueryTime(query: string, duration: number): void {
    this.recordMetric('query_time', duration, 'ms', 'database');
  }

  /**
   * Track agent execution time
   */
  trackAgentExecution(agentId: number, duration: number): void {
    this.recordMetric('agent_execution_time', duration, 'ms', 'agent');
    this.recordMetric(`agent_${agentId}_execution_time`, duration, 'ms', 'agent');
  }

  /**
   * Get current resource usage
   */
  async getResourceUsage(): Promise<ResourceUsage> {
    // In production, this would use actual system metrics
    // For now, return simulated data
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 8 * 1024 * 1024 * 1024, // 0-8GB
      storage: Math.random() * 100 * 1024 * 1024 * 1024, // 0-100GB
      network: Math.random() * 100 * 1024 * 1024, // 0-100MB/s
    };
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: string, limit = 100): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.category === category)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string, limit = 100): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.name === name)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get average metric value
   */
  getAverageMetric(name: string, timeWindow?: number): number {
    let metrics = this.metrics.filter(m => m.name === name);

    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      metrics = metrics.filter(m => m.timestamp.getTime() > cutoff);
    }

    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Get performance report
   */
  async getPerformanceReport(duration: number = 3600000): Promise<PerformanceReport> {
    const cutoff = Date.now() - duration;
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);
    const recentAlerts = this.alerts.filter(a => a.timestamp.getTime() > cutoff);
    const resources = await this.getResourceUsage();

    return {
      timestamp: new Date(),
      duration,
      metrics: recentMetrics,
      resources,
      alerts: recentAlerts,
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(severity?: string): PerformanceAlert[] {
    const recent = this.alerts.filter(a => 
      a.timestamp.getTime() > Date.now() - 3600000 // Last hour
    );

    if (severity) {
      return recent.filter(a => a.severity === severity);
    }

    return recent;
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(beforeDate: Date): number {
    const originalLength = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp >= beforeDate);
    return originalLength - this.metrics.length;
  }

  /**
   * Set custom threshold
   */
  setThreshold(name: string, value: number, severity: string): void {
    this.thresholds.set(name, { value, severity });
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const avgResponseTime = this.getAverageMetric('response_time');
    const avgCpu = this.getAverageMetric('cpu_usage');

    if (avgResponseTime > 1000) {
      suggestions.push('Consider implementing caching to reduce response times');
    }

    if (avgCpu > 70) {
      suggestions.push('High CPU usage detected - consider scaling horizontally');
    }

    const errorRate = this.getAverageMetric('error_rate');
    if (errorRate > 1) {
      suggestions.push('Error rate is elevated - review recent code changes');
    }

    if (suggestions.length === 0) {
      suggestions.push('System performance is optimal');
    }

    return suggestions;
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}
