# BCD BTOS - Project Context

> **Business Travel Order System** — Corporate travel booking with JAL & ANA flight schedule search  
> Last updated: 2026-03-05

---

## 1. What Is This Project?

BCD BTOS is a **Business Travel Order System** that lets users search real-time flight schedules for **JAL (JL)** and **ANA (NH)** airlines, build travel itineraries (flights, JR trains, hotels, car rentals, routes), and submit booking requests through a multi-step wizard.

The system is designed to eventually scale into a full corporate travel management platform (orders, approvals, itineraries, user management, etc.).

---

## 2. Tech Stack

| Layer       | Technology                              | Notes                                           |
| ----------- | --------------------------------------- | ----------------------------------------------- |
| Backend     | **NestJS 11** (TypeScript)              | REST API, SOLID architecture, modular design     |
| Logging     | **Pino** via `nestjs-pino`              | Structured JSON logs, pino-pretty in dev         |
| HTTP Client | **Axios**                               | Calls Airlabs API with 15s timeout               |
| Validation  | **class-validator / class-transformer** | DTO-based query validation                       |
| Config      | **@nestjs/config**                      | `.env` loaded globally via ConfigService         |
| Frontend    | **Vanilla HTML/JS** (modular)           | Tailwind CSS (CDN), Lucide icons, 9 JS modules  |
| Static      | **@nestjs/serve-static**                | Serves `public/` at root, excludes `/api`        |
| Runtime     | **Node.js 24 LTS** (ES2022 target)     |                                                  |

---

## 3. Project Structure

```
bcd-btos/
├── public/
│   ├── index.html                      # SPA frontend (HTML only)
│   ├── css/
│   │   └── styles.css                  # All custom CSS
│   └── js/
│       ├── state.js                    # Global application state
│       ├── ui.js                       # Confirm modal, auth, navigation, profile
│       ├── itinerary.js                # Itinerary CRUD + rendering
│       ├── booking.js                  # Booking wizard, tabs, traveler selection
│       ├── transport.js                # JR toggles, online provider selection
│       ├── flights.js                  # Flight schedule search (API calls)
│       ├── routes.js                   # Route search, detail modal, timeline
│       ├── time-picker.js              # Clock-face time picker widget
│       └── app.js                      # Entry point — event listeners, init
├── src/
│   ├── main.ts                         # Bootstrap: creates app, pipes, logger
│   ├── app.module.ts                   # Root module: config, logging, static, features
│   └── flights/
│       ├── flights.module.ts           # Feature module: wires provider via DI token
│       ├── flights.controller.ts       # GET /api/flights/schedules (HTTP layer only)
│       ├── flights.service.ts          # Orchestrates parallel airline fetching
│       ├── dto/
│       │   └── schedule-query.dto.ts   # Validates dep_iata & arr_iata
│       ├── interfaces/
│       │   ├── flight-record.interface.ts    # Provider-agnostic flight data shape
│       │   └── flight-provider.interface.ts  # Contract + injection token for providers
│       ├── constants/
│       │   └── flights.constants.ts    # Airline codes, API URL, timeout
│       └── providers/
│           └── airlabs.provider.ts     # Airlabs API client (implements FlightProvider)
├── test/
│   ├── AIRLABS_JAL.txt                 # Sample Airlabs response for JAL
│   └── AIRLABS_ANA.txt                 # Sample Airlabs response for ANA
├── .env                                # AIRLABS_API_KEY + PORT (gitignored)
├── .env.example                        # Template for .env
├── .gitignore
├── .nvmrc                              # Node.js version (24)
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

---

## 4. SOLID Architecture (Backend)

### Single Responsibility (S)
- **Controller** — HTTP concerns only (input/output)
- **Service** — Orchestration logic (parallel fetching, error aggregation)
- **Provider** — API communication + response normalization
- **DTO** — Input validation
- **Interfaces** — Data contracts

### Open/Closed (O)
- New airlines: add to `AIRLINE_CODES` in `flights.constants.ts`
- New data sources: create a class implementing `FlightProvider`, bind in module

### Liskov Substitution (L)
- Any `FlightProvider` implementation can replace `AirlabsProvider` without breaking the service

### Interface Segregation (I)
- `FlightProvider` has a single method (`fetchSchedules`) — no bloated interfaces

### Dependency Inversion (D)
- `FlightsService` depends on `FlightProvider` abstraction (injected via `FLIGHT_PROVIDER` token)
- Concrete `AirlabsProvider` is wired in the module, not in the service

---

## 5. Frontend Module Architecture

Each JS file has a single responsibility. No bundler — files are loaded via `<script>` tags in dependency order:

| File             | Responsibility                                |
| ---------------- | --------------------------------------------- |
| `state.js`       | Global state initialization + mock data       |
| `ui.js`          | Confirm modal, auth, navigation, profile      |
| `itinerary.js`   | Itinerary CRUD, rendering, badge styling      |
| `booking.js`     | 3-step wizard, tabs, traveler/applicant logic |
| `transport.js`   | JR form toggles, online provider selection    |
| `flights.js`     | Flight search API call + result rendering     |
| `routes.js`      | Route search, detail modal, segment timeline  |
| `time-picker.js` | 12h clock-face picker with AM/PM              |
| `app.js`         | Event listeners, Lucide init                  |

---

## 6. API Reference

### `GET /api/flights/schedules`

Search flight schedules for JAL and ANA between two airports.

| Query Param | Type   | Required | Validation               | Example |
| ----------- | ------ | -------- | ------------------------ | ------- |
| `dep_iata`  | string | Yes      | Exactly 3 letters (A-Z) | `HND`   |
| `arr_iata`  | string | Yes      | Exactly 3 letters (A-Z) | `NRT`   |

**Response** — `FlightRecord[]`

```json
[
  {
    "airline": "JL",
    "flightNumber": "JL3006",
    "departureTime": "2025-06-01 08:00:00",
    "arrivalTime": "2025-06-01 09:10:00",
    "status": "scheduled"
  }
]
```

**Error** — `502 Bad Gateway` if all airline API calls fail.

---

## 7. External Dependencies

| Service      | Purpose              | Auth                  | Docs                    |
| ------------ | -------------------- | --------------------- | ----------------------- |
| **Airlabs**  | Flight schedule data | API key (query param) | https://airlabs.co/docs |

- Base URL: `https://airlabs.co/api/v9/schedules`
- Airlines queried: `JL` (JAL), `NH` (ANA)
- Timeout: 15 seconds per request

