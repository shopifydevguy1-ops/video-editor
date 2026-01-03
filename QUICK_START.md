# Quick Start Guide

## 🚀 Running Locally

The application is now starting! Here's what you need to know:

### Prerequisites Check

Before the app can fully work, you need:

1. **PostgreSQL Database**
   ```bash
   # Check if PostgreSQL is running
   pg_isready
   
   # If not installed, install it:
   # macOS: brew install postgresql@15
   # Then start it: brew services start postgresql@15
   
   # Create database:
   createdb ai_video_editor
   ```

2. **Redis** (for render queue)
   ```bash
   # Check if Redis is running
   redis-cli ping
   # Should return: PONG
   
   # If not installed:
   # macOS: brew install redis
   # Then start it: brew services start redis
   ```

3. **FFmpeg** (for video processing)
   ```bash
   # Check if FFmpeg is installed
   ffmpeg -version
   
   # If not installed:
   # macOS: brew install ffmpeg
   ```

### Environment Setup

1. **Backend Configuration** (`backend/.env`):
   - Update `DATABASE_URL` with your PostgreSQL credentials
   - Set `JWT_SECRET` and `JWT_REFRESH_SECRET` (use strong random strings)
   - Configure Redis connection (defaults work if Redis is on localhost)
   - Add API keys for AI services (optional for basic testing):
     - `ELEVENLABS_API_KEY` - For TTS (optional, has fallback)
     - `OPENAI_API_KEY` - For script generation (optional, has fallback)
   - Storage (S3/R2) - Optional for now, can use local storage

2. **Frontend Configuration** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

### Database Migration

Once PostgreSQL is set up, run migrations:

```bash
cd backend
npx prisma migrate dev --name init
```

### Starting the Application

The servers should be running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api

If they're not running, start them manually:

```bash
# From root directory
npm run dev

# Or separately:
npm run dev:frontend  # Frontend on :3000
npm run dev:backend   # Backend on :4000
```

### First Steps

1. **Open the application**: http://localhost:3001
2. **Register a new account**: Click "Get Started" → "Sign up"
3. **Create a project**: Go to Projects → "New Project"
4. **Or generate a video**: Go to Generator → Enter a topic

### Troubleshooting

**Backend won't start:**
- Check if PostgreSQL is running: `pg_isready`
- Check if Redis is running: `redis-cli ping`
- Verify `.env` file exists in `backend/` directory
- Check port 4000 is not in use: `lsof -i :4000`

**Frontend won't start:**
- Check port 3001 is not in use: `lsof -i :3001`
- Verify `frontend/.env.local` exists

**Database connection errors:**
- Verify DATABASE_URL in `backend/.env`
- Ensure database exists: `psql -l | grep ai_video_editor`
- Run migrations: `cd backend && npx prisma migrate dev`

**Render queue errors:**
- Ensure Redis is running: `redis-cli ping`
- Check Redis connection in `backend/.env`

### Testing Without Full Setup

You can test the UI without all services:

- **Without PostgreSQL**: UI will work, but can't save projects
- **Without Redis**: UI works, but render queue won't process
- **Without FFmpeg**: UI works, but video rendering will fail
- **Without API keys**: Script generation and TTS have fallbacks

### Development Tips

1. **View Database**: `cd backend && npx prisma studio`
2. **Check Logs**: Backend logs in terminal, Frontend in browser console
3. **API Docs**: Test endpoints at http://localhost:4000/api/health

### Next Steps

Once everything is running:
1. Create an account
2. Try the AI video generator
3. Edit a project in the timeline
4. Upload media files
5. Export a video

Enjoy building! 🎬

