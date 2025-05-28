# 🚀 Local Development Setup with Render Databases

This guide will help you set up AutoReach for local development using Render's managed databases.

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.9+** - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/)

## 🗄️ Step 1: Set Up Render Databases

### Create PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `autoreach-db`
   - **Database**: `autoreach`
   - **User**: `autoreach_user`
   - **Region**: Choose closest to you
   - **Plan**: Free (to start)
4. Click **"Create Database"**
5. **Copy the External Database URL** (starts with `postgresql://`)

### Create Redis Instance
1. In Render Dashboard, click **"New"** → **"Redis"**
2. Configure:
   - **Name**: `autoreach-redis`
   - **Region**: Same as your PostgreSQL
   - **Plan**: Free
3. Click **"Create Redis"**
4. **Copy the External Redis URL** (starts with `redis://`)

## ⚙️ Step 2: Configure Environment

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your Render database URLs:
   ```env
   # Replace with your actual Render database URLs
   DATABASE_URL=postgresql://autoreach_user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/autoreach
   REDIS_URL=redis://red-xxxxx:password@oregon-redis.render.com:6379
   
   # Generate a secure secret key
   SECRET_KEY=your-super-secret-key-here-change-this
   DEBUG=true
   
   # Add your Twitter API credentials (get from developer.twitter.com)
   TWITTER_API_KEY=your_api_key
   TWITTER_API_SECRET=your_api_secret
   TWITTER_ACCESS_TOKEN=your_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
   TWITTER_BEARER_TOKEN=your_bearer_token
   ```

## 🐍 Step 3: Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run database migrations:**
   ```bash
   # Create migration files
   alembic init alembic
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

6. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload
   ```

   ✅ Backend should be running at: http://localhost:8000

## ⚛️ Step 4: Frontend Setup

1. **Open new terminal and navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   ✅ Frontend should be running at: http://localhost:3000

## 🧪 Step 5: Verify Setup

1. **Check API health:**
   - Visit: http://localhost:8000/health
   - Should return: `{"status": "healthy", "version": "1.0.0"}`

2. **Check API docs:**
   - Visit: http://localhost:8000/docs
   - Should show Swagger UI

3. **Check frontend:**
   - Visit: http://localhost:3000
   - Should show AutoReach dashboard

## 🔧 Development Scripts

Create these helpful scripts in your project root:

**`start-backend.bat` (Windows) / `start-backend.sh` (Mac/Linux):**
```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
uvicorn app.main:app --reload
```

**`start-frontend.bat` (Windows) / `start-frontend.sh` (Mac/Linux):**
```bash
cd frontend
npm start
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check if your IP is whitelisted in Render (usually automatic)
- Ensure the database is running in Render dashboard

### Python Environment Issues
- Make sure virtual environment is activated
- Try `pip install --upgrade pip` first
- On Windows, you might need Visual Studio Build Tools for some packages

### Node.js Issues
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and run `npm install` again
- Make sure you're using Node.js 18+

## 🎯 Next Steps

1. **Get Twitter API credentials** from [developer.twitter.com](https://developer.twitter.com)
2. **Set up your first user account** via the API
3. **Start building features!**

## 📞 Need Help?

- Check the logs in both terminal windows
- Visit API docs at http://localhost:8000/docs
- Check Render dashboard for database status
