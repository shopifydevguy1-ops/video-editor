# System Architecture - AI Video Editor SaaS

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web Editor  │  │  Mobile Web  │  │   Admin UI   │      │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Next.js)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Next.js API Routes / NestJS Gateway        │    │
│  │  - Authentication (JWT)                            │    │
│  │  - Rate Limiting                                   │    │
│  │  - Request Validation                              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Editor     │  │   Video      │  │   AI/ML      │      │
│  │   Service    │  │   Generator  │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Template   │  │   Render     │  │   TTS        │      │
│  │   Service    │  │   Engine     │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA & STORAGE LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Redis      │  │   S3/R2      │      │
│  │  (Metadata)  │  │   (Cache)    │  │  (Media)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ElevenLabs  │  │   Pexels/    │  │   YouTube    │      │
│  │  (TTS)       │  │   Unsplash   │  │   API (v2)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack Decisions

### Frontend
- **Next.js 14+** (App Router) - SSR, API routes, optimal performance
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React DnD / DndKit** - Drag and drop for timeline
- **Fabric.js / Konva.js** - Canvas manipulation for preview
- **Wavesurfer.js** - Audio waveform visualization
- **Zustand** - State management

### Backend
- **NestJS** - Enterprise-grade Node.js framework
  - Modular architecture
  - Built-in dependency injection
  - Excellent for microservices scaling
- **TypeScript** - Full-stack type safety
- **Prisma** - Type-safe ORM
- **BullMQ** - Job queue for video rendering
- **Socket.io** - Real-time updates for render progress

### Video Processing
- **FFmpeg** (via fluent-ffmpeg) - Core video rendering
- **FFprobe** - Video metadata extraction
- **Sharp** - Image processing
- **Canvas (node-canvas)** - Text rendering, captions

### AI Services
- **ElevenLabs API** - Primary TTS (best quality)
- **OpenAI GPT-4** - Script generation, scene breakdown
- **Fallback TTS**: Google Cloud TTS, Azure TTS

### Database
- **PostgreSQL 15+** - Primary database
  - JSONB for flexible template/config storage
  - Full-text search for media library
  - TimescaleDB extension (optional) for analytics
- **Redis** - Caching, session storage, job queue

### Storage
- **Cloudflare R2** (primary) or **AWS S3** - Media storage
  - CDN integration
  - Lower egress costs
- **Local temp storage** - For processing (cleaned after render)

### Infrastructure
- **Vercel** - Frontend hosting (edge functions)
- **Railway / Render / Fly.io** - Backend hosting
- **Docker** - Containerization for render workers
- **GitHub Actions** - CI/CD

## 3. Core Modules Breakdown

### 3.1 Frontend Modules

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Protected routes
│   │   ├── editor/        # Video editor page
│   │   ├── templates/     # Template gallery
│   │   └── projects/      # Project list
│   └── api/               # API routes (proxy)
├── components/
│   ├── editor/            # Editor components
│   │   ├── Timeline/      # Timeline component
│   │   ├── Preview/       # Video preview
│   │   ├── Layers/        # Layer management
│   │   └── Controls/      # Playback controls
│   ├── generator/         # Faceless video generator
│   └── shared/            # Shared components
├── lib/
│   ├── stores/            # Zustand stores
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utilities
│   └── api/               # API client
└── types/                 # TypeScript types
```

### 3.2 Backend Modules

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication
│   │   ├── users/         # User management
│   │   ├── projects/      # Project CRUD
│   │   ├── editor/        # Editor state sync
│   │   ├── templates/     # Template system
│   │   ├── video/         # Video generation
│   │   ├── render/        # Render engine
│   │   ├── tts/           # Text-to-speech
│   │   ├── media/         # Media library
│   │   └── export/        # Export service
│   ├── common/            # Shared utilities
│   ├── config/            # Configuration
│   └── queue/             # Job queue setup
└── workers/
    └── render-worker/     # FFmpeg render worker
```

## 4. Database Schema

### Core Tables

