#!/bin/bash
# Deployment Verification Script
# Run this script before deploying to production

set -e

echo "🚀 AI Guide Pro - Deployment Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"
else
  echo -e "${RED}✗ Node.js 18+ required, found: $(node -v)${NC}"
  exit 1
fi

# Check pnpm
echo ""
echo "📦 Checking pnpm..."
if command -v pnpm &> /dev/null; then
  echo -e "${GREEN}✓ pnpm version: $(pnpm -v)${NC}"
else
  echo -e "${RED}✗ pnpm not found. Install with: npm install -g pnpm${NC}"
  exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile
echo -e "${GREEN}✓ Dependencies installed${NC}"

# TypeScript check
echo ""
echo "🔍 Running TypeScript check..."
pnpm check
echo -e "${GREEN}✓ TypeScript check passed${NC}"

# Build project
echo ""
echo "🏗️  Building project..."
pnpm build > /dev/null 2>&1
echo -e "${GREEN}✓ Build successful${NC}"

# Check required files
echo ""
echo "📄 Checking required files..."
REQUIRED_FILES=(
  "package.json"
  "netlify.toml"
  ".github/workflows/deploy.yml"
  ".github/workflows/test.yml"
  ".github/workflows/scheduled-tasks.yml"
  "netlify/functions/health.ts"
  "netlify/functions/trpc.ts"
  "server/browser-automation.ts"
  "server/multi-agent-orchestrator.ts"
  "server/collaboration-manager.ts"
  "server/analytics-service.ts"
  "server/agent-templates.ts"
  "server/marketplace-manager.ts"
  "server/performance-monitor.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (missing)"
    exit 1
  fi
done

# Check environment variables template
echo ""
echo "🔐 Checking environment configuration..."
if [ -f ".env.example" ]; then
  echo -e "${GREEN}✓ .env.example exists${NC}"
else
  echo -e "${RED}✗ .env.example missing${NC}"
  exit 1
fi

# Check documentation
echo ""
echo "📚 Checking documentation..."
DOCS=(
  "README.md"
  "DEPLOYMENT.md"
  "CICD_GUIDE.md"
  "ADVANCED_FEATURES.md"
  "PRODUCTION_DEPLOYMENT_CHECKLIST.md"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo -e "${GREEN}✓${NC} $doc"
  else
    echo -e "${YELLOW}⚠${NC} $doc (optional, but recommended)"
  fi
done

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "📋 Pre-deployment checklist:"
echo "   □ Set up environment variables in Netlify"
echo "   □ Configure GitHub secrets"
echo "   □ Set up database connection"
echo "   □ Configure custom domain (optional)"
echo "   □ Enable HTTPS"
echo "   □ Test deployment in staging"
echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "Next steps:"
echo "1. Push to main branch: git push origin main"
echo "2. GitHub Actions will automatically deploy to Netlify"
echo "3. Monitor deployment at: https://app.netlify.com"
echo ""
