/* ============================================================
   StadiumIQ 2026 — Crowd Intelligence Module (Staff)
   Live heatmap, density forecast, AI alerts
   ============================================================ */

const CrowdIntelligence = (() => {

  let chartInstance = null;
  let historyData = [];
  let crowdZones = [];

  function init(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = buildUI();
    initChart();
    subscribeToData();
    setInterval(updateForecast, 15000);
  }

  function buildUI() {
    return `
    <div class="flex-col gap-6">

      <!-- KPI Summary -->
      <div class="kpi-grid">
        <div class="stat-card animate-fade-in-up delay-1">
          <div class="stat-value" id="total-fans" style="color:var(--accent-primary)">78,420</div>
          <div class="stat-label">Fans Inside</div>
          <div class="stat-delta up" id="fan-delta">↑ 2,100 in last 15min</div>
        </div>
        <div class="stat-card animate-fade-in-up delay-2">
          <div class="stat-value" id="capacity-pct" style="color:var(--accent-gold)">94%</div>
          <div class="stat-label">Capacity Used</div>
          <div class="stat-delta" id="capacity-status" style="color:var(--accent-gold)">↑ Near capacity</div>
        </div>
        <div class="stat-card animate-fade-in-up delay-3">
          <div class="stat-value" id="critical-zones" style="color:var(--accent-red)">2</div>
          <div class="stat-label">Critical Zones</div>
          <div class="stat-delta down" id="zone-delta">Gate 7 + N Concourse</div>
        </div>
        <div class="stat-card animate-fade-in-up delay-4">
          <div class="stat-value" id="gate-rate" style="color:var(--accent-green)">1,840</div>
          <div class="stat-label">Gate Flow/min</div>
          <div class="stat-delta up">↑ +240 vs avg</div>
        </div>
      </div>

      <!-- Heatmap Grid -->
      <div class="card">
        <div class="section-header">
          <div>
            <div class="section-title">🗺️ Live Crowd Heatmap</div>
            <div class="section-subtitle">Real-time density across all venue zones</div>
          </div>
          <div class="flex items-center gap-3">
            <div class="live-dot">Live</div>
            <div class="heatmap-legend">
              <div class="legend-gradient"></div>
              <span class="text-muted" style="font-size:11px">Low → Critical</span>
            </div>
          </div>
        </div>
        <div id="heatmap-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3)"></div>
      </div>

      <!-- Canvas Heatmap -->
      <div class="card">
        <div class="section-header">
          <div class="section-title">📊 Density Trend (Last 30 min)</div>
          <select class="lang-select" id="zone-select" style="width:auto">
            <option value="all">All Zones</option>
            <option value="gate-a">Gate A</option>
            <option value="gate-b">Gate B</option>
            <option value="concourse-n">N Concourse</option>
          </select>
        </div>
        <canvas id="density-chart" height="180"></canvas>
      </div>

      <!-- AI Alert Panel -->
      <div class="card" style="border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.05)">
        <div class="section-header">
          <div class="section-title">🤖 AI Crowd Alerts</div>
          <span class="badge badge-red badge-pulse">3 Active</span>
        </div>
        <div id="ai-alerts" class="flex-col gap-3"></div>
        <button class="btn btn-ghost btn-sm" style="margin-top:var(--space-4);width:100%" id="ask-ai-crowd">
          💬 Ask AI: "What should I do about Gate 7?"
        </button>
      </div>

      <!-- AI Decision Response -->
      <div id="crowd-ai-response" class="card" style="display:none;border:1px solid rgba(79,142,247,0.3)">
        <div class="flex gap-3 items-start">
          <div style="width:36px;height:36px;background:var(--grad-primary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🤖</div>
          <div>
            <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:var(--space-2)">StadiumIQ Decision Support</div>
            <div id="crowd-ai-text" style="font-size:var(--text-sm);line-height:1.7;color:var(--text-secondary)"></div>
          </div>
        </div>
      </div>

      <!-- Egress Simulator -->
      <div class="card">
        <div class="section-header">
          <div>
            <div class="section-title">🚪 Post-Match Egress Simulator</div>
            <div class="section-subtitle">AI models crowd dispersion scenarios</div>
          </div>
          <button class="btn btn-outline btn-sm" id="run-egress">▶ Run Simulation</button>
        </div>
        <div id="egress-result" style="display:none">
          <div class="alert alert-info" style="margin-top:var(--space-4)">
            <span class="alert-icon">📊</span>
            <div id="egress-text"></div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function subscribeToData() {
    if (!window.MockDataStreams) return;
    window.MockDataStreams.subscribe('crowd', data => {
      crowdZones = data.zones;
      updateHeatmapGrid(data.zones);
      updateKPIs(data.zones);
      updateChartData(data.zones);
    });
    window.MockDataStreams.subscribe('incident', incident => {
      if (['critical','warning'].includes(incident.severity)) {
        addAIAlert(incident);
      }
    });
  }

  function updateHeatmapGrid(zones) {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;
    grid.innerHTML = zones.map(z => `
      <div class="crowd-zone ${z.level}" style="padding:var(--space-3);min-height:70px;cursor:pointer" onclick="showZoneDetail('${z.id}')">
        <div style="font-weight:700;font-size:var(--text-xs);text-transform:uppercase;letter-spacing:0.05em">${z.name}</div>
        <div style="font-size:var(--text-xl);font-weight:800;margin:4px 0;font-family:'Orbitron',monospace">${Math.round(z.pct * 100)}%</div>
        <div style="font-size:10px;opacity:0.8">${z.current.toLocaleString()} / ${z.capacity.toLocaleString()}</div>
      </div>
    `).join('');
  }

  function updateKPIs(zones) {
    const totalFans = zones.reduce((a, z) => a + z.current, 0);
    const criticalCount = zones.filter(z => z.level === 'critical').length;
    const pct = Math.round((totalFans / zones.reduce((a, z) => a + z.capacity, 0)) * 100);

    const tf = document.getElementById('total-fans');
    const cp = document.getElementById('capacity-pct');
    const cz = document.getElementById('critical-zones');

    if (tf) tf.textContent = totalFans.toLocaleString();
    if (cp) { cp.textContent = `${pct}%`; cp.style.color = window.Utils.getStatusColor(pct / 100); }
    if (cz) { cz.textContent = criticalCount; cz.style.color = criticalCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)'; }
  }

  function updateChartData(zones) {
    const avgPct = zones.reduce((a, z) => a + z.pct, 0) / zones.length;
    historyData.push(Math.round(avgPct * 100));
    if (historyData.length > 30) historyData.shift();
    if (chartInstance) {
      chartInstance.data.labels = historyData.map((_, i) => `-${30 - i}m`);
      chartInstance.data.datasets[0].data = historyData;
      chartInstance.update('none');
    }
  }

  function initChart() {
    const canvas = document.getElementById('density-chart');
    if (!canvas || !window.Chart) return;
    historyData = Array.from({ length: 20 }, () => Math.floor(55 + Math.random() * 30));
    chartInstance = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels: historyData.map((_, i) => `-${20 - i}m`),
        datasets: [{
          label: 'Avg Crowd Density %',
          data: historyData,
          borderColor: '#4F8EF7',
          backgroundColor: 'rgba(79,142,247,0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        }, {
          label: 'Safe Threshold',
          data: historyData.map(() => 75),
          borderColor: 'rgba(249,115,22,0.6)',
          borderDash: [6, 3],
          pointRadius: 0,
          borderWidth: 1,
          fill: false,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#8B9DC3', font: { family: 'Inter', size: 11 } } } },
        scales: {
          x: { ticks: { color: '#4B5F8A', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { min: 0, max: 100, ticks: { color: '#4B5F8A', callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        }
      }
    });
  }

  let alertCount = 0;
  function addAIAlert(incident) {
    alertCount++;
    const panel = document.getElementById('ai-alerts');
    if (!panel) return;
    const alertEl = document.createElement('div');
    alertEl.className = 'incident-card animate-fade-in-up';
    alertEl.innerHTML = `
      <div class="incident-severity ${incident.severity}"></div>
      <div style="flex:1">
        <div class="flex items-center justify-between">
          <div style="font-weight:600;font-size:var(--text-sm)">${incident.icon} ${incident.type?.toUpperCase()} — ${incident.location}</div>
          <span style="font-size:10px;color:var(--text-muted)">${incident.time}</span>
        </div>
        <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">${incident.description}</div>
        <div class="flex gap-2" style="margin-top:var(--space-2)">
          <button class="btn btn-ghost btn-sm" style="font-size:10px">📋 View Draft</button>
          <button class="btn btn-ghost btn-sm" style="font-size:10px">✅ Resolve</button>
          <button class="btn btn-ghost btn-sm" style="font-size:10px">📡 Escalate</button>
        </div>
      </div>`;
    panel.prepend(alertEl);
    // Keep max 5 alerts visible
    while (panel.children.length > 5) panel.lastChild.remove();
  }

  // Pre-populate alerts
  function populateInitialAlerts() {
    const staticAlerts = [
      { icon: '🚨', type: 'crowd', severity: 'critical', location: 'Gate 7 + Gate 7B', time: '19:32', description: 'Density at 94% capacity. Overflow lane recommended. AI suggests opening Gate 7B immediately.' },
      { icon: '⚠️', type: 'crowd', severity: 'warning', location: 'North Concourse', time: '19:28', description: 'Predicted spike in 13 minutes. Pre-position 2 additional marshals at entry point.' },
      { icon: '🏥', type: 'medical', severity: 'critical', location: 'Section 106', time: '19:18', description: 'Medical team dispatched. Fan stabilized. Incident report auto-drafted.' },
    ];
    staticAlerts.forEach(a => addAIAlert(a));
  }

  async function askAICrowd() {
    const responseEl = document.getElementById('crowd-ai-response');
    const textEl = document.getElementById('crowd-ai-text');
    responseEl.style.display = 'block';
    textEl.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';

    const response = await window.GeminiClient.chat('staff', 'What should I do about Gate 7 congestion?');
    const words = response.split(' ');
    let rendered = '';
    textEl.innerHTML = '';
    for (const w of words) {
      rendered += (rendered ? ' ' : '') + w;
      textEl.innerHTML = window.Utils.renderMarkdown(rendered);
      await new Promise(r => setTimeout(r, 20));
    }
  }

  function runEgressSimulation() {
    const result = document.getElementById('egress-result');
    const text = document.getElementById('egress-text');
    result.style.display = 'block';
    text.innerHTML = '⏳ Running AI simulation...';
    setTimeout(() => {
      text.innerHTML = '<strong>Egress Simulation Complete</strong><br>With current gate configuration: 83,000 fans disperse in <strong>38 minutes</strong>.<br>If all gates open simultaneously: <strong>22 minutes</strong> (-42%).<br><br>Recommended: Open Gates A+C immediately post-whistle. Deploy 6 additional traffic marshals on metro path. Bus Route 7 dispatch at 90\'+2min for optimal loading.';
    }, 2000);
  }

  function updateForecast() {
    // Silently update forecast indicators
  }

  // Attach button events after DOM renders
  setTimeout(() => {
    document.getElementById('ask-ai-crowd')?.addEventListener('click', askAICrowd);
    document.getElementById('run-egress')?.addEventListener('click', runEgressSimulation);
    populateInitialAlerts();
  }, 500);

  return { init };
})();

window.CrowdIntelligence = CrowdIntelligence;
