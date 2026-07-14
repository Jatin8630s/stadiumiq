/* ============================================================
   StadiumIQ 2026 — Accessibility Hub (Staff Module)
   AI-triaged request management + fan self-service intake
   ============================================================ */

const AccessibilityHub = (() => {

  let requests = [];
  let reqCounter = 100;

  function init(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = buildUI();
    loadInitialRequests();
    attachEvents(el);
    subscribeToData();
  }

  function buildUI() {
    return `
    <div class="flex-col gap-6">

      <!-- Summary KPIs -->
      <div class="grid-3">
        <div class="stat-card animate-fade-in-up delay-1">
          <div class="stat-value" id="a11y-pending" style="color:var(--accent-orange)">5</div>
          <div class="stat-label">Pending Requests</div>
        </div>
        <div class="stat-card animate-fade-in-up delay-2">
          <div class="stat-value" id="a11y-active" style="color:var(--accent-primary)">3</div>
          <div class="stat-label">Active Escorts</div>
        </div>
        <div class="stat-card animate-fade-in-up delay-3">
          <div class="stat-value" id="a11y-resolved" style="color:var(--accent-green)">12</div>
          <div class="stat-label">Resolved Today</div>
        </div>
      </div>

      <!-- Natural Language Intake -->
      <div class="card" style="background:rgba(79,142,247,0.05);border-color:rgba(79,142,247,0.25)">
        <div class="section-header">
          <div>
            <div class="section-title">🤖 AI Request Intake</div>
            <div class="section-subtitle">Fan describes their need in any language — AI structures the request</div>
          </div>
          <span class="badge badge-blue">NL → Structured</span>
        </div>
        <textarea class="input" id="nl-intake" rows="3"
          placeholder='Fan says anything e.g: "My grandmother uses a wheelchair and cannot climb stairs, she needs to get to section 108"'
          style="resize:none;margin-bottom:var(--space-3)"></textarea>
        <div class="flex gap-3">
          <button class="btn btn-primary" id="parse-request" style="flex:1">🤖 Parse with AI</button>
          <button class="btn btn-ghost" id="voice-intake">🎙️ Voice</button>
        </div>
        <!-- Parsed Result -->
        <div id="parsed-result" style="display:none;margin-top:var(--space-4);padding:var(--space-4);background:var(--glass-bg);border-radius:var(--radius-md);border:1px solid var(--glass-border)">
          <div style="font-size:var(--text-xs);color:var(--accent-primary);margin-bottom:var(--space-3);font-weight:600;text-transform:uppercase;letter-spacing:0.06em">AI Structured Output</div>
          <div id="parsed-fields"></div>
          <div class="flex gap-3" style="margin-top:var(--space-3)">
            <button class="btn btn-green btn-sm" id="submit-parsed" style="flex:1">✅ Submit Request</button>
            <button class="btn btn-ghost btn-sm" id="edit-parsed">✏️ Edit</button>
          </div>
        </div>
      </div>

      <!-- Request Queue -->
      <div class="card">
        <div class="section-header">
          <div class="section-title">📋 Request Queue</div>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm tab-filter active" data-filter="all">All</button>
            <button class="btn btn-ghost btn-sm tab-filter" data-filter="high">🔴 High</button>
            <button class="btn btn-ghost btn-sm tab-filter" data-filter="pending">⏳ Pending</button>
            <button class="btn btn-ghost btn-sm tab-filter" data-filter="active">🟢 Active</button>
          </div>
        </div>
        <div id="request-queue" class="flex-col gap-3"></div>
      </div>

      <!-- Venue Accessibility Map -->
      <div class="card">
        <div class="section-title" style="margin-bottom:var(--space-4)">🗺️ Accessibility Points</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-3)">
          ${[
            { icon: '🛗', name: 'Elevators', locations: 'Gates A, C, E, G — Level 1', status: 'ok' },
            { icon: '🪑', name: 'Wheelchair Zones', locations: 'Sections 110–115, 220–225', status: 'ok' },
            { icon: '🦮', name: 'Service Animal Area', locations: 'Gate B North, Level 1', status: 'ok' },
            { icon: '🦻', name: 'Hearing Loops', locations: 'All seating sections', status: 'warning' },
            { icon: '🔤', name: 'Braille Signage', locations: 'All major corridors', status: 'ok' },
            { icon: '👶', name: 'Nursing Rooms', locations: 'Gates D, G — Level 1', status: 'ok' },
          ].map(p => `
            <div class="card card-sm hover-lift" style="padding:var(--space-4)">
              <div style="font-size:24px;margin-bottom:var(--space-2)">${p.icon}</div>
              <div style="font-weight:600;font-size:var(--text-sm)">${p.name}</div>
              <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">${p.locations}</div>
              <div style="margin-top:var(--space-2)">
                <span class="badge ${p.status === 'ok' ? 'badge-green' : 'badge-orange'}">${p.status === 'ok' ? '✓ Operational' : '⚠ Check needed'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
  }

  const INITIAL_REQUESTS = [
    { id: 'A11Y-101', need: 'Wheelchair escort to Section 108', icon: '♿', priority: 'high', fanName: 'Mohamed A.', time: '19:22', status: 'pending', detail: 'Fan arrived at Gate C. Cannot navigate stairs. Needs escort + elevator access.' },
    { id: 'A11Y-102', need: 'Visual impairment — navigation to seat', icon: '👁️', priority: 'high', fanName: 'Sarah K.', time: '19:25', status: 'active', detail: 'Being assisted by volunteer Raj. Currently at Level 2 elevator.' },
    { id: 'A11Y-103', need: 'Hearing loop not working — Section 115', icon: '🦻', priority: 'medium', fanName: 'Jean-Pierre D.', time: '19:30', status: 'pending', detail: 'Technical issue with hearing loop in Section 115. Maintenance notified.' },
    { id: 'A11Y-104', need: 'Companion seating request', icon: '🧑‍🦽', priority: 'medium', fanName: 'Fatima R.', time: '19:35', status: 'pending', detail: 'Family of 4 + 1 wheelchair user. Requesting adjacent companion seats.' },
    { id: 'A11Y-105', need: 'Nursing room access — urgent', icon: '👶', priority: 'high', fanName: 'Emma T.', time: '19:38', status: 'pending', detail: 'Mother with infant needs private nursing room immediately. Gate D preferred.' },
  ];

  function loadInitialRequests() {
    requests = [...INITIAL_REQUESTS];
    renderQueue(requests);
  }

  function renderQueue(reqs) {
    const queue = document.getElementById('request-queue');
    if (!queue) return;
    if (reqs.length === 0) {
      queue.innerHTML = '<div style="text-align:center;padding:var(--space-8);color:var(--text-muted)">✅ All requests handled</div>';
      return;
    }
    queue.innerHTML = reqs.map(r => `
      <div class="a11y-request animate-fade-in-up" id="req-${r.id}">
        <div class="a11y-icon-wrap">${r.icon}</div>
        <div style="flex:1">
          <div class="flex items-center justify-between" style="margin-bottom:4px">
            <div style="font-weight:600;font-size:var(--text-sm)">${r.need}</div>
            <span class="a11y-priority ${r.priority}">${r.priority}</span>
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-2)">${r.fanName} · ${r.id} · ${r.time} · 
            <span style="color:${r.status === 'active' ? 'var(--accent-green)' : r.status === 'resolved' ? 'var(--text-muted)' : 'var(--accent-orange)'}">${r.status}</span>
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-3)">${r.detail}</div>
          <div class="flex gap-2">
            ${r.status === 'pending' ? `
              <button class="btn btn-green btn-sm" onclick="AccessibilityHub.assignRequest('${r.id}')">✅ Assign</button>
              <button class="btn btn-ghost btn-sm" onclick="AccessibilityHub.resolveRequest('${r.id}')">✓ Resolve</button>
            ` : r.status === 'active' ? `
              <button class="btn btn-ghost btn-sm" onclick="AccessibilityHub.resolveRequest('${r.id}')">✓ Mark Resolved</button>
            ` : `<span style="font-size:var(--text-xs);color:var(--accent-green)">✅ Resolved</span>`}
            <button class="btn btn-ghost btn-sm" onclick="AccessibilityHub.escalateRequest('${r.id}')">📡 Escalate</button>
          </div>
        </div>
      </div>
    `).join('');
    updateKPIs();
  }

  function assignRequest(id) {
    requests = requests.map(r => r.id === id ? { ...r, status: 'active' } : r);
    renderQueue(requests);
    window.Toast.success(`Request ${id} assigned to nearest volunteer`);
  }

  function resolveRequest(id) {
    requests = requests.map(r => r.id === id ? { ...r, status: 'resolved' } : r);
    renderQueue(requests.filter(r => r.status !== 'resolved'));
    window.Toast.success(`Request ${id} resolved ✅`);
  }

  function escalateRequest(id) {
    window.Toast.warning(`Request ${id} escalated to Accessibility Coordinator`);
  }

  function updateKPIs() {
    document.getElementById('a11y-pending').textContent = requests.filter(r => r.status === 'pending').length;
    document.getElementById('a11y-active').textContent = requests.filter(r => r.status === 'active').length;
  }

  function subscribeToData() {
    if (!window.MockDataStreams) return;
    window.MockDataStreams.subscribe('accessibility', req => {
      requests.unshift(req);
      renderQueue(requests.filter(r => r.status !== 'resolved'));
      window.Toast.warning(`♿ New accessibility request: ${req.need}`);
    });
  }

  async function parseNLRequest(text) {
    const parsed = document.getElementById('parsed-result');
    const fields = document.getElementById('parsed-fields');
    parsed.style.display = 'block';
    fields.innerHTML = '<div class="animate-shimmer" style="height:80px;border-radius:8px"></div>';

    await new Promise(r => setTimeout(r, 1200));

    // Simulate AI parsing
    const needType = text.toLowerCase().includes('wheelchair') ? 'Wheelchair Escort' :
                     text.toLowerCase().includes('blind') || text.toLowerCase().includes('visual') ? 'Visual Assistance' :
                     text.toLowerCase().includes('hear') ? 'Hearing Assistance' : 'General Accessibility';
    const priority = text.toLowerCase().includes('urgent') || text.toLowerCase().includes('cannot') ? 'high' : 'medium';
    const section = (text.match(/section\s*(\d+)/i) || ['', 'To be confirmed'])[1];

    fields.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
        ${[
          ['Need Type', needType],
          ['Priority', priority.toUpperCase()],
          ['Location', section !== 'To be confirmed' ? `Section ${section}` : 'Entry area'],
          ['Language', 'English (detected)'],
          ['Mobility Aid', needType.includes('Wheelchair') ? 'Wheelchair required' : 'None stated'],
          ['Companion', text.toLowerCase().includes('family') || text.toLowerCase().includes('group') ? 'Yes' : 'No'],
        ].map(([k, v]) => `
          <div>
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em">${k}</div>
            <div style="font-size:var(--text-sm);font-weight:500;margin-top:2px">${v}</div>
          </div>
        `).join('')}
      </div>`;
  }

  function attachEvents(container) {
    container.querySelector('#parse-request')?.addEventListener('click', () => {
      const text = container.querySelector('#nl-intake').value;
      if (text.trim()) parseNLRequest(text);
    });

    container.querySelector('#submit-parsed')?.addEventListener('click', () => {
      reqCounter++;
      window.Toast.success(`Request A11Y-${reqCounter} submitted and queued`);
      container.querySelector('#parsed-result').style.display = 'none';
      container.querySelector('#nl-intake').value = '';
    });

    container.querySelectorAll('.tab-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-filter').forEach(b => b.classList.remove('active','btn-primary'));
        btn.classList.add('active','btn-primary');
        const filter = btn.dataset.filter;
        const filtered = filter === 'all' ? requests : requests.filter(r => r.priority === filter || r.status === filter);
        renderQueue(filtered.filter(r => r.status !== 'resolved'));
      });
    });
  }

  return { init, assignRequest, resolveRequest, escalateRequest };
})();

window.AccessibilityHub = AccessibilityHub;
