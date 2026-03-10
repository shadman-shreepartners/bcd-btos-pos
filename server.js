const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// SearchAPI.io key (NOT serpapi.com — they are different services)
const SEARCH_API_KEY = process.env.SEARCH_API_KEY || '3gCkrMcuACGyPvZ9PWYEgMFE';
const SEARCH_API_BASE = 'https://www.searchapi.io/api/v1/search';

app.use(express.static(path.join(__dirname)));

app.get('/api/flights', async (req, res) => {
  const { origin, destination, date } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Missing required params: origin, destination, date' });
  }

  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: origin.toUpperCase(),
    arrival_id: destination.toUpperCase(),
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
    const apiRes = await fetch(`${SEARCH_API_BASE}?${params}`);
    const json = await apiRes.json();

    if (json.error) {
      return res.status(502).json({ error: json.error });
    }

    const bestFlights  = json.best_flights  || [];
    const otherFlights = json.other_flights || [];
    const allGroups = [...bestFlights, ...otherFlights];

    // Normalize each flight group into the flat structure the frontend expects.
    // SearchAPI.io splits date/time into separate fields per the OpenAPI spec:
    //   departure_airport: { name, id, date: "YYYY-MM-DD", time: "HH:MM" }
    //   arrival_airport:   { name, id, date: "YYYY-MM-DD", time: "HH:MM" }
    const flights = allGroups.map(group => {
      const segs = group.flights || [];
      const first = segs[0];
      const last  = segs[segs.length - 1];
      if (!first) return null;

      // Extract IATA code from airline_logo URL (".../70px/NH.png" → "NH")
      const logoUrl = first.airline_logo || '';
      const codeMatch = logoUrl.match(/\/(\w{2})\.png/);
      const iataCode = codeMatch ? codeMatch[1] : '';

      const rawFlightNum = first.flight_number || '';
      const flightNumber = rawFlightNum.replace(/\s+/g, '');

      // Build ISO-ish timestamps from separate date + time fields
      const depDate = first.departure_airport?.date || '';
      const depTime = first.departure_airport?.time || '';
      const arrDate = last.arrival_airport?.date || '';
      const arrTime = last.arrival_airport?.time || '';
      const departureTime = depDate && depTime ? `${depDate}T${depTime}` : null;
      const arrivalTime   = arrDate && arrTime ? `${arrDate}T${arrTime}` : null;

      // total_duration is in minutes → convert to ISO 8601 for fmtDur()
      const totalMin = group.total_duration || 0;
      const durH = Math.floor(totalMin / 60);
      const durM = totalMin % 60;
      const duration = `PT${durH}H${durM}M`;

      const stops = segs.length > 1 ? segs.length - 1 : 0;

      return {
        airline: iataCode,
        airlineName: first.airline || '',
        flightNumber,
        departureTime,
        arrivalTime,
        price: group.price != null ? String(group.price) : null,
        currency: 'JPY',
        duration,
        stops,
      };
    }).filter(f => f && f.price != null);

    flights.sort((a, b) => (a.departureTime || '').localeCompare(b.departureTime || ''));

    res.json({ flights, count: flights.length });
  } catch (err) {
    console.error('SearchAPI request failed:', err);
    res.status(502).json({ error: 'SearchAPI request failed: ' + err.message });
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BTOS server running on http://localhost:${PORT}`);
});
