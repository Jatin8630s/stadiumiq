/* ============================================================
   StadiumIQ 2026 — Organizer Decision Support Module
   AI Situation Room + Decision Engine + Sustainability
   ============================================================ */

const DecisionSupport = (() => {

  let sustainChart = null;
  let sustainData = { energy: [], water: [], carbon: [] };
  const MAX_POINTS = 20;

  function init(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = buildUI();
    initSustainChart();
    subscribeToData();
    populateRunsheet();
  }

  function buildUI() {
    return `
    <div class="flex-col gap-6">

      <!-- Situation Room KPIs -->
      <div>
        <div class="flex items-center justify-between" style="margin-bottom:var(--space-4)">
          <div>
            <h3 style="font-family:'Orbitron',monospace;letter-spacing:0.04em">🎯 Situation Room</h3>
            <div style="color:var(--text-muted);font-size:var(--text-sm)">MetLife Stadium · Brazil vs Argentina · Match Day 3</div>
          </div>
          <div class="live-dot">Live</div>
        </div>
        <div class="kpi-grid">
          ${[
            { id: 'kpi-fans', label: 'Fans Inside', val: '83,240', sub: '98% capacity', color: 'var(--accent-primary)' },
            { id: 'kpi-incidents', label: 'Open Incidents', val: '4', sub: '1 critical', color: 'var(--accent-red)' },
            { id: 'kpi-transport', label: 'Transport Load', val: '74%', sub: 'Metro: 91% full', color: 'var(--accent-gold)' },
            { id: 'kpi-carbon', label: 'Carbon Today', val: '847t', sub: '+12% vs target', color: 'var(--accent-orange)' },
            { id: 'kpi-nps', label: 'Fan NPS', val: '82', sub: '▲ +5 vs last match', color: 'var(--accent-green)' },
            { id: 'kpi-response', label: 'Response Time', val: '3.2m', sub: 'Medical avg', color: 'var(--accent-cyan)' },
          ].map(k => `
            <div class="stat-card animate-fade-in-up">
              <div class="stat-value" id="${k.id}" style="color:${k.color}">${k.val}</div>
              <div class="stat-label">${k.label}</div>
              <div style="font-size:10px;color:var(--text-muted);margin-top:4px">${k.sub}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AI Decision Support Chat -->
      <div class="card" style="border-color:rgba(245,166,35,0.25);background:rgba(245,166,35,0.03)">
        <div class="section-header">
          <div>
            <div class="section-title">🤖 AI Decision Support</div>
            <div class="section-subtitle">Ask about any operational situation — get ranked action options</div>
          </div>
          <span class="badge badge-gold">Command AI</span>
        </div>

        <div id="decision-chat" style="max-height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:var(--space-3);margin-bottom:var(--space-4)">
          <!-- Pre-seeded decision context -->
          <div class="chat-message ai">
            <div class="chat-avatar ai-avatar">🤖</div>
            <div class="chat-bubble ai">
              <span class="bubble-text">Welcome to <strong>StadiumIQ Command</strong>. I'm monitoring all live data streams. Current status: <span style="color:var(--accent-orange)">2 zones at high density</span>, 4 open incidents, carbon slightly above target.<br><br>Ask me anything: "What should I prioritize right now?" or "Model tonight's egress"</span>
              <span class="bubble-time">Now</span>
            </div>
          </div>
        </div>

        <!-- Quick Decision Queries -->
        <div class="flex flex-wrap gap-2" style="margin-bottom:var(--space-3)">
          ${[
            '⚠️ What's the top risk right now?',
            '🚪 Gate 7 situation?',
            '🚌 Transport readiness?',
            '🌱 Sustainability status?',
            '📊 Generate match-day report',
          ].map(q => `<button class="quick-prompt-chip decision-query" data-q="${q}">${q}</button>`).join('')}
        </div>

        <div class="flex gap-3">
          <input class="input flex-1" id="decision-input" placeholder="Ask StadiumIQ Command anything...">
          <button class="btn btn-gold" id="decision-send">➤ Ask AI</button>
        </div>
      </div>

      <!-- Decision Options Panel -->
      <div id="decision-options" style="display:none" class="card">
        <div class="section-title" style="margin-bottom:var(--space-4)">📊 AI Decision Options</div>
        <div id="decision-options-list" class="flex-col gap-3"></div>
        <div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--glass-border)">
          <div class="flex gap-3">
            <button class="btn btn-primary" id="approve-decision">✅ Approve Top Option</button>
            <button class="btn btn-ghost" id="log-decision">📋 Log Decision</button>
          </div>
        </div>
      </div>

      <!-- Sustainability Dashboard -->
      <div class="card">
        <div class="section-header">
          <div>
            <div class="section-title">🌱 Sustainability Intelligence</div>
            <div class="section-subtitle">Live environmental metrics · AI-monitored</div>
          </div>
          <button class="btn btn-green btn-sm" id="gen-sustain-report">📄 Generate Report</button>
        </div>

        <!-- Metric Rings -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-4);margin-bottom:var(--space-5)">
          ${[
            { id: 'energy-ring', label: 'Energy', current: 847, target: 720, unit: 'MWh', color: '#F97316', icon: '⚡' },
            { id: 'water-ring', label: 'Water', current: 38, target: 45, unit: 'k Litres', color: '#06B6D4', icon: '💧' },
            { id: 'recycle-ring', label: 'Recycling', current: 78, target: 70, unit: '%', color: '#22C55E', icon: '♻️' },
          ].map(m => {
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));
            const r = 40, circ = 2 * Math.PI * r;
            const dash = (pct / 100) * circ;
            return `
            <div style="text-align:center">
              <div class="sustainability-ring">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
                  <circle cx="50" cy="50" r="${r}" fill="none" stroke="${m.color}" stroke-width="8"
                    stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
                    stroke-linecap="round" style="transition:stroke-dasharray 1s ease"/>
                </svg>
                <div class="sustainability-ring-label">
                  <div style="font-size:18px">${m.icon}</div>
                  <div style="font-size:11px;font-weight:700;font-family:'Orbitron',monospace;color:${m.color}">${pct}%</div>
                </div>
              </div>
              <div style="font-size:var(--text-xs);font-weight:600;margin-top:var(--space-2)">${m.label}</div>
              <div style="font-size:10px;color:var(--text-muted)">${m.current} / ${m.target} ${m.unit}</div>
              <div style="font-size:10px;margin-top:2px;color:${pct > 100 ? 'var(--accent-red)' : 'var(--accent-green)'}">${pct > 100 ? '▲ Over target' : '✓ On track'}</div>
            </div>`;
          }).join('')}
        </div>

        <canvas id="sustain-chart" height="160"></canvas>

        <div id="sustain-ai-note" class="alert alert-warning" style="margin-top:var(--space-4)">
          <span class="alert-icon">🤖</span>
          <div><strong>AI Insight:</strong> Energy consumption 18% above target due to LED Zone 4 fault. Dimming unoccupied sections could save 2.3t CO₂e tonight. Maintenance alert has been drafted.</div>
        </div>

        <div id="sustain-report" style="display:none;margin-top:var(--space-4)">
          <div style="background:var(--bg-surface);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:var(--space-4)">
            <div style="font-size:var(--text-xs);color:var(--accent-green);font-weight:600;text-transform:uppercase;margin-bottom:var(--space-3)">📄 AI-Generated Sustainability Report</div>
            <div id="sustain-report-text" style="font-size:var(--text-sm);line-height:1.8;color:var(--text-secondary)"></div>
          </div>
        </div>
      </div>

      <!-- Match-Day Runsheet -->
      <div class="card">
        <div class="section-header">
          <div class="section-title">📋 Match-Day Runsheet</div>
          <span class="badge badge-orange badge-pulse">3 Gaps Found</span>
        </div>
        <div id="runsheet" class="flex-col gap-2"></div>
      </div>

    </div>`;
  }

  const RUNSHEET_ITEMS = [
    { time: '16:00', task: 'Gates Open — All staff positions confirmed', status: 'done', assignee: 'Gate Supervisors', gap: false },
    { time: '17:00', task: 'Transport activation — Bus Routes A–F dispatch', status: 'done', assignee: 'Transport Lead', gap: false },
    { time: '18:00', task: 'Kick-off — CCTV monitoring activated', status: 'active', assignee: 'Security Ops', gap: false },
    { time: '19:30', task: 'Bus Route 7 dispatch confirmation', status: 'gap', assignee: 'Unassigned', gap: true, gapNote: 'No confirmation logged. Action needed by 18:45' },
    { time: '19:45', task: 'Halftime concession restocking', status: 'pending', assignee: 'F&B Supervisor', gap: false },
    { time: '20:00', task: 'Post-match sustainability report window', status: 'gap', assignee: 'Unassigned', gap: true, gapNote: 'Carbon meter sync not configured' },
    { time: '20:15', task: 'Post-match egress — Metro coordination call', status: 'pending', assignee: 'Transport Lead', gap: false },
    { time: '21:30', task: 'Media zone clearance protocol', status: 'gap', assignee: 'Unassigned', gap: true, gapNote: 'No responsible officer assigned' },
    { time: '22:00', task: 'Venue close-down checklist', status: 'pending', assignee: 'Venue Manager', gap: false },
  ];

  function populateRunsheet() {
    const el = document.getElementById('runsheet');
    if (!el) return;
    el.innerHTML = RUNSHEET_ITEMS.map(item => `
      <div class="flex items-center gap-3 ${item.gap ? 'incident-card' : 'card card-sm'}" style="${item.gap ? 'border-left-color:var(--accent-red);background:rgba(239,68,68,0.05)' : ''}">
        <div style="font-family:'Orbitron',monospace;font-size:var(--text-xs);color:var(--text-muted);width:40px;flex-shrink:0">${item.time}</div>
        <div style="flex:1">
          <div style="font-size:var(--text-sm);font-weight:${item.gap ? '600' : '400'};color:${item.gap ? 'var(--accent-red)' : 'var(--text-primary)'}">${item.task}</div>
          ${item.gap ? `<div style="font-size:10px;color:var(--accent-orange);margin-top:3px">⚠️ ${item.gapNote}</div>` : ''}
          <div style="font-size:10px;color:var(--text-muted)">${item.assignee}</div>
        </div>
        <span class="badge ${item.status === 'done' ? 'badge-green' : item.status === 'active' ? 'badge-blue badge-pulse' : item.status === 'gap' ? 'badge-red' : 'badge-purple'}">
          ${item.status === 'done' ? '✓ Done' : item.status === 'active' ? '⬤ Active' : item.status === 'gap' ? '⚠ Gap' : 'Pending'}
        </span>
      </div>
    `).join('');
  }

  function initSustainChart() {
    const canvas = document.getElementById('sustain-chart');
    if (!canvas || !window.Chart) return;

    const labels = Array.from({ length: MAX_POINTS }, (_, i) => `-${MAX_POINTS - i}m`);
    sustainData.energy = Array.from({ length: MAX_POINTS }, () => 700 + Math.random() * 200);
    sustainData.carbon  = Array.from({ length: MAX_POINTS }, () => 720 + Math.random() * 160);

    sustainChart = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Energy (MWh)', data: sustainData.energy, borderColor: '#F97316', backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.4 },
          { label: 'Carbon (t CO₂e)', data: sustainData.carbon, borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.05)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.4 },
          { label: 'Energy Target', data: Array(MAX_POINTS).fill(720), borderColor: 'rgba(249,115,22,0.3)', borderDash: [5,3], pointRadius: 0, borderWidth: 1, fill: false },
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#8B9DC3', font: { family: 'Inter', size: 11 } } } },
        scales: {
          x: { ticks: { color: '#4B5F8A', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#4B5F8A' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        }
      }
    });
  }

  function subscribeToData() {
    if (!window.MockDataStreams) return;
    window.MockDataStreams.subscribe('sustainability', data => {
      if (sustainChart) {
        sustainData.energy.push(data.energy.current);
        sustainData.energy.shift();
        sustainData.carbon.push(data.carbon.current);
        sustainData.carbon.shift();
        sustainChart.data.datasets[0].data = sustainData.energy;
        sustainChart.data.datasets[1].data = sustainData.carbon;
        sustainChart.update('none');
      }
    });

    window.MockDataStreams.subscribe('match', data => {
      const el = document.getElementById('kpi-fans');
      if (el) el.textContent = (78000 + data.minute * 80).toLocaleString();
    });
  }

  async function sendDecisionQuery(query) {
    const chat = document.getElementById('decision-chat');
    const optionsPanel = document.getElementById('decision-options');
    const optionsList = document.getElementById('decision-options-list');

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML = `<div class="chat-avatar user-avatar">👤</div><div class="chat-bubble user"><span class="bubble-text">${query}</span></div>`;
    chat.appendChild(userMsg);

    // Add typing
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message ai';
    typingMsg.id = 'dec-typing';
    typingMsg.innerHTML = `<div class="chat-avatar ai-avatar">🤖</div><div class="chat-bubble ai"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    chat.appendChild(typingMsg);
    chat.scrollTop = 9999;

    const response = await window.GeminiClient.chat('organizer', query);
    document.getElementById('dec-typing')?.remove();

    // Add AI response
    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-message ai';
    aiMsg.innerHTML = `<div class="chat-avatar ai-avatar">🤖</div><div class="chat-bubble ai"><span class="bubble-text">${window.Utils.renderMarkdown(response)}</span><span class="bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>`;
    chat.appendChild(aiMsg);
    chat.scrollTop = 9999;

    // Show decision options if response has options
    if (response.includes('Option') || response.includes('option')) {
      showDecisionOptions(response);
    }
  }

  function showDecisionOptions(responseText) {
    const panel = document.getElementById('decision-options');
    const list = document.getElementById('decision-options-list');
    panel.style.display = 'block';

    const options = [
      { rank: 1, title: 'Open Gate 12B + Deploy 3 scanners', confidence: 94, impact: 'High', effort: 'Low', detail: 'Immediately increases capacity by 34%. Staff reallocation only, no additional resources needed.' },
      { rank: 2, title: 'PA redirect announcement to Gate 11', confidence: 87, impact: 'Medium', effort: 'Very Low', detail: 'Expected 40% fan diversion. Works best combined with Option 1 for 8-minute resolution.' },
      { rank: 3, title: 'Dynamic signage update only', confidence: 72, impact: 'Low', effort: 'Very Low', detail: 'Slower compliance. ~25% diversion. Best used as supplement to other options.' },
    ];

    list.innerHTML = options.map(o => `
      <div class="decision-option">
        <div class="decision-rank">${o.rank}</div>
        <div style="flex:1">
          <div class="flex items-center justify-between">
            <div style="font-weight:600;font-size:var(--text-sm)">${o.title}</div>
            <div class="flex gap-2">
              <span class="badge badge-blue">${o.impact} Impact</span>
              <span class="badge badge-green">${o.effort} Effort</span>
            </div>
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-secondary);margin:var(--space-2) 0">${o.detail}</div>
          <div style="display:flex;align-items:center;gap:var(--space-2)">
            <div class="confidence-bar" style="flex:1"><div class="confidence-fill" style="width:${o.confidence}%"></div></div>
            <span style="font-size:10px;color:var(--text-muted)">${o.confidence}% confidence</span>
          </div>
        </div>
      </div>
    `).join('');

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function generateSustainReport() {
    const panel = document.getElementById('sustain-report');
    const text = document.getElementById('sustain-report-text');
    panel.style.display = 'block';
    text.innerHTML = '<div class="animate-shimmer" style="height:120px;border-radius:8px"></div>';
    const report = await window.GeminiClient.generateReport('sustainability', { match: 3 });
    text.innerHTML = window.Utils.renderMarkdown(report);
    panel.scrollIntoView({ behavior: 'smooth' });
  }

  // Wire up events after DOM renders
  setTimeout(() => {
    document.getElementById('decision-send')?.addEventListener('click', () => {
      const input = document.getElementById('decision-input');
      if (input?.value.trim()) { sendDecisionQuery(input.value); input.value = ''; }
    });
    document.getElementById('decision-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const input = e.target; if (input.value.trim()) { sendDecisionQuery(input.value); input.value = ''; } }
    });
    document.querySelectorAll('.decision-query').forEach(btn => {
      btn.addEventListener('click', () => sendDecisionQuery(btn.dataset.q));
    });
    document.getElementById('gen-sustain-report')?.addEventListener('click', generateSustainReport);
    document.getElementById('approve-decision')?.addEventListener('click', () => {
      window.Toast.success('✅ Decision Option 1 approved and dispatched to Gate Supervisor');
    });
    document.getElementById('log-decision')?.addEventListener('click', () => {
      window.Toast.info('📋 Decision logged to audit trail');
    });
  }, 600);

  return { init };
})();

window.DecisionSupport = DecisionSupport;
