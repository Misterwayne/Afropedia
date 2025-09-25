# 🌍 Afropedia - African Knowledge Encyclopedia

A comprehensive, peer-reviewed encyclopedia platform celebrating African knowledge, culture, and history with modern web technologies.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account

### Local Development
```bash
# Backend
cd wikipedia-clone-py-backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd timbuktu-frontend
npm install
npm run dev
```

## 📁 Project Structure

```
Afropedia/
├── 📚 timbuktu-frontend/          # Next.js frontend
├── 🐍 wikipedia-clone-py-backend/ # FastAPI backend
├── 📖 docs/                       # Documentation
│   ├── architecture/              # System design docs
│   ├── deployment/                # Deployment guides
│   ├── setup/                     # Setup instructions
│   └── testing/                   # Testing documentation
├── ⚙️ config/                     # Configuration files
│   ├── backend/                   # Backend configs
│   ├── frontend/                  # Frontend configs
│   └── database/                  # Database schemas
└── 🔧 scripts/                    # Utility scripts
    ├── setup/                     # Setup scripts
    ├── deployment/                # Deployment scripts
    └── testing/                   # Testing scripts
```

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, Chakra UI, TypeScript
- **Backend**: FastAPI, Python, Pydantic
- **Database**: Supabase (PostgreSQL)
- **Search**: MeiliSearch
- **Authentication**: JWT + Supabase Auth
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 📚 Documentation

- [Architecture Overview](docs/architecture/AFROPEDIA_SITE_STRUCTURE_PLAN.md)
- [User Journey Flows](docs/architecture/USER_JOURNEY_FLOWS.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)
- [Setup Instructions](docs/setup/)
- [Testing Guide](docs/testing/TESTING_README.md)

## 🚀 Deployment

### Free Deployment (Recommended)
1. **Backend**: Deploy to [Railway](https://railway.app/new)
2. **Frontend**: Deploy to [Vercel](https://vercel.com/new)
3. **Database**: Use [Supabase](https://supabase.com) (free tier)

### Quick Deploy Scripts
```bash
# Setup environment
./scripts/deployment/setup-free-env.sh

# Deploy everything
./scripts/deployment/deploy-free.sh
```

## 🔧 Configuration

- **Backend Config**: `config/backend/config.py`
- **Frontend Config**: `config/frontend/tsconfig.json`
- **Database Schemas**: `config/database/`

## 🧪 Testing

Test files are kept local and not committed to the repository. See [Testing Guide](docs/testing/TESTING_README.md) for details.

## 📄 License

This project is part of the Afropedia initiative to preserve and share African knowledge.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Built with ❤️ for African knowledge preservation**