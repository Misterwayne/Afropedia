# 🧪 Afropedia Testing Suite

## Overview
Comprehensive testing suite to ensure all features of your Afropedia application work correctly before deployment.

## 📁 Testing Files

### 🤖 Automated Test Scripts
- **`run-all-tests.sh`** - Master script that runs all tests
- **`test-features.sh`** - Backend API and feature testing
- **`test-frontend-automated.sh`** - Frontend automated testing
- **`test-deployment.sh`** - Deployment readiness testing

### 📖 Manual Testing Guides
- **`test-frontend-features.md`** - Comprehensive frontend manual testing guide
- **`PRE-DEPLOYMENT-CHECKLIST.md`** - Complete deployment checklist

## 🚀 Quick Start

### 1. Make Scripts Executable
```bash
chmod +x *.sh
```

### 2. Start Your Services
```bash
# Terminal 1: Backend
cd wikipedia-clone-py-backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend  
cd timbuktu-frontend
npm run dev
```

### 3. Run All Tests
```bash
./run-all-tests.sh
```

## 🎯 Test Categories

### 🔧 Backend API Tests (`test-features.sh`)
- ✅ Authentication system (login, register, protected routes)
- ✅ Article management (create, read, update, list)
- ✅ Search functionality (basic, enhanced, books)
- ✅ Book management (create, list, retrieve)
- ✅ Media upload endpoints (images, videos, audio)
- ✅ Moderation system (dashboard, queue, actions)
- ✅ Peer review system (dashboard, assignments)
- ✅ Database connectivity and health checks

### 🎨 Frontend Tests (`test-frontend-automated.sh`)
- ✅ Page accessibility (homepage, auth, library)
- ✅ Static assets (favicon, logos, images)
- ✅ Build process and configuration
- ✅ API integration setup
- ✅ Package.json configuration

### 🚀 Deployment Tests (`test-deployment.sh`)
- ✅ Dependencies and tools installation
- ✅ Configuration files (Dockerfile, vercel.json, etc.)
- ✅ Environment variables setup
- ✅ Build processes (frontend and backend)
- ✅ Docker containerization

### 📱 Manual Frontend Testing (`test-frontend-features.md`)
- 🏠 Homepage functionality and design
- 🔐 Authentication flows (register, login, logout)
- 📝 Article management (create, edit, view)
- 🔍 Search functionality and results
- 📚 Library and book management
- 🎵 Media uploads (images, videos, audio)
- 🛡️ Moderation and peer review systems
- 📱 Responsive design and mobile compatibility
- ⚡ Performance and loading times
- 🔒 Security and access control

## 📊 Test Results

### Automated Tests Output
```bash
🧪 Afropedia Complete Testing Suite
===================================

✅ Frontend Automated Tests: PASSED
✅ Backend Feature Tests: PASSED  
✅ Deployment Readiness Tests: PASSED

🎉 ALL TESTS PASSED! 🎉
Your Afropedia application is ready for deployment!
```

### Manual Testing Checklist
Use the checklist in `test-frontend-features.md` to track manual testing progress:
- [ ] Homepage functionality
- [ ] Authentication system
- [ ] Article management
- [ ] Search features
- [ ] Media uploads
- [ ] Responsive design
- [ ] Performance testing

## 🔧 Individual Test Commands

### Run Specific Test Suites
```bash
# All tests (interactive mode)
./run-all-tests.sh

# All tests (command line)
./run-all-tests.sh --all

# Individual test suites
./run-all-tests.sh --frontend
./run-all-tests.sh --backend
./run-all-tests.sh --deployment

# Check service status
./run-all-tests.sh --status
```

### Direct Script Execution
```bash
# Backend API tests
./test-features.sh

# Frontend automated tests
./test-frontend-automated.sh

# Deployment readiness
./test-deployment.sh
```

## 🚨 Troubleshooting

### Common Issues

**Backend Not Running**
```bash
# Error: Backend is not running on localhost:8000
# Solution:
cd wikipedia-clone-py-backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Not Running**
```bash
# Error: Frontend is not running on localhost:3000
# Solution:
cd timbuktu-frontend
npm install
npm run dev
```

**Build Failures**
```bash
# Error: Frontend build failed
# Solution:
cd timbuktu-frontend
npm install
npm run build
# Check for TypeScript errors
```

**Database Connection Issues**
```bash
# Error: Database connection failed
# Solutions:
# 1. Check Supabase URL and key in .env
# 2. Verify internet connection
# 3. Check Supabase project status
```

**Authentication Tests Failing**
```bash
# Error: User registration/login failed
# Solutions:
# 1. Check if user already exists (try different email)
# 2. Verify password requirements
# 3. Check backend logs for detailed errors
```

### Debugging Steps

1. **Check Service Status**
   ```bash
   ./run-all-tests.sh --status
   ```

2. **Run Individual Tests**
   ```bash
   ./test-features.sh          # Backend only
   ./test-frontend-automated.sh # Frontend only
   ```

3. **Check Logs**
   ```bash
   # Backend logs
   tail -f wikipedia-clone-py-backend/logs/afropedia.log
   
   # Frontend console (in browser developer tools)
   ```

4. **Manual Verification**
   - Use browser to test manually
   - Check API endpoints in browser/Postman
   - Verify database contents in Supabase dashboard

## 📈 Test Coverage

### Backend Coverage
- ✅ Authentication & Authorization
- ✅ CRUD Operations (Articles, Books, Media)
- ✅ Search & Discovery
- ✅ File Upload & Storage
- ✅ Moderation & Review Systems
- ✅ Database Health & Connectivity
- ✅ API Response Validation

### Frontend Coverage
- ✅ Page Loading & Accessibility
- ✅ User Interface Components
- ✅ Form Validation & Submission
- ✅ API Integration
- ✅ Build & Configuration
- ✅ Static Asset Loading

### Deployment Coverage
- ✅ Environment Configuration
- ✅ Build Processes
- ✅ Container Setup
- ✅ Dependency Management
- ✅ Service Configuration

## 🎯 Success Criteria

### Ready for Deployment When:
- [ ] All automated tests pass (100% success rate)
- [ ] Manual testing checklist completed
- [ ] No critical errors in logs
- [ ] Build processes work correctly
- [ ] All core features functional
- [ ] Performance meets requirements
- [ ] Security measures in place

### Performance Benchmarks
- Page load times: < 3 seconds
- API response times: < 1 second
- Search results: < 2 seconds
- File uploads: Progress indicators working
- Mobile responsiveness: All screen sizes

## 🚀 After Testing

### If All Tests Pass
1. ✅ Commit all changes to Git
2. 🚀 Follow deployment guide (DEPLOYMENT_GUIDE.md)
3. 🌍 Test deployed application globally
4. 📊 Set up monitoring and analytics
5. 📝 Update documentation

### If Tests Fail
1. 🔍 Review failed test details
2. 🐛 Fix identified issues
3. 🔄 Re-run tests
4. 📝 Update code and configuration
5. ✅ Verify fixes work correctly

---

## 💡 Pro Tips

- **Run tests frequently** during development
- **Test after each major change** to catch regressions early
- **Use manual testing** for user experience validation
- **Check logs** for detailed error information
- **Test on different devices** and browsers
- **Verify performance** under various conditions

---

*This testing suite ensures your Afropedia application is robust, functional, and ready for global deployment! 🌍*
