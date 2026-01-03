# AI Video Editor SaaS Platform

Production-grade video editing platform with AI-powered faceless video generation for YouTube, TikTok, Instagram Reels, and Shorts.

## 🚀 Features

- **Timeline-based Video Editor** - Professional video editing with layers, transitions, and effects
- **Faceless Video Generator** - Automatically create videos from text/scripts
- **Text-to-Speech** - Natural AI voices with word-level timestamps
- **Viral Templates** - Pre-built templates for TikTok, Reels, and Shorts
- **YouTube Automation** - End-to-end workflow from topic to published video
- **Multi-format Export** - Optimized exports for 16:9 (YouTube) and 9:16 (Shorts)

## 📁 Project Structure

```
.
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend API
├── shared/            # Shared TypeScript types and utilities
├── ARCHITECTURE.md    # Detailed system architecture
└── README.md          # This file
```

## 🛠️ Tech Stack

### Frontend
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Zustand (state management)

### Backend
- NestJS
- TypeScript
- Prisma (ORM)
- PostgreSQL
- Redis
- BullMQ (job queue)
- FFmpeg (video processing)

### AI Services
- ElevenLabs (TTS)
- OpenAI GPT-4 (script generation)

### Infrastructure
- Vercel (frontend)
- Railway/Render (backend)
- Cloudflare R2 (media storage)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- FFmpeg installed on system

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both `frontend/` and `backend/`
   - Fill in your database, Redis, and API keys

4. Set up the database:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3001
   - Backend: http://localhost:4000

## 📚 Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture, API design, and implementation details.

## 🏗️ Development Roadmap

- [x] System architecture design
- [ ] Project setup and foundation
- [ ] Authentication system
- [ ] Basic video editor UI
- [ ] Timeline and layer system
- [ ] Video rendering engine
- [ ] TTS integration
- [ ] Faceless video generator
- [ ] Template system
- [ ] Export and optimization

## 📝 License

Proprietary - All rights reserved

