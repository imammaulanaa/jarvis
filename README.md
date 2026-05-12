# JARVIS — Joint Automation & Resource Visualization Infrastructure System

Self-service platform untuk developer — service catalog, deploy, provisioning.

## Architecture

```
apps/web     → Next.js 14 frontend (TypeScript + Tailwind)
apps/api     → Go backend (Fiber framework)
packages/    → Shared types
charts/      → Helm chart
```

## Quick Start

```bash
git clone git@github.com:YOUR_USERNAME/internal-developer-portal.git
cd internal-developer-portal
cp .env.example .env
docker compose up postgres redis
make dev
```

## Development

| Service | URL |
|---------|-----|
| Web     | http://localhost:3000 |
| API     | http://localhost:8080 |

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Go, Fiber
- **Database**: PostgreSQL
- **Cache**: Redis
