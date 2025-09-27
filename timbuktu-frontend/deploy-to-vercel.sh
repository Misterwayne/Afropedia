#!/bin/bash

# Afropedia Frontend - Vercel Deployment Script
# This script deploys the frontend to Vercel with production configuration

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Deploying Afropedia Frontend to Vercel...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please log in to Vercel...${NC}"
    vercel login
fi

# Build the project first
echo -e "${YELLOW}📦 Building project...${NC}"
npm run build

# Deploy to Vercel
echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
vercel --prod --config vercel-free.json

# Set environment variables
echo -e "${YELLOW}⚙️  Setting environment variables...${NC}"
vercel env add NEXT_PUBLIC_API_URL production https://afropediabackend-production.up.railway.app

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your frontend is now live on Vercel!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Test your deployed frontend"
echo -e "   2. Configure custom domain (optional)"
echo -e "   3. Set up monitoring and analytics"
echo -e "   4. Share your Afropedia with the world! 🎉"
