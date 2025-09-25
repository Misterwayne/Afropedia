# 🚀 Afropedia Deployment Guide

## Overview
This guide will help you deploy Afropedia globally using the hybrid approach:
- **Frontend (Next.js)** → Vercel
- **Backend (FastAPI)** → Railway  
- **Database** → Supabase (already configured)
- **CDN** → Cloudflare

## 💰 Cost Breakdown

| Service | Free Tier | Paid Tier | Monthly Cost |
|---------|-----------|-----------|--------------|
| Vercel | 100GB bandwidth | Pro: Unlimited | $20/month |
| Railway | $5 credit | Usage-based | $5-20/month |
| Supabase | 500MB DB | Pro: 8GB DB | $25/month |
| Cloudflare | CDN + SSL | Pro features | Free |
| Domain | - | .com domain | $1/month |

**Total: $25-30/month starting, $50-65/month production**

---

## 📋 Prerequisites

### Accounts Needed:
- [ ] GitHub account (for code repository)
- [ ] Vercel account (https://vercel.com)
- [ ] Railway account (https://railway.app)
- [ ] Cloudflare account (https://cloudflare.com)
- [ ] Domain registrar (Namecheap, GoDaddy, etc.)

### Tools to Install:
```bash
# Vercel CLI
npm install -g vercel

# Railway CLI
npm install -g @railway/cli

# Git (if not installed)
# Check with: git --version
```

---

## 🔧 Step 1: Prepare Your Code

### 1.1 Create Git Repository
```bash
cd "/home/b0ne/Documents/Web Project/Afropedia"
git init
git add .
git commit -m "Initial commit - Afropedia ready for deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/afropedia.git
git branch -M main
git push -u origin main
```

### 1.2 Frontend Configuration Files

Create `timbuktu-frontend/vercel.json`:
```json
{
  "name": "afropedia-frontend",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://afropedia-backend.railway.app"
  },
  "regions": ["all"],
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

Update `timbuktu-frontend/src/lib/api.ts`:
```typescript
// Make sure this line exists and uses environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### 1.3 Backend Configuration Files

Create `wikipedia-clone-py-backend/railway.json`:
```json
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Update `wikipedia-clone-py-backend/Dockerfile` (if needed):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start application
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 🌐 Step 2: Deploy Backend (Railway)

### 2.1 Login to Railway
```bash
cd wikipedia-clone-py-backend
railway login
```

### 2.2 Initialize Railway Project
```bash
railway init
# Choose "Empty Project"
# Name it "afropedia-backend"
```

### 2.3 Set Environment Variables
```bash
# Set all your environment variables
railway variables set SUPABASE_URL="your_supabase_url_here"
railway variables set SUPABASE_KEY="your_supabase_key_here"
railway variables set JWT_SECRET="your_jwt_secret_here"
railway variables set ENVIRONMENT="production"
railway variables set LOG_LEVEL="INFO"
railway variables set LOG_FILE="logs/afropedia.log"
railway variables set LOG_FORMAT="json"
railway variables set SSL_ENABLED="false"
railway variables set HTTPS_REDIRECT_ENABLED="false"
railway variables set SECURITY_HEADERS_ENABLED="true"
railway variables set MEILISEARCH_URL="http://localhost:7700"
railway variables set MEILISEARCH_MASTER_KEY="masterKey"
```

### 2.4 Deploy Backend
```bash
railway up
```

### 2.5 Get Your Backend URL
```bash
railway status
# Note down your deployment URL (e.g., https://afropedia-backend.railway.app)
```

### 2.6 Test Backend Deployment
```bash
# Test health endpoint
curl https://your-railway-url.railway.app/health

# Should return: {"status": "degraded", "timestamp": "...", "version": "1.0.0"}
```

---

## 🎨 Step 3: Deploy Frontend (Vercel)

### 3.1 Update API URL in Vercel Config
Edit `timbuktu-frontend/vercel.json` and replace the API URL with your Railway URL:
```json
"env": {
  "NEXT_PUBLIC_API_URL": "https://your-actual-railway-url.railway.app"
}
```

### 3.2 Login to Vercel
```bash
cd ../timbuktu-frontend
vercel login
```

### 3.3 Deploy Frontend
```bash
vercel --prod
```

### 3.4 Set Environment Variables in Vercel
```bash
# Set environment variable for production
vercel env add NEXT_PUBLIC_API_URL production
# Enter your Railway backend URL when prompted
```

### 3.5 Test Frontend Deployment
Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Search functionality works
- [ ] Articles display correctly
- [ ] Authentication works

---

## 🌍 Step 4: Setup Domain & CDN (Cloudflare)

### 4.1 Purchase Domain
1. Go to Namecheap, GoDaddy, or Cloudflare
2. Purchase your desired domain (e.g., `afropedia.com`)
3. Note down your domain name

### 4.2 Setup Cloudflare
1. Create Cloudflare account
2. Add your domain to Cloudflare
3. Update nameservers at your domain registrar
4. Wait for DNS propagation (up to 24 hours)

### 4.3 Configure DNS Records
In Cloudflare DNS settings, add:

```
Type    Name    Content                           Proxy Status
CNAME   @       your-vercel-app.vercel.app        Proxied
CNAME   www     your-vercel-app.vercel.app        Proxied
CNAME   api     your-railway-app.railway.app      Proxied
```

### 4.4 Configure Vercel Custom Domain
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Follow verification steps

### 4.5 Configure Railway Custom Domain
1. Go to Railway dashboard
2. Select your project
3. Go to Settings → Domains
4. Add `api.yourdomain.com`

---

## 🔒 Step 5: Security & SSL Setup

### 5.1 Cloudflare Security Settings
1. SSL/TLS → Overview → Set to "Full (strict)"
2. SSL/TLS → Edge Certificates → Enable "Always Use HTTPS"
3. Security → Settings → Enable "Browser Integrity Check"
4. Speed → Optimization → Enable "Auto Minify"

### 5.2 Update API URLs in Frontend
Update your frontend environment variables:
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.yourdomain.com
```

Redeploy frontend:
```bash
vercel --prod
```

---

## 📊 Step 6: Testing & Monitoring

### 6.1 Global Testing
Test from different locations:
- [ ] Europe: https://www.whatsmydns.net/
- [ ] Americas: Test loading speeds
- [ ] Africa: Use VPN or ask friends to test

### 6.2 Performance Testing
```bash
# Test API endpoints
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/ping
curl https://api.yourdomain.com/metrics

# Test frontend
curl -I https://yourdomain.com
```

### 6.3 Setup Monitoring
1. **Railway Monitoring**: Built-in metrics and logs
2. **Vercel Analytics**: Enable in dashboard
3. **Cloudflare Analytics**: Free tier includes basic analytics
4. **Uptime Monitoring**: Use UptimeRobot (free) or Pingdom

---

## 🚨 Troubleshooting

### Common Issues:

**1. CORS Errors**
```python
# In your FastAPI main.py, ensure CORS is configured:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com", "https://www.yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**2. Environment Variables Not Loading**
- Check Railway dashboard → Variables
- Check Vercel dashboard → Settings → Environment Variables
- Redeploy after changes

**3. Database Connection Issues**
- Verify Supabase URL and key
- Check Railway logs: `railway logs`

**4. SSL Certificate Issues**
- Wait 24 hours for DNS propagation
- Check Cloudflare SSL settings
- Verify domain ownership

---

## 📈 Scaling & Optimization

### When You Grow:
1. **Railway**: Upgrade to higher resource plans
2. **Vercel**: Upgrade to Pro for better performance
3. **Supabase**: Scale database tier
4. **Cloudflare**: Add Pro features for better caching

### Performance Optimizations:
- Enable Cloudflare caching rules
- Use Vercel Image Optimization
- Implement Redis for caching (Railway Redis)
- Add database read replicas (Supabase)

---

## 🎯 Final Checklist

### Pre-Launch:
- [ ] All environment variables set correctly
- [ ] SSL certificates working
- [ ] Custom domains configured
- [ ] CORS configured properly
- [ ] Health checks passing
- [ ] Global accessibility tested

### Post-Launch:
- [ ] Monitoring alerts setup
- [ ] Backup strategy implemented
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Documentation updated

---

## 📞 Support Resources

- **Vercel**: https://vercel.com/docs
- **Railway**: https://docs.railway.app
- **Cloudflare**: https://developers.cloudflare.com
- **Supabase**: https://supabase.com/docs

---

## 🔄 Maintenance

### Weekly:
- Check error logs
- Monitor performance metrics
- Review security alerts

### Monthly:
- Update dependencies
- Review costs and usage
- Backup database
- Test disaster recovery

---

*This guide will get your Afropedia project deployed globally with professional infrastructure. Follow each step carefully and test thoroughly before going live!*
