# Setup Guide

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
3. **Redis 7+** - [Download](https://redis.io/download)
4. **FFmpeg** - [Download](https://ffmpeg.org/download.html)

### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html and add to PATH

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
cd shared && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb ai_video_editor

# Or using psql:
psql -U postgres
CREATE DATABASE ai_video_editor;
\q
```

### 3. Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/env.example backend/.env
# Edit backend/.env with your values
```

**Frontend (`frontend/.env.local`):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run Database Migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start Redis

```bash
# macOS (if installed via Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Or run directly
redis-server
```

### 6. Start Development Servers

```bash
# From root directory
npm run dev

# Or start separately:
npm run dev:backend  # http://localhost:4000
npm run dev:frontend # http://localhost:3000
```

## Verification

1. **Backend Health Check:**
   ```bash
   curl http://localhost:4000/api/health
   ```

2. **Frontend:**
   Open http://localhost:3000 in your browser

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `backend/.env`
- Ensure database exists: `psql -l | grep ai_video_editor`

### Redis Connection Issues
- Verify Redis is running: `redis-cli ping` (should return PONG)
- Check REDIS_HOST and REDIS_PORT in `backend/.env`

### FFmpeg Not Found
- Verify installation: `ffmpeg -version`
- Ensure FFmpeg is in your PATH
- On Windows, add FFmpeg bin directory to PATH

### Port Already in Use
- Backend (4000): Change PORT in `backend/.env`
- Frontend (3000): Change port in `frontend/package.json` dev script

## Next Steps

1. Create your first user account via the registration endpoint
2. Explore the API documentation (to be added)
3. Start building features!

