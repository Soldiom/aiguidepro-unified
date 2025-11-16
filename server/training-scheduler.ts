import { DataCollector } from "./data-collector";
import { mlTrainingService } from "./ml-training-service";

/**
 * Automated Training Scheduler
 * Runs continuous learning and model training 24/7
 */

interface TrainingJob {
  id: string;
  domain: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: Date;
  completedAt?: Date;
  dataPoints: number;
  modelPath?: string;
  error?: string;
}

export class TrainingScheduler {
  private collector: DataCollector;
  private jobs: Map<string, TrainingJob> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.collector = new DataCollector();
  }

  /**
   * Start automated 24/7 training
   */
  async start() {
    if (this.isRunning) {
      console.log("⚠️  Training scheduler already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Starting automated 24/7 training scheduler...");

    // Run initial data collection
    await this.runDataCollection();

    // Schedule periodic data collection (every 6 hours)
    setInterval(() => {
      this.runDataCollection();
    }, 6 * 60 * 60 * 1000);

    // Schedule periodic model training (every 12 hours)
    setInterval(() => {
      this.runModelTraining();
    }, 12 * 60 * 60 * 1000);

    console.log("✅ Training scheduler started successfully");
  }

  /**
   * Stop automated training
   */
  stop() {
    this.isRunning = false;
    console.log("🛑 Training scheduler stopped");
  }

  /**
   * Run data collection from GitHub and HuggingFace
   */
  private async runDataCollection() {
    console.log("📊 Running data collection...");

    try {
      const data = await this.collector.collectAll();

      console.log("✅ Data collection completed:");
      console.log(`  - GitHub repos: ${data.summary.github_repos}`);
      console.log(`  - HF models: ${data.summary.hf_models}`);
      console.log(`  - Specialized datasets: ${JSON.stringify(data.summary.specialized_datasets)}`);
      console.log(`  - Total data points: ${data.summary.total_data_points}`);

      // Store collected data for training
      // In production, this would be saved to a database or file system
      return data;
    } catch (error) {
      console.error("❌ Data collection failed:", error);
      return null;
    }
  }

  /**
   * Run model training for specialized domains
   */
  private async runModelTraining() {
    console.log("🧠 Running model training...");

    const domains = ["forensic", "medical", "legal", "financial", "research", "development"];

    for (const domain of domains) {
      const jobId = `${domain}-${Date.now()}`;
      const job: TrainingJob = {
        id: jobId,
        domain,
        status: "pending",
        dataPoints: 0,
      };

      this.jobs.set(jobId, job);

      try {
        job.status = "running";
        job.startedAt = new Date();

        console.log(`  🔄 Training ${domain} model...`);

        // Collect domain-specific data
        const data = await this.collector.collectSpecializedData(domain);
        job.dataPoints = data.length;

        // Simulate training (in production, this would use actual ML training)
        await this.trainModel(domain, data);

        job.status = "completed";
        job.completedAt = new Date();
        job.modelPath = `/models/${domain}-model-${Date.now()}.bin`;

        console.log(`  ✅ ${domain} model trained successfully`);
        console.log(`     - Data points: ${job.dataPoints}`);
        console.log(`     - Model path: ${job.modelPath}`);
      } catch (error) {
        job.status = "failed";
        job.error = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ ${domain} model training failed:`, error);
      }
    }

    console.log("✅ Model training cycle completed");
  }

  /**
   * Train a specialized model for a specific domain
   */
  private async trainModel(domain: string, data: any[]): Promise<void> {
    console.log(`    Training ${domain} model with ${data.length} data points...`);

    try {
      // Get base model for this domain
      const baseModel = mlTrainingService.getBaseModel(domain);

      // Configure training
      const config = {
        domain,
        baseModel,
        dataPoints: data.length,
        epochs: 3,
        learningRate: 2e-5,
        batchSize: 8,
      };

      // Fine-tune the model
      const result = await mlTrainingService.fineTuneModel(config);

      console.log(`    ✅ Model trained successfully:`);
      console.log(`       Model ID: ${result.modelId}`);
      console.log(`       Accuracy: ${(result.accuracy * 100).toFixed(2)}%`);
      console.log(`       Loss: ${result.loss.toFixed(4)}`);
      console.log(`       Training time: ${(result.trainingTime / 1000).toFixed(2)}s`);

      // Deploy model to HuggingFace Inference API
      const inferenceUrl = await mlTrainingService.deployModel(result.modelId);
      console.log(`       Inference URL: ${inferenceUrl}`);
    } catch (error) {
      console.error(`    ❌ Training failed for ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Get training status
   */
  getStatus() {
    const jobs = Array.from(this.jobs.values());
    const completed = jobs.filter((j) => j.status === "completed").length;
    const running = jobs.filter((j) => j.status === "running").length;
    const failed = jobs.filter((j) => j.status === "failed").length;

    return {
      isRunning: this.isRunning,
      totalJobs: jobs.length,
      completed,
      running,
      failed,
      jobs: jobs.slice(-10), // Last 10 jobs
    };
  }

  /**
   * Get available specialized models
   */
  getAvailableModels() {
    const completedJobs = Array.from(this.jobs.values()).filter((j) => j.status === "completed" && j.modelPath);

    return completedJobs.map((job) => ({
      domain: job.domain,
      modelPath: job.modelPath,
      trainedAt: job.completedAt,
      dataPoints: job.dataPoints,
    }));
  }
}

// Create singleton instance
export const trainingScheduler = new TrainingScheduler();
