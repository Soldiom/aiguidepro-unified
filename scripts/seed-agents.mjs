import { drizzle } from "drizzle-orm/mysql2";
import { agents } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const seedAgents = [
  {
    name: "Research Assistant Alpha",
    type: "research",
    description: "Specialized in deep research, data analysis, and comprehensive report generation. Capable of multi-source research and insight extraction.",
    capabilities: JSON.stringify([
      "Multi-source research",
      "Data analysis",
      "Report generation",
      "Insight extraction",
      "Academic paper analysis",
      "Market research"
    ]),
    status: "active",
    config: JSON.stringify({
      maxConcurrentTasks: 3,
      defaultPriority: "medium",
      tools: ["browser-use", "huggingface-inference"]
    }),
    toolIntegrations: JSON.stringify([
      { name: "browser-use", enabled: true },
      { name: "huggingface-inference", enabled: true }
    ])
  },
  {
    name: "Code Master Dev",
    type: "development",
    description: "Expert software development agent capable of writing code, debugging, testing, and building full applications.",
    capabilities: JSON.stringify([
      "Code generation",
      "Bug fixing",
      "Unit testing",
      "Code review",
      "Documentation",
      "Full-stack development"
    ]),
    status: "active",
    config: JSON.stringify({
      maxConcurrentTasks: 2,
      defaultPriority: "high",
      tools: ["metagpt", "github-copilot"]
    }),
    toolIntegrations: JSON.stringify([
      { name: "metagpt", enabled: true },
      { name: "github", enabled: true }
    ])
  },
  {
    name: "Content Creator Pro",
    type: "content",
    description: "Creative content generation agent for writing, image creation, and presentation design.",
    capabilities: JSON.stringify([
      "Content writing",
      "Image generation",
      "Presentation creation",
      "Marketing copy",
      "Social media content",
      "SEO optimization"
    ]),
    status: "active",
    config: JSON.stringify({
      maxConcurrentTasks: 5,
      defaultPriority: "medium",
      tools: ["flowise", "stable-diffusion"]
    }),
    toolIntegrations: JSON.stringify([
      { name: "flowise", enabled: true },
      { name: "stable-diffusion", enabled: true }
    ])
  },
  {
    name: "Project Manager Bot",
    type: "project_management",
    description: "Intelligent project management agent for task planning, coordination, and progress tracking.",
    capabilities: JSON.stringify([
      "Task planning",
      "Resource allocation",
      "Progress tracking",
      "Team coordination",
      "Reporting",
      "Risk management"
    ]),
    status: "active",
    config: JSON.stringify({
      maxConcurrentTasks: 10,
      defaultPriority: "high",
      tools: ["metagpt", "github-projects"]
    }),
    toolIntegrations: JSON.stringify([
      { name: "metagpt", enabled: true },
      { name: "github", enabled: true }
    ])
  },
  {
    name: "Business Consultant AI",
    type: "business",
    description: "Strategic business consulting agent for market analysis, strategy development, and decision support.",
    capabilities: JSON.stringify([
      "Market analysis",
      "Strategy planning",
      "Financial analysis",
      "Decision support",
      "Competitive analysis",
      "Business forecasting"
    ]),
    status: "active",
    config: JSON.stringify({
      maxConcurrentTasks: 3,
      defaultPriority: "high",
      tools: ["browser-use", "data-analysis"]
    }),
    toolIntegrations: JSON.stringify([
      { name: "browser-use", enabled: true },
      { name: "data-analysis", enabled: true }
    ])
  },
  {
    name: "Personal Tutor Sage",
    type: "tutor",
    description: "Educational AI agent for personalized learning, concept explanation, and skill development.",
    capabilities: JSON.stringify([
      "Concept explanation",
      "Personalized learning paths",
      "Skill assessment",
      "Progress tracking",
      "Interactive teaching",
      "Knowledge evaluation"
    ]),
    status: "active",
    config: JSON.stringify({
      maxConcurrentTasks: 4,
      defaultPriority: "medium",
      tools: ["prompt-engineering-guide", "huggingface-inference"]
    }),
    toolIntegrations: JSON.stringify([
      { name: "prompt-engineering-guide", enabled: true },
      { name: "huggingface-inference", enabled: true }
    ])
  }
];

async function seed() {
  console.log("🌱 Seeding agents...");
  
  try {
    for (const agent of seedAgents) {
      await db.insert(agents).values(agent);
      console.log(`✅ Created agent: ${agent.name}`);
    }
    
    console.log("✨ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
