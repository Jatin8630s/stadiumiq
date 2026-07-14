/* ============================================================
   StadiumIQ 2026 — Smart Transport Module (Fan-facing)
   AI departure advisor + live transport feeds
   ============================================================ */

const FanTransport = (() => {

  let transportData = [];
  let matchMinute = 54;
  let departureAdvisoryShown = false;

  function init(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = buildUI();
    attachEvents(el);
    subscribeToData();
    showAIDeparture(el);
  }

  function buildUI() {
    return `
    <div class="flex-col gap-6">

      <!-- AI Departure Advisor -->
      <div class="card" style="background:linear-gradient(135deg,rgba(79,142,247,0.08),rgba(124,58,237,0.05));border-color:rgba(79,142,247,0.3)">
        <div class="flex items-center gap-3" style="margin-bottom:var(--space-4)">
          <div style="width:44px;height:44px;background:var(--grad-primary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🤖</div>
          <div>
            <div style="font-weight:700;font-size:var(--text-md)">AI Departure Advisor</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">Personalized exit recommendation based on your transport + crowd data</div>
          </div>
        </div>

        <div id="departure-advisor" class="flex-col gap-4">
          <div class="animate-shimmer" style="height:60px;border-radius:var(--radius-md)"></div>
        </div>

        <div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid rgba(79,142,247,0.15)">
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-3)">🧳 Your preferences:</div>
          <div class="flex flex-wrap gap-2" id="pref-chips">
            ${['🚇 Metro preferred', '♿ Accessible route', '🏃 Fast exit', '🛍️ Stop at store', '🍺 After-match drinks'].map((p, i) => `
              <button class="quick-prompt-chip pref-chip ${i < 1 ? 'active-pref' : ''}" data-pref="${p}">${p}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Live Transport Options -->
      <div>
        <div class="section-header">
          <div class="section-title">🚦 Live Transport Status</div>
          <div class="live-dot">Updating</div>
        </div>
        <div id="transport-list" class="flex-col gap-3">
          ${[1,2,3,4,5].map(() => `<div class="animate-shimmer" style="height:76px;border-radius:var(--radius-lg)"></div>`).join('')}
        </div>
      </div>

      <!-- Ask AI about transport -->
      <div class="card">
        <div class="section-title" style="margin-bottom:var(--space-3)">💬 Ask AI about transport</div>
        <div class="flex gap-3">
          <input class="input flex-1" id="transport-query" placeholder='e.g. "When should I leave for the airport?"'>
          <button class="btn btn-primary" id="transport-ask">Ask</button>
        </div>
        <div id="transport-ai-reply" style="display:none;margin-top:var(--space-4);padding:var(--space-4);background:var(--glass-bg);border-radius:var(--radius-md);font-size:var(--text-sm);color:var(--text-secondary);line-height:1.7"></div>
      </div>

      <!-- Park & Ride -->
      <div class="card" style="background:rgba(34,197,94,0.04);border-color:rgba(34,197,94,0.2)">
        <div class="section-title" style="margin-bottom:var(--space-4)">🅿️ Park & Ride Updates</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3)">
          ${[
            { lot: 'Lot A', status: 'Full', pct: 100, color: 'var(--accent-red)' },
            { lot: 'Lot B', status: 'Limited', pct: 88, color: 'var(--accent-orange)' },
            { lot: 'Lot C', status: 'Your Lot', pct: 72, color: 'var(--accent-gold)' },
            { lot: 'Lot D', status: 'Available', pct: 45, color: 'var(--accent-green)' },
            { lot: 'Lot E', status: 'Open', pct: 31, color: 'var(--accent-green)' },
            { lot: 'Express', status: 'VIP', pct: 20, color: 'var(--accent-primary)' },
          ].map(l => `
            <div class="card card-sm" style="${l.lot === 'Lot C' ? 'border-color:rgba(245,166,35,0.4);background:rgba(245,166,35,0.05)' : ''}">
              <div style="font-weight:700;font-size:var(--text-sm)">${l.lot}</div>
              <div class="progress-bar" style="margin:var(--space-2) 0">
                <div class="progress-bar-fill" style="width:${l.pct}%;background:${l.color}"></div>
              </div>
              <div style="font-size:10px;color:${l.color};font-weight:600">${l.status}</div>
              <div style="font-size:10px;color:var(--text-muted)">${l.pct}% full</div>
            </div>
          `).join('')}
        </div>
        <div class="alert alert-info" style="margin-top:var(--space-4)">
          <span class="alert-icon">🤖</span>
          <div>AI Tip: <strong>Lot C egress predicted 35–45 min post-match.</strong> Wait 15 minutes inside the venue after the whistle — the lot clears 40% faster after the initial surge.</div>
        </div>
      </div>
    </div>

    <style>
    .active-pref { border-color: var(--accent-primary) !important; color: var(--accent-primary) !important; background: rgba(79,142,247,0.1) !important; }
    </style>`;
  }

  function showAIDeparture(container) {
    setTimeout(() => {
      const el = container.querySelector('#departure-advisor');
      if (!el) return;
      const minute = 67 + Math.floor(Math.random() * 15);
      el.innerHTML = `
        <div class="flex items-center gap-4">
          <div style="text-align:center;min-width:80px">
            <div style="font-family:'Orbitron',monospace;font-size:var(--text-3xl);font-weight:800;color:var(--accent-gold)">${minute}'</div>
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em">Leave at minute</div>
          </div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:4px">Recommended: Metro Line 3 via Gate C</div>
            <div style="font-size:var(--text-xs);color:var(--text-secondary)">Leave your seat at minute ${minute} to beat the post-match crowd. Next metro: 5 min walk. Next departure ~${minute + 8}' (match time). Beat 68% of egress traffic.</div>
          </div>
        </div>
        <div class="flex gap-2" style="flex-wrap:wrap">
          <span class="badge badge-green">🚇 Metro: 12 min wait</span>
          <span class="badge badge-orange">🚌 Shuttle: 22 min wait</span>
          <span class="badge badge-red">🚗 Rideshare: 1.8x surge</span>
        </div>`;
    }, 1500);
  }

  function renderTransportList(options) {
    const list = document.getElementById('transport-list');
    if (!list || !options.length) return;
    list.innerHTML = options.map(t => `
      <div class="transport-card" id="transport-${t.id}">
        <div class="transport-icon">${t.icon}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:var(--text-sm)">${t.name}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:3px">
            ${t.available ? `${t.nextDeparture ? `Next: ${t.nextDeparture}` : `Platform ready`}` : '⛔ Temporarily unavailable'}
          </div>
          ${t.surge ? `<span class="badge badge-red" style="margin-top:6px">Surge ${t.surge}x</span>` : ''}
        </div>
        <div style="text-align:right">
          ${t.available ? `
            <div class="transport-wait" style="color:${t.waitMins < 10 ? 'var(--accent-green)' : t.waitMins < 20 ? 'var(--accent-gold)' : 'var(--accent-red)'}">${t.waitMins}m</div>
            <div style="font-size:10px;color:var(--text-muted)">wait time</div>
          ` : `<div style="color:var(--accent-red);font-size:var(--text-xs)">Unavailable</div>`}
        </div>
      </div>
    `).join('');
  }

  function subscribeToData() {
    if (window.MockDataStreams) {
      window.MockDataStreams.subscribe('transport', data => {
        transportData = data.options;
        renderTransportList(data.options);
      });
      window.MockDataStreams.subscribe('match', data => {
        matchMinute = data.minute;
      });
    }
  }

  async function askTransportAI(query) {
    const replyEl = document.getElementById('transport-ai-reply');
    replyEl.style.display = 'block';
    replyEl.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    const response = await window.GeminiClient.chat('fan', query);
    const words = response.split(' ');
    let rendered = '';
    replyEl.innerHTML = '';
    for (const w of words) {
      rendered += (rendered ? ' ' : '') + w;
      replyEl.innerHTML = window.Utils.renderMarkdown(rendered);
      await new Promise(r => setTimeout(r, 22));
    }
  }

  function attachEvents(container) {
    container.querySelector('#transport-ask')?.addEventListener('click', () => {
      const q = container.querySelector('#transport-query')?.value;
      if (q?.trim()) askTransportAI(q);
    });
    container.querySelector('#transport-query')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = e.target.value;
        if (q.trim()) askTransportAI(q);
      }
    });
    container.querySelectorAll('.pref-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active-pref');
        window.Toast.info(`Preference updated: ${chip.dataset.pref}`);
      });
    });
  }

  return { init };
})();

window.FanTransport = FanTransport;
