# 🤖 AI Guide Pro Unified System

> **A serverless AI agent platform powered by GitHub, Hugging Face, and Netlify**

Deploy intelligent AI agents that work 24/7 to automate research, development, content creation, project management, business consulting, and personalized tutoring - all without managing servers.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Soldiom/aiguidepro-unified)
[![GitHub](https://img.shields.io/badge/GitHub-Soldiom%2Faiguidepro--unified-blue)](https://github.com/Soldiom/aiguidepro-unified)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ✨ Features

### 🧠 **Six Specialized AI Agents**
- **Research & Analysis Agent** - Deep research, data analysis, comprehensive reports
- **Software Development Agent** - Code writing, debugging, full application development
- **Content Creation Agent** - Writing, image generation, presentation design
- **Project Management Agent** - Task planning, coordination, progress tracking
- **Business Consulting Agent** - Market analysis, strategy, decision support
- **Personal Tutor Agent** - Concept explanation, personalized learning paths

### ⚡ **Serverless Architecture**
- **GitHub** - Code repository and version control
- **Hugging Face** - AI model hosting and inference
- **Netlify** - Deployment, hosting, and serverless functions
- **No servers to manage** - Fully cloud-native

### 🎯 **Key Capabilities**
- ✅ Autonomous task execution
- ✅ Intelligent planning and decision-making
- ✅ Multi-tool integration (Browser automation, GitHub, HF Inference)
- ✅ Real-time progress tracking
- ✅ Workflow orchestration
- ✅ Self-learning and improvement

### 🚀 **Advanced Features**
- ✅ **Real-time Collaboration** - Multiple users working together
- ✅ **Analytics Dashboard** - Track performance and usage metrics
- ✅ **Agent Templates** - 8 pre-built professional templates
- ✅ **Agent Marketplace** - Share and discover custom agents
- ✅ **Performance Monitoring** - Track system health and optimization
- ✅ **Browser Automation** - Web scraping and interaction
- ✅ **Multi-Agent Orchestration** - Coordinated agent collaboration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm 9+
- GitHub account
- Netlify account (free tier works)
- MySQL database (PlanetScale, Railway, or self-hosted)

### 1. Clone Repository
```bash
git clone https://github.com/Soldiom/aiguidepro-unified.git
cd aiguidepro-unified
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Setup Database
```bash
pnpm db:push
```

### 5. Run Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000` 🎉

---

## 📁 Project Structure

```
aiguidepro-unified/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client
│   │   └── App.tsx        # Routes
│   └── dist/              # Build output
├── server/                # Backend (Express + tRPC)
│   ├── routers.ts         # API routes
│   ├── db.ts              # Database queries
│   └── _core/             # Core utilities
├── drizzle/               # Database schema & migrations
│   └── schema.ts          # Table definitions
├── scripts/               # Utility scripts
│   └── seed-agents.mjs    # Seed initial agents
├── netlify/               # Netlify Functions
├── .github/workflows/     # GitHub Actions
├── netlify.toml           # Netlify configuration
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Vite** - Build tool
- **tRPC** - Type-safe API client

### Backend
- **Express 4** - Web framework
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - Database toolkit
- **MySQL** - Database
- **JWT** - Authentication

### Infrastructure
- **Netlify** - Hosting & deployment
- **GitHub** - Version control & CI/CD
- **Hugging Face** - AI model hosting
- **PlanetScale** - Serverless MySQL (optional)

### AI Tools Integration
- **AgenticSeek** - Local Manus alternative
- **Flowise** - LLM orchestration
- **Browser-Use** - Web automation
- **MetaGPT** - Multi-agent framework
- **Prompt Engineering Guide** - Best practices

---

## 📊 Database Schema

### Core Tables
- **users** - User accounts and authentication
- **agents** - AI agent configurations
- **tasks** - Task queue and execution
- **workflows** - Multi-step automation
- **agent_logs** - Activity logging
- **integrations** - External tool connections

---

## 🎨 UI Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Agent Management
![Agents](docs/screenshots/agents.png)

### Task Dashboard
![Tasks](docs/screenshots/tasks.png)

### Admin Dashboard
![Dashboard](docs/screenshots/dashboard.png)

---

## 🚀 Deployment

### Deploy to Netlify (Recommended)

1. **Fork this repository**
2. **Connect to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your forked repository
3. **Configure environment variables** (see DEPLOYMENT.md)
4. **Deploy!**

Detailed deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

### Deploy to Vercel

```bash
vercel --prod
```

### Deploy to Railway

```bash
railway up
```

---

## 🔧 Configuration

### Environment Variables

**Required:**
```bash
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_TITLE=AI Guide Pro Unified System
```

**Optional:**
```bash
HF_API_KEY=hf_xxxxxxxxxxxxx
HF_SPACE_AGENTICSEEK=username/agenticseek
HF_SPACE_FLOWISE=username/flowise
HF_SPACE_BROWSER_USE=username/browser-use
HF_SPACE_METAGPT=username/metagpt
```

---

## 📖 API Documentation

### tRPC Endpoints

#### Agents
- `agents.list` - Get all agents
- `agents.get(id)` - Get agent by ID
- `agents.create(data)` - Create new agent
- `agents.update(id, data)` - Update agent
- `agents.delete(id)` - Delete agent

#### Tasks
- `tasks.list` - Get all tasks
- `tasks.get(id)` - Get task by ID
- `tasks.create(data)` - Create new task
- `tasks.update(id, data)` - Update task
- `tasks.delete(id)` - Delete task

#### Workflows
- `workflows.list` - Get all workflows
- `workflows.get(id)` - Get workflow by ID
- `workflows.create(data)` - Create new workflow
- `workflows.update(id, data)` - Update workflow

Full API docs: [API.md](docs/API.md)

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Manus Platform** - Inspiration for agentic AI
- **Hugging Face** - AI model hosting
- **Netlify** - Serverless deployment
- **shadcn/ui** - Beautiful components
- **Drizzle ORM** - Type-safe database toolkit

---

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/Soldiom/aiguidepro-unified/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Soldiom/aiguidepro-unified/discussions)
- **Website:** [althowaikh.com](https://althowaikh.com)

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Database schema design
- [x] API development (tRPC)
- [x] Frontend UI (React + Tailwind)
- [x] Agent management system

### Phase 2: Integration ✅
- [x] Hugging Face Spaces deployment
- [x] GitHub Actions workflows
- [x] Browser automation integration
- [x] Multi-agent orchestration

### Phase 3: Advanced Features ✅
- [x] Real-time collaboration (infrastructure ready)
- [x] Advanced analytics (tracking system ready)
- [x] Custom agent templates (8 pre-built templates)
- [x] Marketplace for agents (full marketplace system)

### Phase 4: Scale & Optimize ✅
- [x] Performance optimization (monitoring system ready)
- [x] Cost optimization (tracking infrastructure)
- [x] Enterprise features (documented)
- [ ] Mobile app

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/Soldiom/aiguidepro-unified?style=social)
![GitHub forks](https://img.shields.io/github/forks/Soldiom/aiguidepro-unified?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/Soldiom/aiguidepro-unified?style=social)

---

**Built with ❤️ by the AI Guide Pro team**

[Website](https://althowaikh.com) • [GitHub](https://github.com/Soldiom) • [Documentation](docs/)
