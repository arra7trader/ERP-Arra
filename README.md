# 🎬 YouTube Creator ERP

**AI-Powered Content Management System** - Sistem ERP cerdas untuk mengelola channel YouTube dengan integrasi Kiro AI.

## ✨ Fitur Utama

### 🎯 Dashboard (AI Command Center)
- Daily briefing otomatis dari AI
- Ringkasan kalender produksi
- Kesehatan finansial real-time
- Panel insight AI

### 📹 Content Pipeline (Manajemen Video)
- Alur kerja dari ideasi hingga publish
- Status tracking: Ideation → Pre-Production → Production → Post-Production → Review → Published
- AI schedule suggestion
- Support video format 15-20 menit

### 💰 RAB Module (Manajemen Anggaran)
- Rencana Anggaran Biaya per proyek
- Tracking pengeluaran real-time
- AI risk detection untuk over-budget
- Kategori: talent_fee, equipment, location, editing, marketing, misc

### 👥 Talent Database
- Database talent dengan parameter visual
- Konsistensi wajah/tubuh untuk AI-generated filmmaking
- Fee management dan payment tracking
- Assignment ke video projects

### 📢 Marketing & Distribusi
- Perencanaan kampanye promosi
- AI copywriting untuk social media
- Multi-platform: YouTube, Instagram, TikTok, Twitter, Facebook
- Performance tracking

### 🤖 Kiro AI Integration
- Daily briefing otomatis
- Schedule suggestion
- Budget analysis & risk detection
- Marketing copy generation
- Optimal publish time suggestion
- RAB draft generation

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TailwindCSS 4, TypeScript |
| Backend | NestJS 11, Prisma 5, TypeScript |
| Database | Turso (LibSQL) - Cloud SQLite |
| AI | Kiro AI API |
| Auth | JWT, Passport.js |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm

### Installation

```bash
# Install dependencies
npm install

# Setup database (sudah terkonfigurasi dengan Turso)
cd apps/api
npx ts-node prisma/init-turso.ts
npx ts-node prisma/seed.ts

# Start development
npm run dev
```

### Access
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs

### Default Login
```
Email: admin@creator.io
Password: admin123
```

## 📁 Project Structure

```
youtube-creator-erp/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── prisma/             # Database schema & scripts
│   │   └── src/
│   │       ├── common/         # Shared (Prisma service)
│   │       └── modules/
│   │           └── youtube-creator/
│   │               ├── ai/         # Kiro AI integration
│   │               ├── auth/       # Authentication
│   │               ├── budgets/    # RAB management
│   │               ├── dashboard/  # Dashboard & briefing
│   │               ├── marketing/  # Campaign management
│   │               ├── notifications/
│   │               ├── talents/    # Talent database
│   │               └── videos/     # Content pipeline
│   └── web/                    # Next.js Frontend
│       └── src/
│           ├── app/
│           │   ├── (auth)/     # Login page
│           │   └── (dashboard)/ # Dashboard pages
│           ├── components/
│           ├── contexts/
│           ├── lib/            # API client
│           └── types/
└── docs/
```

## 🔌 API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` |
| Dashboard | `GET /api/dashboard/summary/:userId`, `GET /api/dashboard/briefing/:userId` |
| Videos | `GET /api/videos/user/:userId`, `POST /api/videos`, `PUT /api/videos/:id/status` |
| Budgets | `GET /api/budgets/video/:videoId`, `POST /api/budgets`, `POST /api/budgets/:id/expense` |
| Talents | `GET /api/talents/user/:userId`, `POST /api/talents`, `POST /api/talents/assign` |
| Marketing | `GET /api/marketing/user/:userId`, `POST /api/marketing/:id/generate-copy` |
| AI | `POST /api/ai/suggest-schedule`, `POST /api/ai/generate-rab`, `POST /api/ai/analyze-budget` |

## 🔐 Environment Variables

### Backend (apps/api/.env)
```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
KIRO_AI_API_KEY=your-kiro-api-key
JWT_SECRET=your-jwt-secret
PORT=3000
```

### Frontend (apps/web/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all apps in development |
| `npm run dev:api` | Start API server only |
| `npm run dev:web` | Start web frontend only |
| `npm run build` | Build all apps |

## 🎨 Design

**Typography:**
- Sans: Geist Mono, ui-monospace, monospace
- Mono: JetBrains Mono, monospace

**Color Scheme:**
- Primary: Blue-Purple gradient
- Success: Green
- Warning: Orange
- Danger: Red

---

**YouTube Creator ERP** - Powered by Kiro AI 🤖
