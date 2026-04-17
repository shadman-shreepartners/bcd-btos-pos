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
| `npm test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:cov` | Run unit tests with coverage |
| `npm run test:e2e` | Run E2E tests |

## API

- **Global prefix:** `/api/v1`
- **Health check:** `GET /health`
- **JAL SSO:** `POST /api/v1/integrations/jal/sso` — returns form fields for browser POST to JAL
- **JAL retrieve:** `POST /api/v1/integrations/jal/retrieve` — SOAP RetrieveProcedure by `projectNumber` (body JSON)
- **ANA SSO:** `POST /api/v1/integrations/ana/sso` — returns form fields for browser POST to ANA Biz SSO portal
- **Ekispert search:** `POST /api/v1/integrations/ekispert/search` — server-side route search proxy with API key kept out of the browser

```bash
# Health check
curl http://localhost:3004/health
```

## Configuration

Environment variables validated at startup via zod. App refuses to start if required vars are missing.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3004` | Service port |
| `NODE_ENV` | No | `development` | development, staging, production, test |
| `JAL_SSO_URL` | Yes | — | JAL SSO v2 endpoint |
| `JAL_SEAMLESS_ID` | Yes | — | Company seamless ID for JAL SSO |
| `JAL_ACCESS_CODE` | Yes | — | Access code for JAL SSO |
| `JAL_ACUD_ID` | Yes | — | ACUD ID credential |
| `JAL_ACUD_PASSWORD` | Yes | — | ACUD password credential |
| `JAL_SOAP_WSDL_URL` | Yes | — | WSDL URL for JAL RetrieveProcedure SOAP client |
| `JAL_SOAP_BASIC_USER` | No | — | HTTP Basic user for SOAP (set with password) |
| `JAL_SOAP_BASIC_PASSWORD` | No | — | HTTP Basic password for SOAP (set with user) |
| `JAL_SOAP_RETRIEVE_OPERATION` | No | `RetrieveProcedure` | SOAP operation name (without `Async` suffix) |
| `ANA_SSO_URL` | No | ANA Biz portal URL | ANA Biz SSO endpoint |
| `ANA_SEND_DATA_URL` | No | — | BTOS callback URL ANA posts booking data to |
| `ANA_SSO_CREDENTIALS` | Yes | — | JSON array of per-company credential records (companyId, employeeId, loginId, loginPw, adminUserId, userId, passwd, corpCode) |
| `EKISPERT_API_KEY` | Yes | — | API key for Ekispert route search proxy |
| `EKISPERT_BASE_URL` | No | — | Ekispert upstream base URL |

