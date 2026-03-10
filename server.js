const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// SearchAPI.io key (NOT serpapi.com — they are different services)
const SEARCH_API_KEY = process.env.SEARCH_API_KEY || '3gCkrMcuACGyPvZ9PWYEgMFE';
const SEARCH_API_BASE = 'https://www.searchapi.io/api/v1/search';

// ── RESILIENCE CONFIG ─────────────────────────────────────────────
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_MS  = 1000;          // 1s → 3s → 9s exponential backoff
const REQUEST_TIMEOUT_MS = 30000;     // 30s per attempt

// ── CACHE: in-memory, keyed by "ORIGIN-DEST-DATE" ────────────────
// TTL varies by how far out the departure is:
//   ≤3 days  → 2 hours  (prices volatile close to departure)
//   ≤14 days → 6 hours
//   >14 days → 12 hours (prices rarely change far out)
const cache = new Map();

function getCacheTTL(departureDate) {
  const daysOut = (new Date(departureDate) - Date.now()) / 86400000;
  if (daysOut <= 3)  return 2 * 3600000;
  if (daysOut <= 14) return 6 * 3600000;
  return 12 * 3600000;
}

function cacheKey(origin, dest, date) {
  return `${origin}-${dest}-${date}`;
}

function getCached(key, ttl) {
  const entry = cache.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.storedAt;
  return { data: entry.data, fresh: age < ttl, age };
}

function setCache(key, data) {
  cache.set(key, { data, storedAt: Date.now() });
  // Evict old entries to prevent memory leaks (keep max 500 routes)
  if (cache.size > 500) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

// ── FETCH WITH TIMEOUT ────────────────────────────────────────────
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ── RETRY WITH EXPONENTIAL BACKOFF ────────────────────────────────
async function fetchWithRetry(url, attempts, baseMs) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
      if (res.ok || res.status < 500) return res;
      lastError = new Error(`SearchAPI returned ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (i < attempts - 1) {
      const delay = baseMs * Math.pow(3, i);   // 1s, 3s, 9s
      console.warn(`Retry ${i + 1}/${attempts - 1} in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// ── NORMALIZE SearchAPI.io RESPONSE → FLAT FLIGHTS ARRAY ─────────
function normalizeFlights(json) {
  const bestFlights  = json.best_flights  || [];
  const otherFlights = json.other_flights || [];

  return [...bestFlights, ...otherFlights].map(group => {
    const segs = group.flights || [];
    const first = segs[0];
    const last  = segs[segs.length - 1];
    if (!first) return null;

    const logoUrl = first.airline_logo || '';
    const codeMatch = logoUrl.match(/\/(\w{2})\.png/);
    const iataCode = codeMatch ? codeMatch[1] : '';

    const flightNumber = (first.flight_number || '').replace(/\s+/g, '');

    const depDate = first.departure_airport?.date || '';
    const depTime = first.departure_airport?.time || '';
    const arrDate = last.arrival_airport?.date || '';
    const arrTime = last.arrival_airport?.time || '';

    const totalMin = group.total_duration || 0;
    const durH = Math.floor(totalMin / 60);
    const durM = totalMin % 60;

    return {
      airline: iataCode,
      airlineName: first.airline || '',
      flightNumber,
      departureTime: depDate && depTime ? `${depDate}T${depTime}` : null,
      arrivalTime:   arrDate && arrTime ? `${arrDate}T${arrTime}` : null,
      price: group.price != null ? String(group.price) : null,
      currency: 'JPY',
      duration: `PT${durH}H${durM}M`,
      stops: segs.length > 1 ? segs.length - 1 : 0,
    };
  })
  .filter(f => f && f.price != null)
  .sort((a, b) => (a.departureTime || '').localeCompare(b.departureTime || ''));
}

// ── MAIN ENDPOINT ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

app.get('/api/flights', async (req, res) => {
  const { origin, destination, date } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Missing required params: origin, destination, date' });
  }

  const o = origin.toUpperCase();
  const d = destination.toUpperCase();
  const key = cacheKey(o, d, date);
  const ttl = getCacheTTL(date);

  // 1. Check cache — return immediately if fresh
  const cached = getCached(key, ttl);
  if (cached?.fresh) {
    const ageMin = Math.round(cached.age / 60000);
    console.log(`[CACHE HIT] ${key} — ${ageMin}m old, TTL ${ttl / 3600000}h`);
    return res.json({ ...cached.data, cached: true, cacheAgeMin: ageMin });
  }

  // 2. Call SearchAPI.io with retry + timeout
  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: o,
    arrival_id: d,
    outbound_date: date,
    flight_type: 'one_way',
    currency: 'JPY',
    hl: 'ja',
    gl: 'jp',
    adults: '1',
    included_airlines: 'JL,NH',
    api_key: SEARCH_API_KEY,
  });

  try {
    const apiRes = await fetchWithRetry(`${SEARCH_API_BASE}?${params}`, RETRY_ATTEMPTS, RETRY_BASE_MS);
    const json = await apiRes.json();

    if (json.error) {
      // API returned an error — serve stale cache if available
      if (cached) {
        console.warn(`[STALE FALLBACK] ${key} — API error: ${json.error}`);
        return res.json({ ...cached.data, cached: true, stale: true });
      }
      return res.status(502).json({ error: json.error });
    }

    const flights = normalizeFlights(json);
    const result = { flights, count: flights.length };

    // Store in cache
    setCache(key, result);
    console.log(`[API OK] ${key} — ${flights.length} flights, cached for ${ttl / 3600000}h`);

    res.json(result);
  } catch (err) {
    console.error(`[API FAIL] ${key} —`, err.message);

    // 3. Stale-while-revalidate: serve old cache if API is down
    if (cached) {
      const ageMin = Math.round(cached.age / 60000);
      console.warn(`[STALE FALLBACK] ${key} — serving ${ageMin}m old cache`);
      return res.json({ ...cached.data, cached: true, stale: true, cacheAgeMin: ageMin });
    }

    res.status(502).json({ error: 'Flight search unavailable. Please try again shortly.' });
  }
});

// ── CACHE STATS ENDPOINT (for monitoring) ─────────────────────────
app.get('/api/cache-stats', (_req, res) => {
  const entries = [];
  for (const [key, val] of cache) {
    entries.push({ route: key, ageMin: Math.round((Date.now() - val.storedAt) / 60000), flights: val.data.count });
  }
  res.json({ totalEntries: cache.size, entries });
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BTOS server running on http://localhost:${PORT}`);
  console.log(`Resilience: ${RETRY_ATTEMPTS} retries, ${REQUEST_TIMEOUT_MS / 1000}s timeout, smart TTL cache`);
});
