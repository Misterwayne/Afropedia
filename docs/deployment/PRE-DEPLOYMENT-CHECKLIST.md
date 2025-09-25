# 🚀 Pre-Deployment Checklist

## Before You Start

### ✅ Prerequisites Check
- [ ] **GitHub account** created
- [ ] **Vercel account** created (https://vercel.com)
- [ ] **Railway account** created (https://railway.app)
- [ ] **Domain purchased** (optional for testing)
- [ ] **Cloudflare account** created (optional for custom domain)

### ✅ Local Development Working
- [ ] Backend runs successfully on `http://localhost:8000`
- [ ] Frontend runs successfully on `http://localhost:3000`
- [ ] Database connection to Supabase working
- [ ] Authentication system working
- [ ] Search functionality working
- [ ] File uploads working (images, videos, audio)

## 🧪 Testing Phase

### Run Pre-Deployment Tests
```bash
# Make scripts executable
chmod +x test-deployment.sh
chmod +x setup-env-template.sh

# Run environment setup (if not done)
./setup-env-template.sh

# Run deployment tests
./test-deployment.sh
```

### ✅ Test Results Should Show:
- [ ] ✅ All dependencies installed
- [ ] ✅ Backend health check passing
- [ ] ✅ Backend ping test passing
- [ ] ✅ Backend metrics endpoint working
- [ ] ✅ Frontend builds successfully
- [ ] ✅ Vercel configuration found
- [ ] ✅ Railway configuration found
- [ ] ✅ Docker configuration working

## 📁 Files Ready for Deployment

### ✅ Configuration Files Created:
- [ ] `timbuktu-frontend/vercel.json` - Vercel deployment config
- [ ] `wikipedia-clone-py-backend/railway.json` - Railway deployment config
- [ ] `wikipedia-clone-py-backend/.env` - Environment variables
- [ ] `set-railway-env.sh` - Railway environment setup script
- [ ] `Dockerfile` updated for Railway

### ✅ Code Repository:
- [ ] All code committed to Git
- [ ] Repository pushed to GitHub
- [ ] `.env` file added to `.gitignore`
- [ ] All sensitive data excluded from repository

## 🚀 Deployment Order

### Phase 1: Backend Deployment (Railway)
1. [ ] Login to Railway: `railway login`
2. [ ] Initialize project: `railway init`
3. [ ] Set environment variables: `./set-railway-env.sh`
4. [ ] Deploy: `railway up`
5. [ ] Test deployment: `curl https://your-app.railway.app/health`
6. [ ] Note your Railway URL

### Phase 2: Frontend Deployment (Vercel)
1. [ ] Update `vercel.json` with your Railway URL
2. [ ] Login to Vercel: `vercel login`
3. [ ] Deploy: `vercel --prod`
4. [ ] Set environment variable: `NEXT_PUBLIC_API_URL`
5. [ ] Test deployment: Visit your Vercel URL
6. [ ] Test API integration works

### Phase 3: Domain Setup (Optional)
1. [ ] Add domain to Cloudflare
2. [ ] Configure DNS records
3. [ ] Add custom domain to Vercel
4. [ ] Add custom domain to Railway
5. [ ] Test SSL certificates
6. [ ] Test global accessibility

## 🔍 Post-Deployment Testing

### ✅ Functionality Tests:
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Article creation works
- [ ] Article editing works
- [ ] Search functionality works
- [ ] Image uploads work
- [ ] Video uploads work
- [ ] Audio uploads work
- [ ] Book management works
- [ ] Moderation system works

### ✅ Performance Tests:
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] Images load quickly
- [ ] Search returns results quickly

### ✅ Global Accessibility:
- [ ] Test from Europe
- [ ] Test from Americas
- [ ] Test from Africa (use VPN or ask someone)
- [ ] Mobile responsiveness
- [ ] Different browsers (Chrome, Firefox, Safari)

## 🚨 Rollback Plan

### If Something Goes Wrong:
1. **Frontend Issues**: Revert Vercel deployment
   ```bash
   vercel rollback
   ```

2. **Backend Issues**: Check Railway logs
   ```bash
   railway logs
   ```

3. **Database Issues**: Check Supabase dashboard
   - Verify connection strings
   - Check database health

4. **Domain Issues**: 
   - Check DNS propagation (up to 24 hours)
   - Verify Cloudflare settings

## 📊 Monitoring Setup

### ✅ After Deployment:
- [ ] Set up uptime monitoring (UptimeRobot free tier)
- [ ] Monitor Railway logs regularly
- [ ] Check Vercel analytics
- [ ] Monitor Supabase usage
- [ ] Set up error alerts

## 💰 Cost Monitoring

### ✅ Keep Track Of:
- [ ] Railway usage and costs
- [ ] Vercel bandwidth usage
- [ ] Supabase database size and requests
- [ ] Domain renewal dates
- [ ] Cloudflare usage (if using paid features)

## 🎯 Success Criteria

### ✅ Deployment is Successful When:
- [ ] All functionality works in production
- [ ] Site loads globally within 3 seconds
- [ ] No critical errors in logs
- [ ] SSL certificates working
- [ ] Search functionality working
- [ ] User authentication working
- [ ] File uploads working
- [ ] Mobile responsive
- [ ] SEO basics working (meta tags, etc.)

---

## 📞 Emergency Contacts & Resources

- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/help
- **Supabase Support**: https://supabase.com/support
- **Cloudflare Support**: https://support.cloudflare.com

---

*Complete this checklist before and after deployment to ensure a smooth launch of Afropedia! 🚀*
