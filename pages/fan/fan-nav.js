/* ============================================================
   StadiumIQ 2026 — Fan Navigation Module
   AI-powered wayfinding with crowd-aware routing
   ============================================================ */

const FanNav = (() => {

  let crowdData = null;
  let selectedDest = null;

  const SERVICES = window.VenueData?.metlifeMap?.services || [];
  const DESTINATIONS = [
    { id: 'my-seat', label: '🪑 My Seat', detail: 'Section 114, Row G, Seat 22', color: 'var(--accent-primary)' },
    { id: 'food-halal', label: '🥙 Halal Food Court', detail: 'Zone 3, Gate F — Ground Level', color: 'var(--accent-gold)' },
    { id: 'food-general', label: '🍔 Food Court 1', detail: 'North Concourse, Level 1', color: 'var(--accent-orange)' },
    { id: 'restroom', label: '🚻 Restroom', detail: '40m ahead, Level 2 — 2 min wait', color: 'var(--accent-cyan)' },
    { id: 'first-aid', label: '🏥 First Aid', detail: 'Gate B, Level 1', color: 'var(--accent-red)' },
    { id: 'fan-zone', label: '⚽ Fan Zone', detail: 'Level 1, Gates A–C, Entry Free', color: 'var(--accent-green)' },
    { id: 'atm', label: '💳 ATM / Cash', detail: 'Gate A, Level 1 — 0 min wait', color: 'var(--accent-purple)' },
    { id: 'store', label: '🛍️ FIFA Fan Store', detail: 'Gate A Mega Store, Level 1', color: 'var(--accent-pink)' },
    { id: 'prayer', label: '🕌 Prayer Room', detail: 'Level 3, Section 225', color: 'var(--accent-gold)' },
    { id: 'exit-metro', label: '🚇 Metro Exit', detail: 'Gate C South, Metro Line 3', color: 'var(--accent-cyan)' },
  ];

  // Directions database
  const DIRECTIONS = {
    'my-seat': [
      { step: 1, icon: '🚪', text: 'Enter through Gate C (your nearest gate)' },
      { step: 2, icon: '⬆️', text: 'Take escalator up to Level 2' },
      { step: 3, icon: '➡️', text: 'Turn right, follow blue wayfinding lights' },
      { step: 4, icon: '🪑', text: 'Section 114 on your right — Row G, Seat 22' },
    ],
    'food-halal': [
      { step: 1, icon: '🚪', text: 'Head to Gate F (South Concourse)' },
      { step: 2, icon: '⬇️', text: 'Take stairs or elevator to Ground Level' },
      { step: 3, icon: '🥙', text: 'Food Zone 3 — halal counter at the far end' },
    ],
    'first-aid': [
      { step: 1, icon: '⚠️', text: 'Alert any volunteer immediately (orange vest)' },
      { step: 2, icon: '🚪', text: 'Nearest station: Gate B, Level 1' },
      { step: 3, icon: '🏥', text: 'Medical team on duty 24/7 during match' },
    ],
    'exit-metro': [
      { step: 1, icon: '📍', text: 'Head to Gate C (follow green exit signs)' },
      { step: 2, icon: '⬇️', text: 'Ground level — exit via South Plaza' },
      { step: 3, icon: '🚇', text: 'Metro Station entrance: 200m, follow signage' },
      { step: 4, icon: '🎫', text: 'Metro Line 3 — departures every 6 min post-match' },
    ],
  };

  function init(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = buildUI();
    attachEvents(el);
    subscribeToData();
  }

  function buildUI() {
    return `
    <div class="flex-col gap-6">
      <!-- Venue Map -->
      <div class="map-container" style="height:280px">
        <canvas id="venue-canvas" width="100%" style="width:100%;height:280px;border-radius:var(--radius-lg)"></canvas>
        <div class="map-overlay-btn">
          <button class="btn btn-ghost btn-sm" id="toggle-crowd">👥 Crowd</button>
          <button class="btn btn-ghost btn-sm" id="toggle-a11y">♿ Accessible</button>
        </div>
        <div style="position:absolute;bottom:var(--space-3);left:var(--space-3);display:flex;align-items:center;gap:var(--space-3)">
          <div class="heatmap-legend">
            <span style="color:var(--text-muted);font-size:11px">Crowd:</span>
            <div class="legend-gradient"></div>
            <span style="color:var(--text-muted);font-size:11px">Low → Critical</span>
          </div>
        </div>
      </div>

      <!-- Search Destination -->
      <div>
        <div class="section-header">
          <div>
            <div class="section-title">🧭 Where to?</div>
            <div class="section-subtitle">AI selects the least-crowded route</div>
          </div>
          <span class="badge badge-green badge-pulse">Crowd-aware</span>
        </div>
        <div class="input-group" style="margin-bottom:var(--space-4)">
          <span class="input-icon">🔍</span>
          <input class="input" id="dest-search" placeholder="Search: seat, food, restroom, exit...">
        </div>
        <div id="dest-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:var(--space-3)">
          ${DESTINATIONS.map(d => `
            <button class="card card-sm dest-btn" id="dest-${d.id}" data-id="${d.id}" style="text-align:left;cursor:pointer;border:none;width:100%">
              <div style="font-size:20px;margin-bottom:4px">${d.label.split(' ')[0]}</div>
              <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary)">${d.label.split(' ').slice(1).join(' ')}</div>
              <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">${d.detail}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Route Panel (hidden by default) -->
      <div id="route-panel" class="card" style="display:none;border:1px solid rgba(79,142,247,0.3)">
        <div class="flex items-center justify-between" style="margin-bottom:var(--space-4)">
          <div>
            <div class="section-title" id="route-title">Route</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px" id="route-eta">ETA: Calculating...</div>
          </div>
          <div class="flex gap-2">
            <span class="badge badge-green" id="route-crowd-badge">Low crowd</span>
            <button class="btn btn-ghost btn-sm" id="close-route">✕</button>
          </div>
        </div>
        <div id="route-steps" class="flex-col gap-3"></div>
        <div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--glass-border)">
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-2)">🤖 AI Notes:</div>
          <div id="ai-route-note" style="font-size:var(--text-sm);color:var(--text-secondary)"></div>
        </div>
      </div>

      <!-- Accessibility Mode -->
      <div class="card" style="background:rgba(79,142,247,0.05);border-color:rgba(79,142,247,0.2)">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span style="font-size:24px">♿</span>
            <div>
              <div style="font-weight:600;font-size:var(--text-sm)">Accessibility Mode</div>
              <div style="font-size:var(--text-xs);color:var(--text-muted)">Elevator-first routing • Wider paths • AI escort request</div>
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="a11y-toggle">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div id="a11y-panel" style="display:none;margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid rgba(79,142,247,0.2)">
          <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-3)">Select your accessibility need:</div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">
            ${['♿ Wheelchair', '🦻 Hearing', '👁️ Visual', '👶 Stroller', '🩺 Medical'].map(n =>
              `<button class="quick-prompt-chip a11y-need" data-need="${n}">${n}</button>`
            ).join('')}
          </div>
          <button class="btn btn-primary btn-sm" style="margin-top:var(--space-3);width:100%" id="request-escort">
            🤝 Request AI-Matched Escort
          </button>
        </div>
      </div>
    </div>

    <style>
    .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; inset: 0; cursor: pointer;
      background: var(--bg-raised); border-radius: 24px;
      transition: var(--transition-base);
    }
    .toggle-slider::before {
      content: ''; position: absolute; height: 16px; width: 16px;
      left: 4px; bottom: 4px; background: var(--text-muted);
      border-radius: 50%; transition: var(--transition-base);
    }
    input:checked + .toggle-slider { background: var(--accent-primary); }
    input:checked + .toggle-slider::before { transform: translateX(20px); background: #fff; }
    </style>`;
  }

  function showRoute(destId) {
    const dest = DESTINATIONS.find(d => d.id === destId);
    const steps = DIRECTIONS[destId] || [
      { step: 1, icon: '📍', text: 'Follow stadium signage to your destination' },
      { step: 2, icon: '❓', text: 'Ask any volunteer (orange vest) for assistance' },
    ];
    const panel = document.getElementById('route-panel');
    const title = document.getElementById('route-title');
    const eta = document.getElementById('route-eta');
    const stepsEl = document.getElementById('route-steps');
    const note = document.getElementById('ai-route-note');
    const crowdBadge = document.getElementById('route-crowd-badge');

    title.textContent = dest?.label || 'Route';
    eta.textContent = `ETA: ${2 + Math.floor(Math.random() * 6)} minutes • Crowd-optimized route`;
    crowdBadge.textContent = ['Low crowd', 'Medium crowd', 'Best route available'][Math.floor(Math.random() * 3)];

    stepsEl.innerHTML = steps.map(s => `
      <div class="flex gap-3 items-start animate-fade-in-up delay-${s.step}">
        <div style="width:32px;height:32px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">${s.icon}</div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--text-muted)">Step ${s.step}</div>
          <div style="font-size:var(--text-sm);font-weight:500">${s.text}</div>
        </div>
      </div>
    `).join('');

    note.innerHTML = `AI rerouted via ${['Gate C', 'North Concourse', 'South ramp'][Math.floor(Math.random() * 3)]} to avoid <strong style="color:var(--accent-orange)">high-density zone</strong> near Gate A. Route updated 30 seconds ago.`;

    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function attachEvents(container) {
    container.querySelectorAll('.dest-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.dest-btn').forEach(b => b.style.borderColor = '');
        btn.style.borderColor = 'var(--accent-primary)';
        btn.style.boxShadow = 'var(--shadow-glow-blue)';
        showRoute(btn.dataset.id);
      });
    });

    document.getElementById('close-route')?.addEventListener('click', () => {
      document.getElementById('route-panel').style.display = 'none';
    });

    const a11yToggle = document.getElementById('a11y-toggle');
    a11yToggle?.addEventListener('change', () => {
      const panel = document.getElementById('a11y-panel');
      panel.style.display = a11yToggle.checked ? 'block' : 'none';
      if (a11yToggle.checked) window.Toast.info('♿ Accessibility mode ON — routes updated');
    });

    document.getElementById('request-escort')?.addEventListener('click', () => {
      window.Toast.success('✅ Escort requested! A volunteer will meet you within 3 minutes.');
    });

    const search = document.getElementById('dest-search');
    search?.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('.dest-btn').forEach(btn => {
        btn.style.display = btn.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    drawVenueMap();
  }

  function subscribeToData() {
    if (window.MockDataStreams) {
      window.MockDataStreams.subscribe('crowd', data => {
        crowdData = data;
        updateMapWithCrowd(data);
      });
    }
  }

  function drawVenueMap() {
    const canvas = document.getElementById('venue-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 500;
    canvas.height = 280;
    drawStadiumBase(ctx, canvas.width, canvas.height);
  }

  function drawStadiumBase(ctx, w, h) {
    // Background
    ctx.fillStyle = '#0D1526';
    ctx.fillRect(0, 0, w, h);

    // Pitch
    const cx = w / 2, cy = h / 2;
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(cx - 120, cy - 70, 240, 140);
    ctx.strokeStyle = '#2a5a2a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 120, cy - 70, 240, 140);
    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#2a5a2a';
    ctx.stroke();
    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3a7a3a';
    ctx.fill();

    // Stadium oval
    ctx.beginPath();
    ctx.ellipse(cx, cy, 175, 110, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(79,142,247,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Seating areas
    const stands = [
      { label: 'North Stand', x: cx, y: cy - 90 },
      { label: 'South Stand', x: cx, y: cy + 90 },
      { label: 'East Stand', x: cx + 160, y: cy },
      { label: 'West Stand', x: cx - 160, y: cy },
    ];
    stands.forEach(s => {
      ctx.font = '9px Inter';
      ctx.fillStyle = 'rgba(139,157,195,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, s.x, s.y);
    });

    // Gate markers
    const gates = [
      { label: 'Gate A', x: cx - 190, y: cy, color: '#4F8EF7' },
      { label: 'Gate B', x: cx, y: cy - 125, color: '#22C55E' },
      { label: 'Gate C', x: cx + 190, y: cy, color: '#F5A623' },
      { label: 'Gate D', x: cx, y: cy + 125, color: '#EC4899' },
    ];
    gates.forEach(g => {
      ctx.beginPath();
      ctx.arc(g.x, g.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = g.color;
      ctx.fill();
      ctx.font = 'bold 10px Inter';
      ctx.fillStyle = g.color;
      ctx.textAlign = 'center';
      const offset = g.y > cy ? 18 : -12;
      ctx.fillText(g.label, g.x, g.y + offset);
    });

    // User location marker
    ctx.beginPath();
    ctx.arc(cx + 120, cy + 40, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#4F8EF7';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 120, cy + 40, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(79,142,247,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 10px Inter';
    ctx.fillStyle = '#4F8EF7';
    ctx.fillText('You', cx + 120, cy + 57);
  }

  function updateMapWithCrowd(data) {
    const canvas = document.getElementById('venue-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 500;
    canvas.height = 280;
    drawStadiumBase(ctx, canvas.width, canvas.height);

    const cx = canvas.width / 2, cy = canvas.height / 2;
    data.zones.forEach(z => {
      const x = cx + (z.x / 100 - 0.5) * 380;
      const y = cy + (z.y / 100 - 0.5) * 220;
      const colors = { low: 'rgba(34,197,94,0.3)', medium: 'rgba(245,166,35,0.35)', high: 'rgba(249,115,22,0.45)', critical: 'rgba(239,68,68,0.55)' };
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = colors[z.level] || colors.low;
      ctx.fill();
    });
  }

  return { init };
})();

window.FanNav = FanNav;
