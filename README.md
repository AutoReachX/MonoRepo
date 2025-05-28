# AutoReach - Twitter Growth Platform

A comprehensive platform for Twitter growth and engagement automation.

## 🚀 Features

- **Smart Automation**: Intelligent tweet scheduling and engagement
- **Analytics Dashboard**: Real-time growth metrics and insights
- **Content Management**: AI-powered content suggestions and optimization
- **Audience Targeting**: Advanced follower analysis and targeting
- **Multi-Account Support**: Manage multiple Twitter accounts

## 🏗️ Architecture

- **Frontend**: React with Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Deployment**: Render.com
- **Authentication**: OAuth 2.0 with Twitter API

## 📁 Project Structure

```
AutoReach/
├── frontend/                # React + Tailwind CSS frontend
├── backend/                 # FastAPI backend
├── infrastructure/          # IaC and deployment configs
├── docs/                    # Documentation
└── .github/                 # GitHub Actions workflows
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- Render account (for databases)

### Quick Start

**🚀 Automated Setup (Recommended):**
```bash
# 1. Run the setup script
setup-dev.bat

# 2. Configure your API keys in .env file
# 3. Start the development servers
quick-start.bat
```

**📋 Manual Setup:**
1. **Set up Render databases** (PostgreSQL + Redis)
2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt

   # Frontend
   cd frontend
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database URLs
   ```

4. **Start servers:**
   ```bash
   # Backend: http://localhost:8000
   start-backend.bat

   # Frontend: http://localhost:3000
   start-frontend.bat
   ```

### Detailed Setup Guide

See [setup-local.md](./setup-local.md) for complete step-by-step instructions.

## 📚 Documentation

See the [docs](./docs) directory for detailed documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
