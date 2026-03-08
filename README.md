# BCD BTOS — Business Travel Order System

A corporate travel booking system built with **NestJS** (TypeScript backend) and **vanilla JS** (Tailwind CSS frontend). Features flight offer search and real-time flight status tracking via the Amadeus APIs, multi-modal itinerary building (flights, JR trains, hotels, car rentals, routes), and a multi-step booking wizard.

---

## Features

- **Flight Offer Search** — Search available flights with pricing, duration, and stops via Amadeus Flight Offers Search API
- **Flight Status Tracking** — Real-time flight status with terminal/gate info via Amadeus On Demand Flight Status API
- **Multi-Modal Itinerary** — Build itineraries with flights, JR/Shinkansen, hotels, car rentals, and transit routes
- **3-Step Booking Wizard** — Traveler info, itinerary building with review, and submission
- **Domestic & International Flows** — Separate booking paths with flow-specific forms and validation
- **Online Provider Redirect** — Direct links to JR Express, JAL, ANA, Star Flyer, Rakuten, Jalan
- **Route Search** — Multi-transfer route planning with segment-by-segment timeline view
- **Clock Time Picker** — Custom 12-hour clock-face widget with AM/PM toggle
- **Structured Logging** — Pino-based structured JSON logging with pretty output in development

---

## Tech Stack

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Backend  | NestJS 11, TypeScript, Pino        |
| Frontend | Vanilla JS, Tailwind CSS, Lucide   |
| API      | Amadeus (flight search & status)   |
| Runtime  | Node.js 24 LTS                     |

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd bcd-btos-pos
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and add your AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET
# Register at https://developers.amadeus.com (free tier available)

# 3. Run in development
npm run start:dev

# 4. Open in browser
# http://localhost:3000
```

---

## Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run start:dev`  | Start in watch mode (development)|
| `npm run build`      | Compile TypeScript to `dist/`    |
| `npm run start:prod` | Run compiled production build    |
| `npm start`          | Start without watch mode         |

---

## API

### `GET /api/flights/schedules`

Search for available flight offers.

| Param      | Type   | Required | Example      |
| ---------- | ------ | -------- | ------------ |
| `dep_iata` | string | Yes      | `HND`        |
| `arr_iata` | string | Yes      | `NRT`        |
| `date`     | string | No       | `2026-03-10` |

```bash
curl "http://localhost:3000/api/flights/schedules?dep_iata=HND&arr_iata=NRT&date=2026-03-10"
```

Returns `FlightRecord[]` with airline, flight number, departure/arrival times, price, duration, and stops.

### `GET /api/flights/status`

Look up real-time flight status.

| Param          | Type   | Required | Example      |
| -------------- | ------ | -------- | ------------ |
| `carrierCode`  | string | Yes      | `JL`         |
| `flightNumber` | string | Yes      | `319`        |
| `date`         | string | Yes      | `2026-03-10` |

```bash
curl "http://localhost:3000/api/flights/status?carrierCode=JL&flightNumber=319&date=2026-03-10"
```

Returns `FlightStatus[]` with departure/arrival airports, terminals, gates, scheduled times, and status.

---

## Architecture

The backend follows **SOLID principles**:

- **Single Responsibility** — Controller (HTTP), Service (orchestration), Provider (API calls)
- **Open/Closed** — New data sources implement `FlightProvider` interface without touching existing code
- **Dependency Inversion** — Service depends on `FlightProvider` abstraction, not Amadeus directly

The frontend uses **modular vanilla JS** with single-responsibility modules:

```
public/js/
├── state.js        — Global application state
├── ui.js           — Navigation, auth, modals, profile
├── itinerary.js    — Itinerary CRUD and rendering
├── booking.js      — 3-step wizard, tabs, traveler selection
├── transport.js    — JR toggles, online providers
├── flights.js      — Flight search API integration
├── routes.js       — Route search and timeline
├── time-picker.js  — Clock-face time picker
└── app.js          — Init and event listeners
```

---

## Project Structure

```
bcd-btos-pos/
├── public/                    # Static frontend (served at /)
│   ├── index.html
│   ├── css/styles.css
│   └── js/                    # 9 modular JS files
├── src/                       # NestJS backend
│   ├── main.ts                # Bootstrap
│   ├── app.module.ts          # Root module
│   └── flights/               # Flight feature
│       ├── controllers/
│       ├── services/
│       ├── providers/         # Amadeus API client
│       ├── interfaces/        # FlightRecord, FlightProvider, FlightStatus
│       ├── constants/         # Airline codes, timeouts
│       └── dto/               # Input validation
├── .env.example
├── tsconfig.json
└── package.json
```

---

## Environment Variables

| Variable               | Required | Default | Description                     |
| ---------------------- | -------- | ------- | ------------------------------- |
| `AMADEUS_CLIENT_ID`    | Yes      | —       | Amadeus API client ID           |
| `AMADEUS_CLIENT_SECRET`| Yes      | —       | Amadeus API client secret       |
| `PORT`                 | No       | `3000`  | Server port                     |
| `NODE_ENV`             | No       | —       | Set `production` for JSON logs  |

---

## License

Private — BCD Travel
