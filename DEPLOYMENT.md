# AI Guide Pro Unified System - Deployment Guide

## 🚀 Quick Deploy to Netlify

### Prerequisites
- GitHub account with repository access
- Netlify account (free tier works)
- Hugging Face account (optional, for AI features)

---

## Step 1: Prepare Repository

### 1.1 Push to GitHub
```bash
cd /home/ubuntu/aiguidepro-unified
git init
git add .
git commit -m "Initial commit: AI Guide Pro Unified System"
git branch -M main
git remote add origin https://github.com/Soldiom/aiguidepro-unified.git
git push -u origin main
```

### 1.2 Verify Repository Structure
Ensure these files exist:
- `netlify.toml` (build configuration)
- `package.json` (dependencies)
- `drizzle.config.ts` (database config)
- `client/` (frontend code)
- `server/` (backend code)

---

## Step 2: Create Netlify Site

### 2.1 Connect GitHub Repository
1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" as the provider
4. Select `Soldiom/aiguidepro-unified` repository
5. Authorize Netlify to access the repository

### 2.2 Configure Build Settings
Netlify should auto-detect settings from `netlify.toml`, but verify:

```toml
[build]
  command = "pnpm install && pnpm build"
  publish = "client/dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "22"
  PNPM_VERSION = "9"
```

### 2.3 Set Environment Variables
In Netlify Dashboard → Site settings → Environment variables, add:

**Required:**
```bash
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key-here
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_TITLE=AI Guide Pro Unified System
```

**Optional (for HuggingFace integration):**
```bash
HF_API_KEY=hf_xxxxxxxxxxxxx
HF_SPACE_AGENTICSEEK=username/agenticseek
HF_SPACE_FLOWISE=username/flowise
HF_SPACE_BROWSER_USE=username/browser-use
HF_SPACE_METAGPT=username/metagpt
```

### 2.4 Deploy
Click "Deploy site" and wait for the build to complete (~3-5 minutes).

---

## Step 3: Configure Custom Domain (althowaikh.com)

### 3.1 Add Domain in Netlify
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter `althowaikh.com`
4. Click "Verify"

### 3.2 Update DNS Records
In your domain registrar (e.g., Namecheap, GoDaddy), add:

