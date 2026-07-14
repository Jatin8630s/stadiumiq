/* ============================================================
   StadiumIQ 2026 — WebSocket Mock (Real-time Data Streams)
   Simulates live crowd, transport, incidents, sustainability
   ============================================================ */

const MockDataStreams = (() => {

  const subscribers = {};

  function subscribe(channel, callback) {
    if (!subscribers[channel]) subscribers[channel] = [];
    subscribers[channel].push(callback);
    return () => { subscribers[channel] = subscribers[channel].filter(cb => cb !== callback); };
  }

  function emit(channel, data) {
    (subscribers[channel] || []).forEach(cb => cb(data));
  }

  // ── Crowd Density Data ────────────────────────────────────
  const ZONES = [
    { id: 'gate-a', name: 'Gate A', x: 15, y: 45, capacity: 2400 },
    { id: 'gate-b', name: 'Gate B', x: 50, y: 10, capacity: 2200 },
    { id: 'gate-c', name: 'Gate C', x: 85, y: 45, capacity: 2600 },
    { id: 'gate-d', name: 'Gate D', x: 50, y: 80, capacity: 2000 },
    { id: 'concourse-n', name: 'N Concourse', x: 35, y: 25, capacity: 5000 },
    { id: 'concourse-s', name: 'S Concourse', x: 65, y: 70, capacity: 4800 },
    { id: 'food-1', name: 'Food Court 1', x: 25, y: 60, capacity: 1200 },
    { id: 'food-2', name: 'Food Court 2', x: 75, y: 35, capacity: 1100 },
    { id: 'first-aid', name: 'First Aid', x: 50, y: 50, capacity: 200 },
  ];

  let crowdState = ZONES.map(z => ({ ...z, current: Math.floor(z.capacity * (0.3 + Math.random() * 0.4)) }));

  function getCrowdLevel(pct) {
    if (pct < 0.5) return 'low';
    if (pct < 0.75) return 'medium';
    if (pct < 0.9) return 'high';
    return 'critical';
  }

  function updateCrowd() {
    crowdState = crowdState.map(z => {
      const delta = Math.floor((Math.random() - 0.45) * 150);
      const next = Math.max(50, Math.min(z.capacity, z.current + delta));
      const pct = next / z.capacity;
      return { ...z, current: next, pct, level: getCrowdLevel(pct) };
    });
    emit('crowd', { zones: crowdState, timestamp: new Date().toISOString() });
  }

  // ── Transport Data ────────────────────────────────────────
  const TRANSPORT = [
    { id: 'metro-3', name: 'Metro Line 3', icon: '🚇', type: 'metro', capacity: 800 },
    { id: 'shuttle-a', name: 'Shuttle Bus A', icon: '🚌', type: 'bus', capacity: 60 },
    { id: 'shuttle-b', name: 'Shuttle Bus B', icon: '🚌', type: 'bus', capacity: 60 },
    { id: 'rideshare', name: 'Rideshare Zone', icon: '🚗', type: 'ride', capacity: null },
    { id: 'taxi', name: 'Taxi Rank', icon: '🚕', type: 'taxi', capacity: 40 },
    { id: 'park-c', name: 'Park & Ride Lot C', icon: '🅿️', type: 'parking', capacity: 3200 },
  ];

  function updateTransport() {
    const data = TRANSPORT.map(t => ({
      ...t,
      waitMins: Math.floor(3 + Math.random() * 18),
      available: Math.random() > 0.15,
      surge: t.type === 'ride' ? (1.2 + Math.random() * 1.6).toFixed(1) : null,
      nextDeparture: t.type === 'metro' ? `${Math.floor(Math.random() * 9 + 1)} min` : null,
    }));
    emit('transport', { options: data, timestamp: new Date().toISOString() });
  }

  // ── Incidents ─────────────────────────────────────────────
  const INCIDENT_TYPES = [
    { type: 'medical', icon: '🏥', severity: 'critical', prefix: 'Medical emergency' },
    { type: 'crowd', icon: '👥', severity: 'warning', prefix: 'Crowd density alert' },
    { type: 'security', icon: '🛡️', severity: 'warning', prefix: 'Security check' },
    { type: 'maintenance', icon: '🔧', severity: 'info', prefix: 'Maintenance required' },
    { type: 'lost', icon: '🔍', severity: 'info', prefix: 'Lost item report' },
    { type: 'resolved', icon: '✅', severity: 'resolved', prefix: 'Incident resolved' },
  ];
  const LOCATIONS = ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Section 112', 'Section 106', 'Food Court 1', 'N Concourse', 'Player Tunnel'];
  let incidentCounter = 2840;

  function generateIncident() {
    const t = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    incidentCounter++;
    emit('incident', {
      id: `INC-${incidentCounter}`,
      ...t,
      location: loc,
      time: new Date().toLocaleTimeString(),
      description: `${t.prefix} reported at ${loc}. Staff notified. AI assessment in progress.`,
    });
  }

  // ── Sustainability Metrics ────────────────────────────────
  let sustainabilityBase = {
    energy: 720, water: 38000, waste: 18000, recycled: 15000,
    carbonTotal: 780, carbonTarget: 750,
    solarGen: 42,
  };

  function updateSustainability() {
    const data = {
      energy: { current: sustainabilityBase.energy + Math.floor(Math.random() * 30 - 10), target: 720, unit: 'MWh' },
      water:  { current: sustainabilityBase.water + Math.floor(Math.random() * 500 - 200), target: 45000, unit: 'L' },
      carbon: { current: sustainabilityBase.carbonTotal + Math.floor(Math.random() * 20 - 8), target: 750, unit: 't CO₂e' },
      recyclingRate: 72 + Math.floor(Math.random() * 10),
      solarGen: sustainabilityBase.solarGen + Math.floor(Math.random() * 5 - 2),
      timestamp: new Date().toISOString(),
    };
    emit('sustainability', data);
  }

  // ── Match Data ────────────────────────────────────────────
  const MATCH = {
    home: { name: 'Brazil', flag: '🇧🇷', code: 'BRA' },
    away: { name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
    venue: 'MetLife Stadium, New Jersey',
    kickoff: '18:00 ET',
  };
  let matchState = { homeScore: 1, awayScore: 1, minute: 54, phase: 'LIVE' };

  const EVENTS = [
    { minute: 55, type: 'goal', team: 'home', player: 'Vinicius Jr.' },
    { minute: 63, type: 'yellow', team: 'away', player: 'De Paul' },
    { minute: 67, type: 'goal', team: 'away', player: 'Messi' },
    { minute: 72, type: 'sub', team: 'home', player: 'Rodrygo → Endrick' },
    { minute: 80, type: 'goal', team: 'home', player: 'Endrick' },
    { minute: 87, type: 'var', team: null, player: null },
    { minute: 90, type: 'fulltime', team: null, player: null },
  ];
  let eventIdx = 0;

  function updateMatch() {
    matchState.minute = Math.min(90, matchState.minute + 1);
    const nextEvent = EVENTS[eventIdx];
    if (nextEvent && matchState.minute >= nextEvent.minute) {
      if (nextEvent.type === 'goal') {
        if (nextEvent.team === 'home') matchState.homeScore++;
        else matchState.awayScore++;
      }
      if (nextEvent.type === 'fulltime') matchState.phase = 'FT';
      emit('matchEvent', { ...nextEvent, ...matchState, match: MATCH });
      eventIdx++;
    }
    emit('match', { ...matchState, match: MATCH });
  }

  // ── Accessibility Requests ────────────────────────────────
  const A11Y_TYPES = [
    { need: 'Wheelchair escort to Section 108', icon: '♿', priority: 'high' },
    { need: 'Hearing loop assistance at Gate C', icon: '🦻', priority: 'medium' },
    { need: 'Visual impairment navigation help, Level 2', icon: '👁️', priority: 'high' },
    { need: 'Companion seating request, Section 114', icon: '🧑‍🦽', priority: 'medium' },
    { need: 'Elevator not working, Gate D', icon: '🛗', priority: 'high' },
    { need: 'Sign language interpreter needed, Info Desk', icon: '🤟', priority: 'low' },
  ];
  let a11yCounter = 100;

  function generateA11yRequest() {
    a11yCounter++;
    const req = A11Y_TYPES[Math.floor(Math.random() * A11Y_TYPES.length)];
    emit('accessibility', {
      id: `A11Y-${a11yCounter}`,
      ...req,
      time: new Date().toLocaleTimeString(),
      status: 'pending',
      fanName: ['Mohamed A.', 'Sarah K.', 'Jean-Pierre D.', 'Fatima R.', 'Kenji T.'][Math.floor(Math.random() * 5)],
    });
  }

  // ── Start All Streams ─────────────────────────────────────
  function startAll() {
    updateCrowd(); updateTransport(); updateSustainability(); updateMatch();
    
    setInterval(updateCrowd, 4000);
    setInterval(updateTransport, 7000);
    setInterval(updateSustainability, 10000);
    setInterval(updateMatch, 6000);
    setInterval(() => { if (Math.random() > 0.7) generateIncident(); }, 12000);
    setInterval(() => { if (Math.random() > 0.75) generateA11yRequest(); }, 18000);
  }

  return { subscribe, startAll, ZONES, TRANSPORT, MATCH };
})();

window.MockDataStreams = MockDataStreams;
