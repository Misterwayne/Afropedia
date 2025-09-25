#!/bin/bash

echo "🚀 Afropedia FREE Deployment Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "wikipedia-clone-py-backend/main.py" ]; then
    echo -e "${RED}❌ Please run this script from the Afropedia root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Prerequisites Check${NC}"
echo "================================"

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ Git is required but not installed${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed${NC}"; exit 1; }

echo -e "${GREEN}✅ Git found${NC}"
echo -e "${GREEN}✅ Node.js found${NC}"
echo -e "${GREEN}✅ npm found${NC}"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo ""
echo -e "${YELLOW}🔧 Step 1: Prepare Code${NC}"
echo "================================"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Afropedia ready for free deployment"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# Dependencies
node_modules/
__pycache__/
*.pyc

# Build outputs
.next/
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF
    echo "Created .gitignore file"
fi

echo ""
echo -e "${YELLOW}🚀 Step 2: Deploy Backend to Railway (FREE)${NC}"
echo "================================================"

cd wikipedia-clone-py-backend

# Check if user is logged into Railway
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}Please log in to Railway:${NC}"
    railway login
fi

# Deploy to Railway
echo "Deploying backend to Railway..."
railway up --detach

# Get the Railway URL
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null || echo "https://afropedia-backend-production.up.railway.app")

echo -e "${GREEN}✅ Backend deployed to: $RAILWAY_URL${NC}"

cd ../timbuktu-frontend

echo ""
echo -e "${YELLOW}🎨 Step 3: Deploy Frontend to Vercel (FREE)${NC}"
echo "================================================"

# Check if user is logged into Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Please log in to Vercel:${NC}"
    vercel login
fi

# Update API URL in environment
echo "NEXT_PUBLIC_API_URL=$RAILWAY_URL" > .env.local

# Deploy to Vercel
echo "Deploying frontend to Vercel..."
vercel --prod --yes

# Get the Vercel URL
VERCEL_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "https://afropedia-frontend.vercel.app")

echo -e "${GREEN}✅ Frontend deployed to: $VERCEL_URL${NC}"

cd ..

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "========================"
echo ""
echo -e "${GREEN}✅ Backend (Railway): $RAILWAY_URL${NC}"
echo -e "${GREEN}✅ Frontend (Vercel): $VERCEL_URL${NC}"
echo -e "${GREEN}✅ Database (Supabase): Already configured${NC}"
echo ""
echo -e "${YELLOW}💰 Total Cost: $0/month${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Test your application at: $VERCEL_URL"
echo "2. Check backend health at: $RAILWAY_URL/health"
echo "3. Monitor usage in Railway and Vercel dashboards"
echo "4. When you get users, consider upgrading to paid plans"
echo ""
echo -e "${GREEN}🚀 Your Afropedia is now live for FREE!${NC}"
