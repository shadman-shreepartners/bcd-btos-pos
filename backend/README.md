# bcd-japan-integration-service

NestJS microservice for Japan external integrations.

## Prerequisites

- Node.js >=22 <23
- npm >=10

## Setup

```bash
cp .env.example .env
npm ci
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to dist/ |
| `npm run start` | Start production server |
| `npm run start:dev` | Start dev server with watch mode |
| `npm run start:debug` | Start debug server with watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Run Prettier |

## API

- **Global prefix:** `/api/v1`
- **Health check:** `GET /health`

```bash
# Health check
curl http://localhost:3004/health
```

## Configuration

Environment variables validated at startup via zod. App refuses to start if required vars are missing.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3004` | Service port |
| `NODE_ENV` | No | `development` | development, staging, production |
