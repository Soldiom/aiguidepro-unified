import { Octokit } from "@octokit/rest";

/**
 * Automated Data Collection Service
 * Collects training data from GitHub and HuggingFace
 */

interface CollectedRepo {
  id: string;
  name: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  readme: string;
  code_samples: string[];
}

interface CollectedModel {
  id: string;
  name: string;
  downloads: number;
  likes: number;
  tags: string[];
  description: string;
  pipeline_tag: string;
}

export class DataCollector {
  private octokit: Octokit;
  private hfToken: string;

  constructor() {
    // GitHub API (using existing GH_TOKEN from environment)
    this.octokit = new Octokit({
      auth: process.env.GH_TOKEN || process.env.GITHUB_TOKEN,
    });

    // HuggingFace API
    this.hfToken = process.env.HUGGINGFACE_TOKEN || "";
  }

  /**
   * Collect top AI/ML repositories from GitHub
   */
  async collectGitHubRepos(limit: number = 100): Promise<CollectedRepo[]> {
    const repos: CollectedRepo[] = [];

    try {
      // Search for top AI/ML repositories
      const queries = [
        "machine learning stars:>1000",
        "artificial intelligence stars:>1000",
        "deep learning stars:>1000",
        "neural network stars:>1000",
        "llm stars:>500",
        "gpt stars:>500",
        "transformer stars:>500",
      ];

      for (const query of queries) {
        const { data } = await this.octokit.search.repos({
          q: query,
          sort: "stars",
          order: "desc",
          per_page: Math.min(limit, 100),
        });

        for (const repo of data.items.slice(0, limit / queries.length)) {
          try {
            // Get README
            let readme = "";
            try {
              const { data: readmeData } = await this.octokit.repos.getReadme({
                owner: repo.owner?.login || '',
                repo: repo.name,
              });
              readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
            } catch (e) {
              console.warn(`No README for ${repo.full_name}`);
            }

            // Get code samples (Python files)
            const code_samples: string[] = [];
            try {
              const { data: contents } = await this.octokit.repos.getContent({
                owner: repo.owner?.login || '',
                repo: repo.name,
                path: "",
              });

              if (Array.isArray(contents)) {
                for (const file of contents.slice(0, 5)) {
                  if (file.name.endsWith(".py") && file.type === "file") {
                    try {
                      const { data: fileData } = await this.octokit.repos.getContent({
                        owner: repo.owner?.login || '',
                        repo: repo.name,
                        path: file.path,
                      });
                      if ("content" in fileData) {
                        const code = Buffer.from(fileData.content, "base64").toString("utf-8");
                        code_samples.push(code);
                      }
                    } catch (e) {
                      // Skip files that can't be read
                    }
                  }
                }
              }
            } catch (e) {
              console.warn(`Cannot read contents of ${repo.full_name}`);
            }

            repos.push({
              id: repo.id.toString(),
              name: repo.full_name,
              description: repo.description || "",
              stars: repo.stargazers_count,
              language: repo.language || "Unknown",
              topics: repo.topics || [],
              readme,
              code_samples,
            });
          } catch (error) {
            console.error(`Error collecting ${repo.full_name}:`, error);
          }
        }
      }

      console.log(`✅ Collected ${repos.length} repositories from GitHub`);
      return repos;
    } catch (error) {
      console.error("Error collecting GitHub repos:", error);
      return [];
    }
  }

  /**
   * Collect top models from HuggingFace
   */
  async collectHuggingFaceModels(limit: number = 100): Promise<CollectedModel[]> {
    const models: CollectedModel[] = [];

    try {
      const headers = {
        Authorization: `Bearer ${this.hfToken}`,
      };

      // Get top models by downloads
      const response = await fetch(
        `https://huggingface.co/api/models?sort=downloads&direction=-1&limit=${limit}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`HF API error: ${response.statusText}`);
      }

      const data = await response.json();

      for (const model of data) {
        models.push({
          id: model.id || model.modelId,
          name: model.id || model.modelId,
          downloads: model.downloads || 0,
          likes: model.likes || 0,
          tags: model.tags || [],
          description: model.description || "",
          pipeline_tag: model.pipeline_tag || "unknown",
        });
      }

      console.log(`✅ Collected ${models.length} models from HuggingFace`);
      return models;
    } catch (error) {
      console.error("Error collecting HuggingFace models:", error);
      return [];
    }
  }

  /**
   * Collect specialized datasets for specific domains
   */
  async collectSpecializedData(domain: string): Promise<any[]> {
    const datasets: any[] = [];

    try {
      const headers = {
        Authorization: `Bearer ${this.hfToken}`,
      };

      // Search for domain-specific datasets
      const response = await fetch(
        `https://huggingface.co/api/datasets?search=${encodeURIComponent(domain)}&sort=downloads&direction=-1&limit=50`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`HF API error: ${response.statusText}`);
      }

      const data = await response.json();

      for (const dataset of data) {
        datasets.push({
          id: dataset.id,
          name: dataset.id,
          downloads: dataset.downloads || 0,
          likes: dataset.likes || 0,
          tags: dataset.tags || [],
          description: dataset.description || "",
        });
      }

      console.log(`✅ Collected ${datasets.length} datasets for domain: ${domain}`);
      return datasets;
    } catch (error) {
      console.error(`Error collecting datasets for ${domain}:`, error);
      return [];
    }
  }

  /**
   * Run full data collection pipeline
   */
  async collectAll() {
    console.log("🚀 Starting automated data collection...");

    const [repos, models, forensicData, medicalData, legalData, financialData] = await Promise.all([
      this.collectGitHubRepos(100),
      this.collectHuggingFaceModels(100),
      this.collectSpecializedData("forensic"),
      this.collectSpecializedData("medical"),
      this.collectSpecializedData("legal"),
      this.collectSpecializedData("financial"),
    ]);

    const summary = {
      github_repos: repos.length,
      hf_models: models.length,
      specialized_datasets: {
        forensic: forensicData.length,
        medical: medicalData.length,
        legal: legalData.length,
        financial: financialData.length,
      },
      total_data_points: repos.length + models.length + forensicData.length + medicalData.length + legalData.length + financialData.length,
    };

    console.log("✅ Data collection complete:", summary);

    return {
      repos,
      models,
      specialized: {
        forensic: forensicData,
        medical: medicalData,
        legal: legalData,
        financial: financialData,
      },
      summary,
    };
  }
}
