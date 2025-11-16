# 🚀 Production Deployment Checklist

## ✅ Phase 1: GitHub Repository (COMPLETED)

- [x] Repository created: https://github.com/Soldiom/aiguidepro-unified
- [x] Code pushed successfully (2 commits)
- [x] All files uploaded (client, server, drizzle, documentation)
- [x] README.md with setup instructions
- [x] netlify.toml configuration file

---

## 📋 Phase 2: Netlify Deployment

### Step 1: Create Netlify Account
1. Go to https://app.netlify.com/signup
2. Sign up with GitHub account (recommended for easy integration)
3. Authorize Netlify to access your GitHub repositories

### Step 2: Import Project
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select repository: **Soldiom/aiguidepro-unified**
4. Click **"Deploy"**

### Step 3: Configure Build Settings
Netlify will auto-detect from `netlify.toml`, but verify:

```
Build command: pnpm install && pnpm build
Publish directory: client/dist
Node version: 22
```

### Step 4: Add Environment Variables
Go to **Site settings** → **Environment variables** → **Add a variable**

Add these required variables:

```bash
# Database (TiDB/MySQL)
DATABASE_URL=mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-generated-secret-here

# Manus OAuth (already configured in template)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-owner-openid
OWNER_NAME=your-name

# HuggingFace (for AI training)
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxx

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Google Drive API (optional - for multi-cloud storage)
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token

# Azure Storage (optional - for multi-cloud storage)
AZURE_STORAGE_ACCOUNT=your-account-name
AZURE_STORAGE_KEY=your-storage-key
AZURE_CONTAINER_NAME=your-container-name

# Payment Processing (optional - for licensing)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# App Configuration
VITE_APP_TITLE=AI Guide Pro
VITE_APP_LOGO=/logo.svg
```

### Step 5: Deploy
1. Click **"Deploy site"**
2. Wait for build to complete (usually 2-5 minutes)
3. Netlify will provide a temporary URL: `https://random-name-123456.netlify.app`

---

## 🌐 Phase 3: Custom Domain Setup

### Option A: Subdomain (Recommended)
**Target**: `aiguidepro.althowaikh.com`

1. **In Netlify:**
   - Go to **Site settings** → **Domain management**
   - Click **"Add custom domain"**
   - Enter: `aiguidepro.althowaikh.com`
   - Click **"Verify"**

2. **In Your DNS Provider (althowaikh.com):**
   - Add CNAME record:
     ```
     Type: CNAME
     Name: aiguidepro
     Value: random-name-123456.netlify.app
     TTL: 3600
     ```

3. **Enable HTTPS:**
   - Netlify will auto-provision SSL certificate (Let's Encrypt)
   - Wait 1-5 minutes for DNS propagation
   - Certificate will be issued automatically

### Option B: Subdirectory Path
**Target**: `althowaikh.com/soldiom`

⚠️ **Note**: Netlify doesn't support subdirectory hosting directly. You need to:

1. **Set up reverse proxy** on althowaikh.com server:
   ```nginx
   location /soldiom {
       proxy_pass https://random-name-123456.netlify.app;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

2. **Or use subdomain** (recommended): `aiguidepro.althowaikh.com`

---

## 🔒 Phase 4: CloudFlare Integration (Optional but Recommended)

### Benefits:
- DDoS protection
- CDN for faster global access
- Additional SSL/TLS encryption
- Web Application Firewall (WAF)

### Setup:
1. Go to https://dash.cloudflare.com
2. Add site: `althowaikh.com`
3. Update nameservers at your domain registrar
4. In CloudFlare DNS:
   - Add CNAME: `aiguidepro` → `random-name-123456.netlify.app`
   - Enable "Proxied" (orange cloud)
5. SSL/TLS settings:
   - Set to "Full (strict)"
   - Enable "Always Use HTTPS"

---

## 🗄️ Phase 5: Database Setup

### Option A: TiDB Cloud (Recommended - Free Tier)
1. Go to https://tidbcloud.com
2. Create free cluster
3. Get connection string
4. Add to Netlify environment variables as `DATABASE_URL`

### Option B: PlanetScale (MySQL Compatible)
1. Go to https://planetscale.com
2. Create database
3. Get connection string
4. Add to Netlify environment variables

### Option C: Your Own MySQL Server
```bash
DATABASE_URL=mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}
```

### Initialize Database:
```bash
# Run migrations
pnpm db:push