```sql
-- Users
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  subscription_tier VARCHAR(50), -- free, pro, enterprise
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Projects
projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  aspect_ratio VARCHAR(10), -- 16:9, 9:16, 1:1
  resolution JSONB, -- {width: 1920, height: 1080}
  duration DECIMAL, -- seconds
  editor_state JSONB, -- Full editor state (timeline, layers)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Templates
templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100), -- viral, explainer, listicle
  config JSONB, -- Template configuration
  preview_url TEXT,
  created_at TIMESTAMP
)

-- Renders (Job tracking)
renders (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50), -- pending, processing, completed, failed
  output_url TEXT,
  progress INTEGER, -- 0-100
  error_message TEXT,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
)

-- Media Library
media_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- video, image, audio
  url TEXT,
  thumbnail_url TEXT,
  metadata JSONB, -- duration, dimensions, etc.
  created_at TIMESTAMP
)

-- TTS Audio Cache
tts_cache (
  id UUID PRIMARY KEY,
  text_hash VARCHAR(64), -- SHA-256 of text + voice + settings
  voice_id VARCHAR(100),
  audio_url TEXT,
  duration DECIMAL,
  word_timestamps JSONB,
  created_at TIMESTAMP
)
```

## 5. API Design

### REST Endpoints

```
Authentication:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/refresh
  GET    /api/auth/me

Projects:
  GET    /api/projects
  POST   /api/projects
  GET    /api/projects/:id
  PATCH  /api/projects/:id
  DELETE /api/projects/:id
  POST   /api/projects/:id/duplicate

Editor:
  POST   /api/projects/:id/editor-state  # Save editor state
  GET    /api/projects/:id/editor-state  # Load editor state

Templates:
  GET    /api/templates
  GET    /api/templates/:id
  POST   /api/templates/:id/apply        # Apply template to project

Video Generation:
  POST   /api/generate/script             # Generate script from topic
  POST   /api/generate/scenes             # Break script into scenes
  POST   /api/generate/video              # Generate faceless video

TTS:
  POST   /api/tts/generate                # Generate speech
  GET    /api/tts/voices                  # List available voices

Rendering:
  POST   /api/render/start                # Start render job
  GET    /api/render/:id/status           # Get render status
  GET    /api/render/:id/download         # Download completed video

Media:
  POST   /api/media/upload                # Upload media
  GET    /api/media                       # List user media
  DELETE /api/media/:id

Export:
  POST   /api/export/youtube              # Export for YouTube
  POST   /api/export/shorts               # Export for Shorts
```

### WebSocket Events

```
Connection: /socket.io
Events:
  - render:progress (renderId, progress)
  - render:complete (renderId, url)
  - render:error (renderId, error)
```

## 6. Video Rendering Pipeline

### Render Flow

```
1. User clicks "Export"
   ↓
2. Backend validates project state
   ↓
3. Create render job in database
   ↓
4. Queue render job (BullMQ)
   ↓
5. Render worker picks up job
   ↓
6. Download assets (videos, images, audio)
   ↓
7. Generate captions (if needed)
   ↓
8. FFmpeg composition:
   - Layer videos/images
   - Overlay text/captions
   - Mix audio tracks
   - Apply transitions
   ↓
9. Encode to target format/resolution
   ↓
10. Upload to S3/R2
   ↓
11. Update render status
   ↓
12. Notify user via WebSocket
```

### FFmpeg Command Structure

```bash
ffmpeg \
  -i video1.mp4 \
  -i video2.mp4 \
  -i audio.mp3 \
  -filter_complex "
    [0:v]scale=1920:1080[bg];
    [1:v]scale=1280:720[overlay];
    [bg][overlay]overlay=320:180[composed];
    [composed]subtitles=captions.srt[final]
  " \
  -map "[final]" \
  -map 2:a \
  -c:v libx264 \
  -preset medium \
  -crf 23 \
  -c:a aac \
  -b:a 192k \
  output.mp4
```

## 7. Template System Architecture

### Template Configuration Schema

```typescript
interface TemplateConfig {
  id: string;
  name: string;
  category: 'viral' | 'explainer' | 'listicle' | 'quote';
  
  // Caption settings
  captions: {
    style: 'word-by-word' | 'sentence' | 'minimal';
    font: string;
    fontSize: number;
    position: 'top' | 'center' | 'bottom';
    animation: 'fade' | 'slide' | 'typewriter';
    color: string;
    backgroundColor?: string;
  };
  
  // Cut settings
  cuts: {
    frequency: number; // seconds between cuts
    transition: 'cut' | 'fade' | 'zoom' | 'slide';
    transitionDuration: number;
  };
  
  // Audio settings
  audio: {
    musicVolume: number; // 0-1
    narrationVolume: number;
    ducking: boolean; // Lower music during speech
  };
  
  // Visual settings
  visuals: {
    zoomLevel: number; // 1.0 = no zoom, 1.2 = 20% zoom
    motion: 'static' | 'slow-zoom' | 'ken-burns';
    backgroundType: 'stock' | 'animated' | 'gradient';
  };
  
  // Scene structure
  sceneStructure: {
    hookDuration: number; // First N seconds
    hookStyle: 'bold-text' | 'fast-cuts' | 'question';
    mainContentStyle: 'explainer' | 'list' | 'story';
  };
}
```

