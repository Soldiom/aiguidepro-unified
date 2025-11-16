/**
 * Agent Template System
 * Provides pre-configured agent templates for common use cases
 */

export interface AgentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  defaultConfig: Record<string, any>;
  category: string;
  tags: string[];
  author?: string;
  version: string;
}

export const agentTemplates: AgentTemplate[] = [
  {
    id: 'research-scientist',
    name: 'Research Scientist',
    type: 'research',
    description: 'Deep research and data analysis agent specialized in scientific literature',
    capabilities: ['research', 'data-analysis', 'literature-review', 'report-generation'],
    defaultConfig: {
      maxDepth: 5,
      sources: ['arxiv', 'pubmed', 'google-scholar'],
      outputFormat: 'academic-paper',
    },
    category: 'Research',
    tags: ['science', 'academic', 'research'],
    version: '1.0.0',
  },
  {
    id: 'fullstack-developer',
    name: 'Full-Stack Developer',
    type: 'development',
    description: 'Complete application development from frontend to backend',
    capabilities: ['frontend-dev', 'backend-dev', 'database-design', 'api-development', 'testing'],
    defaultConfig: {
      frameworks: ['react', 'nodejs', 'express'],
      languages: ['typescript', 'javascript'],
      testing: true,
    },
    category: 'Development',
    tags: ['coding', 'web-dev', 'fullstack'],
    version: '1.0.0',
  },
  {
    id: 'content-marketer',
    name: 'Content Marketing Specialist',
    type: 'content',
    description: 'Creates engaging content for marketing campaigns',
    capabilities: ['copywriting', 'seo-optimization', 'social-media', 'image-generation'],
    defaultConfig: {
      tone: 'professional',
      platforms: ['blog', 'social-media', 'email'],
      seoOptimized: true,
    },
    category: 'Marketing',
    tags: ['content', 'marketing', 'writing'],
    version: '1.0.0',
  },
  {
    id: 'project-coordinator',
    name: 'Project Coordinator',
    type: 'project_management',
    description: 'Manages project timelines, tasks, and team coordination',
    capabilities: ['task-management', 'scheduling', 'team-coordination', 'reporting'],
    defaultConfig: {
      methodology: 'agile',
      reportingFrequency: 'daily',
      trackingTools: ['jira', 'trello'],
    },
    category: 'Management',
    tags: ['project-management', 'coordination', 'agile'],
    version: '1.0.0',
  },
  {
    id: 'business-analyst',
    name: 'Business Strategy Analyst',
    type: 'business',
    description: 'Analyzes market trends and provides strategic recommendations',
    capabilities: ['market-analysis', 'competitor-research', 'swot-analysis', 'forecasting'],
    defaultConfig: {
      industries: ['tech', 'finance', 'healthcare'],
      analysisDepth: 'comprehensive',
      reportFormat: 'executive-summary',
    },
    category: 'Business',
    tags: ['strategy', 'analysis', 'consulting'],
    version: '1.0.0',
  },
  {
    id: 'coding-tutor',
    name: 'Coding Tutor',
    type: 'tutor',
    description: 'Teaches programming concepts with personalized learning paths',
    capabilities: ['teaching', 'code-review', 'curriculum-design', 'assessment'],
    defaultConfig: {
      languages: ['python', 'javascript', 'java'],
      skillLevel: 'beginner',
      interactiveExamples: true,
    },
    category: 'Education',
    tags: ['teaching', 'coding', 'education'],
    version: '1.0.0',
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    type: 'research',
    description: 'Advanced data analysis, ML modeling, and statistical analysis',
    capabilities: ['data-analysis', 'machine-learning', 'statistics', 'visualization'],
    defaultConfig: {
      tools: ['python', 'pandas', 'scikit-learn', 'tensorflow'],
      visualizations: true,
      modelTypes: ['classification', 'regression', 'clustering'],
    },
    category: 'Data Science',
    tags: ['data', 'ml', 'analytics'],
    version: '1.0.0',
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    type: 'content',
    description: 'Creates user-centered designs and interactive prototypes',
    capabilities: ['ui-design', 'ux-research', 'prototyping', 'user-testing'],
    defaultConfig: {
      tools: ['figma', 'sketch', 'adobe-xd'],
      designSystem: true,
      responsiveDesign: true,
    },
    category: 'Design',
    tags: ['design', 'ui', 'ux'],
    version: '1.0.0',
  },
];

export class AgentTemplateManager {
  private templates: Map<string, AgentTemplate> = new Map();
  private customTemplates: Map<string, AgentTemplate> = new Map();

  constructor() {
    // Load default templates
    agentTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): AgentTemplate[] {
    return [
      ...Array.from(this.templates.values()),
      ...Array.from(this.customTemplates.values()),
    ];
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): AgentTemplate | undefined {
    return this.templates.get(id) || this.customTemplates.get(id);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): AgentTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * Get templates by tag
   */
  getTemplatesByTag(tag: string): AgentTemplate[] {
    return this.getAllTemplates().filter(t => t.tags.includes(tag));
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): AgentTemplate[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTemplates().filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Create custom template
   */
  createCustomTemplate(template: Omit<AgentTemplate, 'id' | 'version'>): AgentTemplate {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const customTemplate: AgentTemplate = {
      ...template,
      id,
      version: '1.0.0',
      author: 'user',
    };

    this.customTemplates.set(id, customTemplate);
    return customTemplate;
  }

  /**
   * Update custom template
   */
  updateCustomTemplate(id: string, updates: Partial<AgentTemplate>): boolean {
    const template = this.customTemplates.get(id);
    
    if (!template) return false;

    const updated = { ...template, ...updates };
    this.customTemplates.set(id, updated);
    return true;
  }

  /**
   * Delete custom template
   */
  deleteCustomTemplate(id: string): boolean {
    return this.customTemplates.delete(id);
  }

  /**
   * Get template categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.getAllTemplates().forEach(t => categories.add(t.category));
    return Array.from(categories).sort();
  }

  /**
   * Get all tags
   */
  getAllTags(): string[] {
    const tags = new Set<string>();
    this.getAllTemplates().forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }

  /**
   * Instantiate agent from template
   */
  instantiateFromTemplate(templateId: string, customConfig?: Record<string, any>): any {
    const template = this.getTemplate(templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    return {
      name: template.name,
      type: template.type,
      description: template.description,
      capabilities: JSON.stringify(template.capabilities),
      config: JSON.stringify({ ...template.defaultConfig, ...customConfig }),
      status: 'inactive',
    };
  }
}

// Singleton instance
let templateManager: AgentTemplateManager | null = null;

export function getTemplateManager(): AgentTemplateManager {
  if (!templateManager) {
    templateManager = new AgentTemplateManager();
  }
  return templateManager;
}
