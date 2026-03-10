const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Duffel API — test mode token (returns Duffel Airways ZZ flights)
const DUFFEL_TOKEN = process.env.DUFFEL_TOKEN || 'duffel_test_Dixy1P-73aZbW2MIXv-Qvhy3ScDhZezil-Wh-igrQNk';
const DUFFEL_BASE  = 'https://api.duffel.com';

// ── RESILIENCE CONFIG ─────────────────────────────────────────────
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_MS  = 1000;
const REQUEST_TIMEOUT_MS = 30000;

// ── CACHE: in-memory, keyed by "ORIGIN-DEST-DATE" ────────────────
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
  if (cache.size > 500) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

// ── FETCH WITH TIMEOUT ────────────────────────────────────────────
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ── RETRY WITH EXPONENTIAL BACKOFF ────────────────────────────────
async function fetchWithRetry(url, options, attempts, baseMs) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetchWithTimeout(url, options, REQUEST_TIMEOUT_MS);
      if (res.ok || res.status < 500) return res;
      lastError = new Error(`Duffel returned ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (i < attempts - 1) {
      const delay = baseMs * Math.pow(3, i);
      console.warn(`Retry ${i + 1}/${attempts - 1} in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// ── NORMALIZE DUFFEL OFFERS → FLAT FLIGHTS ARRAY ─────────────────
function normalizeOffers(offers) {
  return offers.map(offer => {
    const slice = offer.slices?.[0];
    if (!slice) return null;

    const segs = slice.segments || [];
    const first = segs[0];
    const last  = segs[segs.length - 1];
    if (!first) return null;

    const iataCode    = first.marketing_carrier?.iata_code || '';
    const airlineName = first.marketing_carrier?.name || '';
    const flightNum   = first.marketing_carrier_flight_number || '';
    const flightNumber = `${iataCode}${flightNum}`;

    return {
      airline: iataCode,
      airlineName,
      flightNumber,
      departureTime: first.departing_at || null,
      arrivalTime:   last.arriving_at || null,
      price: offer.total_amount || null,
      currency: offer.total_currency || 'JPY',
      duration: slice.duration || null,
      stops: segs.length > 1 ? segs.length - 1 : 0,
      offerId: offer.id,
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

  // 1. Check cache
  const cached = getCached(key, ttl);
  if (cached?.fresh) {
    const ageMin = Math.round(cached.age / 60000);
    console.log(`[CACHE HIT] ${key} — ${ageMin}m old, TTL ${ttl / 3600000}h`);
    return res.json({ ...cached.data, cached: true, cacheAgeMin: ageMin });
  }

  // 2. Call Duffel Offer Requests API
  const body = {
    data: {
      slices: [{
        origin: o,
        destination: d,
        departure_date: date,
      }],
      passengers: [{ type: 'adult' }],
      cabin_class: 'economy',
    },
  };

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DUFFEL_TOKEN}`,
      'Duffel-Version': 'v2',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  };

  try {
    const apiRes = await fetchWithRetry(
      `${DUFFEL_BASE}/air/offer_requests?return_offers=true`,
      fetchOptions, RETRY_ATTEMPTS, RETRY_BASE_MS
    );
    const json = await apiRes.json();

    if (json.errors) {
      const errMsg = json.errors.map(e => e.message).join('; ');
      if (cached) {
        console.warn(`[STALE FALLBACK] ${key} — Duffel error: ${errMsg}`);
        return res.json({ ...cached.data, cached: true, stale: true });
      }
      return res.status(502).json({ error: errMsg });
    }

    const offers = json.data?.offers || [];
    const flights = normalizeOffers(offers);
    const result = { flights, count: flights.length };

    setCache(key, result);
    console.log(`[API OK] ${key} — ${flights.length} flights, cached for ${ttl / 3600000}h`);

    res.json(result);
  } catch (err) {
    console.error(`[API FAIL] ${key} —`, err.message);

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
  console.log(`Provider: Duffel API (${DUFFEL_TOKEN.startsWith('duffel_test_') ? 'TEST mode' : 'LIVE mode'})`);
  console.log(`Resilience: ${RETRY_ATTEMPTS} retries, ${REQUEST_TIMEOUT_MS / 1000}s timeout, smart TTL cache`);
});
