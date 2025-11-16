# CI/CD and Deployment Guide

## Overview

This guide explains the CI/CD pipeline and deployment process for the AI Guide Pro Unified System.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   GitHub    │─────▶│ GitHub       │─────▶│   Netlify   │
│ Repository  │      │ Actions      │      │  Hosting    │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Hugging Face │
                     │   Spaces     │
                     └──────────────┘
```

## GitHub Actions Workflows

### 1. Deploy Workflow (`.github/workflows/deploy.yml`)

**Trigger:** Push to `main` branch or manual trigger

**Steps:**
1. Checkout code
2. Setup Node.js 22
3. Install pnpm
4. Install dependencies
5. Run TypeScript checks
6. Build project
7. Deploy to Netlify

**Required Secrets:**
- `DATABASE_URL`
- `JWT_SECRET`
- `OAUTH_SERVER_URL`
- `VITE_APP_TITLE`
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

### 2. Test Workflow (`.github/workflows/test.yml`)

**Trigger:** Pull request or push to `main`

**Steps:**
1. Checkout code
2. Setup Node.js 22
3. Install dependencies
4. Run TypeScript checks
5. Run tests
6. Build project

**Required Secrets:**
- `DATABASE_URL`
- `JWT_SECRET`

### 3. Scheduled Tasks Workflow (`.github/workflows/scheduled-tasks.yml`)

**Trigger:** Every 6 hours or manual trigger

**Jobs:**

#### Data Collection
- Collects AI research data from GitHub
- Collects model data from Hugging Face
- Stores in database

#### Model Training
- Runs scheduled model training
- Uploads models to cloud storage
- Updates model registry

**Required Secrets:**
- `GH_TOKEN`
- `HF_API_KEY`
- `DATABASE_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`

## Netlify Configuration

### Build Settings

Defined in `netlify.toml`:

```toml
[build]
  command = "pnpm install && pnpm build"
  publish = "client/dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "22"
  PNPM_VERSION = "9"
```

### Functions

Serverless functions in `netlify/functions/`:

1. **`health.ts`** - Health check endpoint
   - URL: `/.netlify/functions/health`
   - Returns system status

2. **`trpc.ts`** - Main API handler
   - URL: `/.netlify/functions/trpc`
   - Handles all tRPC API calls

### Redirects

All API calls are redirected to Netlify Functions:

```
/api/* → /.netlify/functions/:splat
/* → /index.html (SPA routing)
```

### Security Headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## Hugging Face Spaces Deployment

### Setup

1. **Create HF Account**
   - Sign up at https://huggingface.co
   - Get API token from settings

2. **Configure Credentials**
   ```bash
   export HF_API_KEY=hf_xxxxxxxxxxxxx
   export HF_USERNAME=your-username
   ```

3. **Deploy Spaces**
   ```bash
   pnpm deploy:hf
   ```

### Agent Spaces

Four spaces are created:

1. **AgenticSeek** - Research agent
   - URL: `https://huggingface.co/spaces/{username}/agenticseek`
   - SDK: Gradio
   - Hardware: CPU-basic

2. **Flowise** - LLM orchestration
   - URL: `https://huggingface.co/spaces/{username}/flowise`
   - SDK: Docker
   - Hardware: CPU-basic

3. **Browser-Use** - Web automation
   - URL: `https://huggingface.co/spaces/{username}/browser-use`
   - SDK: Gradio
   - Hardware: CPU-basic

4. **MetaGPT** - Multi-agent framework
   - URL: `https://huggingface.co/spaces/{username}/metagpt`
   - SDK: Gradio
   - Hardware: CPU-basic

### Space Configuration

Each Space includes:
- `README.md` - Documentation
- `app.py` - Application code
- `requirements.txt` - Python dependencies

## Local Development

### Prerequisites

- Node.js 22+
- pnpm 9+
- MySQL database

### Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/Soldiom/aiguidepro-unified.git
   cd aiguidepro-unified
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Setup database**
   ```bash
   pnpm db:push
   pnpm seed:agents
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000`

## Production Deployment

### First-Time Setup

1. **Fork Repository**
   - Fork https://github.com/Soldiom/aiguidepro-unified

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Select your forked repository
   - Configure build settings (auto-detected from `netlify.toml`)

3. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add all required variables (see `.env.example`)

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

5. **Configure Custom Domain** (Optional)
   - Go to Site settings → Domain management
   - Add custom domain
   - Update DNS records

### Continuous Deployment

Once configured, deployments are automatic:

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **GitHub Actions runs**
   - Runs tests
   - Builds project
   - Deploys to Netlify

3. **Netlify builds**
   - Pulls latest code
   - Installs dependencies
   - Builds project
   - Deploys to CDN

## Monitoring

### Build Status

Check build status:
- GitHub Actions: Repository → Actions tab
- Netlify: Dashboard → Deploys

### Logs

View logs:
- **Build logs:** Netlify Dashboard → Deploys → View logs
- **Function logs:** Netlify Dashboard → Functions
- **GitHub Actions logs:** Repository → Actions → Workflow run

### Alerts

Set up alerts for:
- Build failures
- Test failures
- Deployment failures
- Function errors

## Troubleshooting

### Build Fails

**Check:**
1. Build logs in GitHub Actions or Netlify
2. TypeScript errors: `pnpm check`
3. Missing environment variables
4. Dependency conflicts

**Fix:**
```bash
# Test build locally
pnpm install
pnpm check
pnpm build
```

### Deployment Fails

**Check:**
1. Netlify build logs
2. Environment variables configuration
3. Database connectivity
4. API keys validity

**Fix:**
1. Verify all environment variables are set
2. Test database connection
3. Regenerate API keys if needed
4. Check Netlify Functions logs

### Tests Fail

**Check:**
1. Test logs in GitHub Actions
2. Database configuration
3. Environment variables for tests

**Fix:**
```bash
# Run tests locally
pnpm test

# Run with verbose output
pnpm test -- --reporter=verbose
```

### Functions Error

**Check:**
1. Function logs in Netlify
2. Request/response format
3. tRPC configuration
4. Database connectivity

**Fix:**
1. Test function locally
2. Check error messages
3. Verify environment variables
4. Test database queries

## Best Practices

### Code Quality

- Run `pnpm check` before committing
- Run `pnpm test` before pushing
- Use `pnpm format` to format code
- Follow TypeScript strict mode

### Security

- Never commit secrets to repository
- Rotate API keys regularly
- Use environment-specific configurations
- Enable 2FA on all accounts
- Review security headers

### Performance

- Minimize bundle size
- Optimize images
- Use caching effectively
- Monitor function execution time
- Review database queries

### Monitoring

- Check build status daily
- Review error logs weekly
- Monitor function usage
- Track deployment frequency
- Measure build times

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Hugging Face Documentation](https://huggingface.co/docs)
- [Project README](README.md)
- [Deployment Checklist](PRODUCTION_DEPLOYMENT_CHECKLIST.md)