---

## 8. Environment Variables

| Variable          | Required | Default | Description           |
| ----------------- | -------- | ------- | --------------------- |
| `AIRLABS_API_KEY` | Yes      | `""`    | Airlabs API key       |
| `PORT`            | No       | `3000`  | Server listening port |
| `NODE_ENV`        | No       | —       | `production` for JSON logs, otherwise pino-pretty |

Copy `.env.example` to `.env` and fill in your API key.

---

## 9. Running the Project

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Server starts at `http://localhost:3000`. The UI is served at root, API at `/api/flights/schedules`.

---

## 10. Scaling Roadmap (Future)

- [ ] **Migrate frontend to React** — Replace vanilla JS with React (Vite or Next.js)
- [ ] **Database integration** — PostgreSQL/MongoDB for travel orders, user data
- [ ] **Authentication** — JWT-based auth with roles (traveler, approver, admin)
- [ ] **More airlines** — Add new `FlightProvider` implementations or extend `AIRLINE_CODES`
- [ ] **Caching** — Redis or in-memory cache for Airlabs responses (rate limits)
- [ ] **Testing** — Unit tests for providers/service, e2e tests for controller
- [ ] **Docker** — Containerize for consistent deployment
- [ ] **CI/CD** — GitHub Actions pipeline for lint, test, build, deploy

---

## 11. Conventions

- **SOLID modules** — Each feature gets its own NestJS module with controller, service, providers, DTOs, and interfaces
- **Dependency Inversion** — Services depend on abstractions (interfaces + injection tokens), not concretions
- **Structured logging** — Use Pino logger with context objects (`{ depIata, arrIata }`) for searchable logs
- **Error handling** — Throw `HttpException` with appropriate status codes from services
- **Naming** — IATA codes uppercased at controller level; TypeScript interfaces suffixed with no prefix
- **Config** — All external config via `ConfigService`, never read `process.env` directly in services
- **Frontend SRP** — Each JS module handles one concern; no god-file patterns