**For apex domain (althowaikh.com):**
```
Type: A
Name: @
Value: 75.2.60.5 (Netlify's load balancer)
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

### 3.3 Enable HTTPS
1. Wait for DNS propagation (~5-30 minutes)
2. Netlify will automatically provision SSL certificate
3. Enable "Force HTTPS" in domain settings

---

## Step 4: Database Setup

### 4.1 Create Database
Use one of these options:

**Option A: PlanetScale (Recommended)**
1. Create account at [PlanetScale](https://planetscale.com)
2. Create new database
3. Get connection string
4. Add to Netlify env vars as `DATABASE_URL`

**Option B: Railway**
1. Create account at [Railway](https://railway.app)
2. Create MySQL database
3. Get connection string
4. Add to Netlify env vars

**Option C: Existing MySQL**
Use your existing MySQL/TiDB connection string

### 4.2 Run Migrations
After deployment, run migrations via Netlify CLI:

```bash
netlify link
netlify env:import .env
pnpm db:push
```

Or manually via database client:
```bash
mysql -h host -u user -p database < drizzle/migrations/*.sql
```

### 4.3 Seed Initial Data (Optional)
```bash
node scripts/seed-agents.mjs
```

---

## Step 5: Hugging Face Spaces Deployment

### 5.1 Create HF Spaces
For each agent type, create a Space:

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Choose "Gradio" SDK
4. Name it (e.g., `agenticseek`, `flowise`, etc.)
5. Set to Public or Private

### 5.2 Deploy Agent Code
Upload agent code to each Space:

```bash
# Example for AgenticSeek
cd /home/ubuntu/agenticSeek
git init
git remote add space https://huggingface.co/spaces/username/agenticseek
git add .
git commit -m "Deploy AgenticSeek"
git push space main
```

Repeat for:
- Flowise
- Browser-Use
- MetaGPT

### 5.3 Configure Space Settings
In each Space settings:
1. Set Python version to 3.10+
2. Add secrets (API keys, etc.)
3. Set hardware (CPU free tier is fine to start)
4. Enable persistent storage if needed

---

## Step 6: GitHub Actions Setup

### 6.1 Create Workflow Files
Already created in `.github/workflows/`:
- `deploy.yml` - Auto-deploy on push
- `scheduled-tasks.yml` - Scheduled agent tasks

### 6.2 Add GitHub Secrets
In GitHub repo → Settings → Secrets and variables → Actions:

```bash
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-site-id
HF_API_KEY=your-hf-token
DATABASE_URL=your-db-url
```

### 6.3 Enable Workflows
Workflows will auto-run on:
- Push to `main` branch (deploy)
- Every 6 hours (scheduled tasks)
- Manual trigger (workflow_dispatch)

---

## Step 7: Verify Deployment

### 7.1 Test Website
1. Visit `https://althowaikh.com`
2. Verify homepage loads
3. Test navigation (Dashboard, Agents, Tasks)
4. Try creating an agent
5. Try creating a task

### 7.2 Test API Endpoints
```bash
# Health check
curl https://althowaikh.com/api/health

# List agents
curl https://althowaikh.com/api/trpc/agents.list

# Check database connection
curl https://althowaikh.com/api/trpc/system.health
```

### 7.3 Monitor Logs
- Netlify Dashboard → Deploys → View logs
- Functions → Function logs
- Real-time logs via Netlify CLI: `netlify dev`

---

## Step 8: Post-Deployment Configuration

### 8.1 Set Up Monitoring
- Enable Netlify Analytics (optional, paid)
- Set up error tracking (Sentry, LogRocket)
- Configure uptime monitoring (UptimeRobot, Pingdom)

### 8.2 Performance Optimization
- Enable Netlify's Asset Optimization
- Configure caching headers
- Enable Brotli compression
- Set up CDN edge locations

### 8.3 Security Hardening
- Enable HSTS headers
- Configure CSP (Content Security Policy)
- Set up rate limiting for API endpoints
- Enable DDoS protection

---

## Troubleshooting

### Build Fails
```bash
# Check build logs in Netlify
# Common issues:
- Missing environment variables
- Node version mismatch
- Dependency conflicts

# Fix:
netlify build --debug
```

### Database Connection Issues
```bash
# Test connection
mysql -h host -u user -p database

# Verify DATABASE_URL format:
mysql://user:password@host:port/database

# Check firewall/IP whitelist
```

### Function Timeout
```bash
# Netlify Functions timeout after 10s (free) / 26s (pro)
# For long-running tasks, use:
- Background Functions (Pro plan)
- GitHub Actions
- External queue (BullMQ, etc.)
```

### HF Space Sleeping
```bash
# Free Spaces sleep after 48h inactivity
# Solutions:
- Upgrade to paid tier
- Use GitHub Actions to ping every 24h
- Implement wake-up endpoint
```

---

## Maintenance

### Regular Updates
```bash
# Update dependencies
pnpm update

# Update database schema
pnpm db:push

# Deploy updates
git push origin main
```

### Backup Database
```bash
# Export database
mysqldump -h host -u user -p database > backup.sql

# Restore
mysql -h host -u user -p database < backup.sql
```

### Monitor Costs
- Netlify: Free tier → 100GB bandwidth/month
- HuggingFace: Free tier → CPU Spaces
- Database: Varies by provider
- Estimated: $0-50/month for small-medium usage

---

## Support

- **Documentation:** [Netlify Docs](https://docs.netlify.com)
- **Community:** [Netlify Community](https://answers.netlify.com)
- **HuggingFace:** [HF Docs](https://huggingface.co/docs)
- **GitHub:** [Issues](https://github.com/Soldiom/aiguidepro-unified/issues)

---

**Deployment Checklist:**
- [ ] Repository pushed to GitHub
- [ ] Netlify site created and deployed
- [ ] Environment variables configured
- [ ] Custom domain configured (althowaikh.com)
- [ ] SSL certificate enabled
- [ ] Database created and migrated
- [ ] HuggingFace Spaces deployed
- [ ] GitHub Actions configured
- [ ] Deployment verified and tested
- [ ] Monitoring and analytics set up

**Congratulations! Your AI Guide Pro Unified System is live! 🎉**