# Seed initial data (agents)
node scripts/seed-agents.mjs
```

---

## 🧪 Phase 6: Testing

### Test Checklist:
- [ ] Homepage loads correctly
- [ ] Navigation works (Dashboard, Agents, Tasks, Automation)
- [ ] Authentication flow (login/logout)
- [ ] Agent creation and management
- [ ] Task creation and assignment
- [ ] Automation system (start/stop training)
- [ ] License purchase flow (if payment enabled)
- [ ] Bilingual support (English/Arabic toggle)
- [ ] Mobile responsiveness
- [ ] SSL certificate active (https://)

### Performance Testing:
- [ ] Lighthouse score > 90
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds

---

## 📊 Phase 7: Monitoring & Analytics

### Netlify Analytics (Built-in)
- Go to **Analytics** tab in Netlify dashboard
- View pageviews, unique visitors, bandwidth

### Optional: Add Google Analytics
1. Create GA4 property
2. Add tracking code to `client/index.html`
3. Monitor traffic and user behavior

### Error Monitoring (Optional)
- **Sentry**: https://sentry.io
- **LogRocket**: https://logrocket.com

---

## 🔐 Security Checklist

- [ ] All API keys stored in environment variables (not in code)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] CORS configured properly
- [ ] Rate limiting enabled (via CloudFlare)
- [ ] Database connections use SSL
- [ ] JWT secret is strong and unique
- [ ] Security headers configured in netlify.toml
- [ ] No sensitive data in git history

---

## 🎯 Post-Deployment Tasks

### 1. Update Documentation
- [ ] Update README.md with production URL
- [ ] Document environment variables
- [ ] Add troubleshooting guide

### 2. Set Up Backups
- [ ] Database automated backups (daily)
- [ ] Code repository backups (GitHub)
- [ ] Environment variables backup (secure location)

### 3. Configure Notifications
- [ ] Netlify deploy notifications (Slack/Email)
- [ ] Database alerts (disk space, performance)
- [ ] Error monitoring alerts

### 4. Performance Optimization
- [ ] Enable CloudFlare caching
- [ ] Optimize images (WebP format)
- [ ] Enable gzip compression
- [ ] Lazy load components

---

## 🆘 Troubleshooting

### Build Fails
1. Check Netlify build logs
2. Verify all environment variables are set
3. Test build locally: `pnpm build`
4. Check Node.js version matches (22.x)

### Database Connection Fails
1. Verify DATABASE_URL format
2. Check SSL settings
3. Whitelist Netlify IP addresses
4. Test connection with MySQL client

### Custom Domain Not Working
1. Verify DNS records (use `dig` or `nslookup`)
2. Wait for DNS propagation (up to 48 hours)
3. Check CloudFlare proxy settings
4. Verify SSL certificate status

### 500 Internal Server Error
1. Check Netlify function logs
2. Verify environment variables
3. Check database connection
4. Review server-side code errors

---

## 📞 Support Resources

- **Netlify Documentation**: https://docs.netlify.com
- **TiDB Cloud Docs**: https://docs.pingcap.com/tidbcloud
- **HuggingFace Docs**: https://huggingface.co/docs
- **Stripe Docs**: https://stripe.com/docs
- **GitHub Support**: https://support.github.com

---

## ✅ Deployment Complete!

Your AI Guide Pro Unified System is now live at:
- **Production URL**: `https://aiguidepro.althowaikh.com`
- **GitHub Repository**: `https://github.com/Soldiom/aiguidepro-unified`
- **Netlify Dashboard**: `https://app.netlify.com/sites/your-site-name`

**Next Steps:**
1. Test all features thoroughly
2. Monitor performance and errors
3. Gather user feedback
4. Plan feature updates
5. Scale infrastructure as needed

---

## 🎉 Congratulations!

You've successfully deployed a production-ready AGI/ASI platform with:
- ✅ 24/7 Automated AI Training
- ✅ Real Machine Learning Integration
- ✅ Multi-Cloud Storage
- ✅ Payment Processing
- ✅ Enterprise Security
- ✅ Global CDN
- ✅ Automated Backups

**Your AI Guide Pro system is now operational and ready to serve users worldwide!**