### Template Application Flow

```
1. User selects template
   ↓
2. Load template config from DB
   ↓
3. Apply config to project:
   - Update editor state
   - Set caption styles
   - Configure transitions
   - Set audio mixing
   ↓
4. User can customize
   ↓
5. Render uses template config
```

## 8. Faceless Video Generation Flow

```
1. User inputs: Topic / Script
   ↓
2. AI Script Generation (if needed):
   - Generate hook
   - Generate main content
   - Generate CTA
   ↓
3. Scene Breakdown:
   - Split script into scenes
   - Assign duration per scene
   - Determine visual type per scene
   ↓
4. Media Selection:
   - Query stock footage library
   - Match scenes to visuals
   - Download/queue media
   ↓
5. TTS Generation:
   - Generate narration audio
   - Get word-level timestamps
   ↓
6. Auto-Assembly:
   - Create timeline structure
   - Place videos/images
   - Add captions with timestamps
   - Add background music
   - Apply transitions
   ↓
7. Return project ready for editing/export
```

## 9. Performance Optimizations

### Frontend
- Virtual scrolling for timeline
- Canvas-based preview (not DOM)
- Lazy loading of media thumbnails
- Debounced auto-save
- Web Workers for heavy computations

### Backend
- Redis caching for templates, TTS
- CDN for static assets
- Background job processing
- Streaming uploads/downloads
- Database connection pooling

### Rendering
- Parallel FFmpeg processing (multiple workers)
- Progressive rendering (low-res preview first)
- Asset pre-warming
- Render queue prioritization

## 10. Security Considerations

- JWT authentication with refresh tokens
- Rate limiting per user tier
- File upload validation (type, size)
- CORS configuration
- Input sanitization
- SQL injection prevention (Prisma)
- XSS prevention
- Secure media URLs (signed, time-limited)

## 11. Scalability Plan

### Phase 1 (MVP)
- Single server (Next.js + API)
- Local FFmpeg processing
- Basic queue (BullMQ)
- Single database

### Phase 2 (Growth)
- Separate render workers (Docker)
- Horizontal scaling of workers
- Database read replicas
- CDN for media

### Phase 3 (Scale)
- Microservices architecture
- Dedicated render cluster
- Multi-region deployment
- Advanced caching layers

## 12. Deployment Architecture

```
┌─────────────────┐
│   Vercel Edge   │  ← Frontend (Next.js)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  API Server     │  ← Backend (NestJS)
│  (Railway/Render)│
└─────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Postgres│ │ Redis  │
└────────┘ └────────┘
         │
         ▼
┌─────────────────┐
│ Render Workers  │  ← FFmpeg workers (Docker)
│  (Fly.io/K8s)   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Cloudflare R2  │  ← Media storage
└─────────────────┘
```

## 13. Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Project setup (Next.js + NestJS)
- Database schema & migrations
- Authentication system
- Basic editor UI (timeline, preview)
- Project CRUD

### Phase 2: Core Editor (Weeks 3-4)
- Layer system
- Drag & drop uploads
- Basic video playback
- Text overlay component
- Audio mixing

### Phase 3: Rendering (Weeks 5-6)
- FFmpeg integration
- Render queue system
- Basic video export
- Progress tracking

### Phase 4: AI Features (Weeks 7-8)
- TTS integration
- Script generation
- Scene breakdown
- Faceless video generator

### Phase 5: Templates (Weeks 9-10)
- Template system
- Viral templates
- Template gallery
- Customization UI

### Phase 6: Polish & Scale (Weeks 11-12)
- Performance optimization
- Error handling
- Analytics
- Documentation

---

This architecture provides a solid foundation for a production-grade SaaS video editor. The modular design allows for iterative development and future scaling.

