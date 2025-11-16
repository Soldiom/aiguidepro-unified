#!/usr/bin/env node

/**
 * Deploy agents to Hugging Face Spaces
 * This script automates the deployment of AI agents to HF Spaces
 */

import { HfApi } from '@huggingface/hub';
import fs from 'fs';
import path from 'path';

const HF_TOKEN = process.env.HF_API_KEY;
const HF_USERNAME = process.env.HF_USERNAME || 'aiguidepro';

if (!HF_TOKEN) {
  console.error('Error: HF_API_KEY environment variable is required');
  process.exit(1);
}

const hf = new HfApi({ accessToken: HF_TOKEN });

// Agent configurations for HF Spaces
const agentSpaces = [
  {
    name: 'agenticseek',
    title: 'AgenticSeek - AI Research Agent',
    description: 'Autonomous research agent powered by local Manus alternative',
    sdk: 'gradio',
    hardware: 'cpu-basic',
  },
  {
    name: 'flowise',
    title: 'Flowise - LLM Orchestration',
    description: 'Visual workflow builder for LLM applications',
    sdk: 'docker',
    hardware: 'cpu-basic',
  },
  {
    name: 'browser-use',
    title: 'Browser-Use - Web Automation',
    description: 'Intelligent browser automation agent',
    sdk: 'gradio',
    hardware: 'cpu-basic',
  },
  {
    name: 'metagpt',
    title: 'MetaGPT - Multi-Agent Framework',
    description: 'Multi-agent collaboration framework',
    sdk: 'gradio',
    hardware: 'cpu-basic',
  },
];

async function createSpace(config: typeof agentSpaces[0]) {
  try {
    console.log(`\n📦 Creating Space: ${config.name}`);
    
    const spaceId = `${HF_USERNAME}/${config.name}`;
    
    // Create the Space
    await hf.createRepo({
      repo: spaceId,
      repoType: 'space',
      space_sdk: config.sdk,
      space_hardware: config.hardware,
    });
    
    console.log(`✅ Space created: https://huggingface.co/spaces/${spaceId}`);
    
    // Create basic README
    const readme = `---
title: ${config.title}
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: ${config.sdk}
sdk_version: "4.0"
app_file: app.py
pinned: false
---

# ${config.title}

${config.description}

## Features
- Autonomous task execution
- Intelligent decision making
- API integration
- Real-time progress tracking

## Usage
This Space is part of the AI Guide Pro Unified System.
Visit [althowaikh.com](https://althowaikh.com) for more information.

## API
Access this agent via the AI Guide Pro API:
\`\`\`bash
curl -X POST https://api.aiguidepro.com/agents/${config.name}/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"task": "your task here"}'
\`\`\`
`;

    // Upload README
    await hf.uploadFile({
      repo: spaceId,
      repoType: 'space',
      path: 'README.md',
      file: Buffer.from(readme),
    });
    
    console.log(`✅ README uploaded`);
    
    // Create basic app.py for Gradio spaces
    if (config.sdk === 'gradio') {
      const appPy = `import gradio as gr
import os

def process_task(task):
    """Process agent task"""
    return f"Agent ${config.name} processing: {task}"

# Create Gradio interface
demo = gr.Interface(
    fn=process_task,
    inputs=gr.Textbox(label="Task", placeholder="Enter your task here..."),
    outputs=gr.Textbox(label="Result"),
    title="${config.title}",
    description="${config.description}"
)

if __name__ == "__main__":
    demo.launch()
`;
      
      await hf.uploadFile({
        repo: spaceId,
        repoType: 'space',
        path: 'app.py',
        file: Buffer.from(appPy),
      });
      
      console.log(`✅ app.py uploaded`);
      
      // Create requirements.txt
      const requirements = `gradio>=4.0.0
huggingface-hub>=0.19.0
python-dotenv>=1.0.0
`;
      
      await hf.uploadFile({
        repo: spaceId,
        repoType: 'space',
        path: 'requirements.txt',
        file: Buffer.from(requirements),
      });
      
      console.log(`✅ requirements.txt uploaded`);
    }
    
    return spaceId;
  } catch (error) {
    if (error.message?.includes('already exists')) {
      console.log(`⚠️  Space already exists: ${config.name}`);
      return `${HF_USERNAME}/${config.name}`;
    }
    throw error;
  }
}

async function deployAllSpaces() {
  console.log('🚀 Starting Hugging Face Spaces deployment...\n');
  
  const deployedSpaces = [];
  
  for (const config of agentSpaces) {
    try {
      const spaceId = await createSpace(config);
      deployedSpaces.push(spaceId);
    } catch (error) {
      console.error(`❌ Error deploying ${config.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Deployment Summary:');
  console.log('====================');
  deployedSpaces.forEach(space => {
    console.log(`✅ ${space} - https://huggingface.co/spaces/${space}`);
  });
  
  console.log('\n📝 Next steps:');
  console.log('1. Configure secrets in each Space settings');
  console.log('2. Update Space code with actual agent logic');
  console.log('3. Test each Space endpoint');
  console.log('4. Update AI Guide Pro backend with Space URLs');
}

// Run deployment
deployAllSpaces().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
