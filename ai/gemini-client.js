/* ============================================================
   StadiumIQ 2026 — GenAI Orchestration Layer (Mock Mode)
   Simulates Gemini API responses with realistic content
   ============================================================ */

const GeminiClient = (() => {

  // ── Persona System Prompts ──────────────────────────────────
  const SYSTEM_PROMPTS = {
    fan: `You are StadiumIQ, a friendly multilingual AI companion for FIFA World Cup 2026 fans.
You help with navigation, food, transport, accessibility, and match info.
Always be warm, helpful, and concise. Use emojis tastefully.
You know all 16 host venues, their layout, services, and schedules.`,

    staff: `You are StadiumIQ OPS, an operational AI for venue staff.
You provide crowd analysis, incident management, gate flow optimization, and shift briefings.
Be precise, action-oriented, and prioritize safety. Use data-backed recommendations.`,

    volunteer: `You are StadiumIQ Relay, a translation and communication AI for World Cup volunteers.
Help translate fan queries, draft responses in multiple languages, and escalate issues.
Be quick, accurate, and culturally sensitive.`,

    organizer: `You are StadiumIQ Command, an executive AI for tournament organizers.
Provide strategic decision support, risk analysis, real-time situation assessment, and sustainability insights.
Be analytical, structured, and provide ranked options with confidence levels.`
  };

  // ── Realistic Response Library ─────────────────────────────
  const RESPONSES = {
    fan: {
      navigation: [
        "🗺️ **Your seat is in Section 114, Row G, Seat 22.** Head through Gate C (closest to you), take the escalator up to Level 2, then follow the blue wayfinding lights to the right. ETA: ~4 minutes.\n\n♿ *Tip: Elevator access is available at Gate C, Level 1.*",
        "🍔 **Nearest halal food court:** Food Zone 3, Gate F concourse (Ground Level). Open now, estimated wait: 8 minutes. They serve shawarma, falafel wraps, and grilled chicken. A halal-certified option is also at kiosk H12 near your section.",
        "🚻 **Nearest restrooms** to your location are 40m ahead on your left (Level 2, near Gate D). Low-traffic time: currently 2-min wait. Accessible restroom is marked with a blue ⬛ sign.",
        "🍺 **Beer & beverages:** Kiosk B7 (30m from Gate B, Ground Level) — currently no wait. Kiosk E3 near Section 112 has a 5-min queue right now.",
      ],
      transport: [
        "🚇 **Best time to leave:** I recommend departing your seat at minute **85'** (5 minutes before final whistle). This avoids the main surge. Metro Line 3 from South Station runs every 6 minutes post-match — next departure at 22:47.\n\n🚌 **Shuttle Bus:** Platform 7 outside Gate A. Capacity available, wait ~12 min. Rideshare surge currently at **2.1x** — consider metro instead.",
        "🅿️ **Park & Ride Lot C** (where you parked): Expected egress time post-match is 35–45 minutes. I recommend staying in the venue for 15 minutes after the final whistle — the lot empties 40% faster after the initial surge.",
        "🚗 **Rideshare update:** Uber/Lyft surge is currently **1.8x** normal. Expected to peak at **2.6x** in 20 minutes post-match. Best pickup point: North Plaza, Lot D. Taxi rank is at Gate B East exit."
      ],
      matchday: [
        "⚽ **Match Summary (Live):** Brazil 2–1 Argentina, 67'. Vinicius Jr. with a stunning curling shot in the 63rd minute! Messi's assist in the 34' is already going viral. 🔥\n\n📊 *Brazil possession: 54% | Shots on target: 7–4 | xG: 2.3–1.1*",
        "🎮 **Matchday Trivia:** Which player scored the fastest-ever World Cup goal? Answer: Hakan Şükür, Turkey (2002) — just **11 seconds**! 🤯 Play more in the Fan Zone tab.",
        "🏆 **Plan Your Matchday:** Based on your preferences, here's my suggestion:\n- **15:00** Arrive Gate C, visit Fan Zone Level 1\n- **16:00** Grab food at Zone 3 (pre-match, low crowds)\n- **17:30** Head to Section 114 for warm-ups\n- **18:00** Kick-off 🎉\n- **20:00** Post-match: exit via Gate C, Metro Line 3"
      ],
      general: [
        "👋 **Hello! I'm StadiumIQ**, your AI match companion for FIFA World Cup 2026! I can help with:\n• 🗺️ Navigation to your seat, food, restrooms\n• 🚇 Transport & best exit times\n• ⚽ Live match updates & stats\n• 🌍 Translation in 50+ languages\n• ♿ Accessibility assistance\n\nWhat do you need help with?",
        "🌡️ **Weather at the venue:** 28°C, partly cloudy. Feels like 31°C with humidity. Sunscreen recommended for outdoor sections. Evening forecast: clear skies, light breeze. Perfect match-watching conditions! ☀️",
        "📍 **First Aid station** is located at Gate B (Level 1) and Gate E (Level 2). Medical staff are on duty throughout the match. For emergencies, alert any volunteer wearing an orange vest or dial *55 on venue phones."
      ]
    },
    staff: {
      crowd: [
        "🚨 **ALERT — Gate 7 Crowd Build-up Detected**\n\nCurrent density: **847 people/100m²** (threshold: 600). Predictive model shows this escalating to **1,100/100m²** in 13 minutes if no action is taken.\n\n**Recommended Actions (ranked by impact):**\n1. Open Gate 7B overflow lane immediately (+34% capacity)\n2. Deploy 2 crowd marshals for queue management\n3. Activate PA announcement directing fans to Gate 8\n4. Notify Gate 7 supervisor (Ref: Marcus T.)\n\n*Confidence: 91% | Model: CrowdFlow-v3*",
        "📊 **Crowd Density Forecast — Next 30 Minutes:**\n\nNorth Concourse: 🟡 Medium → 🔴 High (match end approach)\nGate A–D: 🟢 Low → 🟡 Medium\nFood Court 2: 🔴 High (peak: match HT)\nGate F: 🟢 Low (recommend opening for dispersion)\n\n*Egress simulation complete: 94% confidence in 22-minute total dispersion time if all gates opened simultaneously.*",
        "⚠️ **Potential Crush Risk Detected — Section 112 Ramp**\nDensity: 94% of safe capacity. Recommend immediately routing incoming foot traffic via alternative ramp (Section 110). Estimated relief time: 4 minutes."
      ],
      incident: [
        "📋 **Auto-generated Incident Report #INC-2847**\n\n**Type:** Medical — Fan collapse\n**Location:** Section 106, Row D, Seat 7\n**Time:** 19:42 local\n**Status:** Medical team dispatched (ETA: 2 min)\n**AI Summary:** Fan reported dizziness, likely heat-related given 31°C ambient. Nearest first aid station alerted. Fan's next-of-kin contact pending from ticketing system.\n\n*Escalate to: Venue Medical Director | Logged in: Operations Log v4*",
        "📋 **Shift Briefing — Night Crew (Gate Section C-F)**\nGenerated at 17:30 | Match: Brazil vs Argentina | Attendance: 83,420 (98% capacity)\n\n**Priority Items:**\n1. 🚨 Gate 7 overflow: Pre-position 4 additional marshals by 19:00\n2. ♿ 3 accessibility requests pending (see A11y Hub)\n3. 🌧️ Weather advisory: Light rain expected 21:00–21:45. Prepare covered waiting areas\n4. 🍺 Concession C3 low on stock — restock before HT\n\n**Your zone KPIs:** Target < 8 min queue at all gates | Medical response < 4 min"
      ]
    },
    volunteer: {
      translate: [
        "**Translation: Japanese → English**\n\n*Original:* トイレはどこですか？\n*Translation:* \"Where is the restroom?\"\n\n**Suggested response (Japanese):** トイレは右側、ゲートDの近くにあります。約50メートルです。\n*(The restroom is on the right side, near Gate D. About 50 meters.)*",
        "**Translation: Arabic → English**\n\n*Original:* كيف أصل إلى مقعدي في القسم 114؟\n*Translation:* \"How do I get to my seat in Section 114?\"\n\n**Suggested response (Arabic):** اذهب عبر البوابة C، خذ السلم المتحرك إلى المستوى الثاني، ثم اتبع الأضواء الزرقاء إلى اليمين. الوقت المقدر: 4 دقائق.\n*(Go through Gate C, take the escalator to Level 2, then follow the blue lights to the right. Estimated time: 4 minutes.)*",
        "**Translation: Spanish → English**\n\n*Original:* ¿Dónde está la comida halal más cercana?\n*Translation:* \"Where is the nearest halal food?\"\n\n**Suggested response (Spanish):** La zona de comida halal está en la Zona 3 de Comida, nivel de planta baja cerca de la Puerta F. Tiempo de espera actual: 8 minutos."
      ],
      escalation: [
        "**Escalation Draft — Medical Urgency**\n\nTo: Medical Coordinator (Radio Ch. 3)\nFrom: Volunteer Sector C\nMessage: Fan at Section 108, Row B, Seat 12 reporting chest pain. Fan is a 65-year-old male. Requests immediate medical assistance. Current status: fan is seated, conscious, pale in appearance.\n\n*Please confirm receipt and dispatch ETA.*",
        "**Escalation Draft — Security**\n\nTo: Security Supervisor\nFrom: Volunteer Gate 7\nMessage: Group of 6 fans attempting to enter restricted zone near players' tunnel. Currently holding position. Requesting security presence at Gate 7 South corridor within 3 minutes."
      ]
    },
    organizer: {
      decision: [
        "**Situation Analysis — Gate 12 Congestion**\n\n*Current State:* 1,240 fans queued. Flow rate: 180/min. At current rate, 30-minute backlog.\n\n**Decision Options (ranked by impact/feasibility):**\n\n**Option 1 — High Impact** ✅ (Confidence: 94%)\nOpen Gate 12B immediately + deploy 3 additional scanners. Estimated resolution: 12 minutes. Cost: minimal (staff reallocation).\n\n**Option 2 — Medium Impact** (Confidence: 87%)\nActivate PA redirect to Gate 11. ~40% fan diversion expected. Combined with Option 1: 8-minute resolution.\n\n**Option 3 — Low Impact** (Confidence: 72%)\nDynamic signage update only. Slower compliance, ~25% diversion. Best used as supplement to Option 1.\n\n*Recommendation: Execute Option 1 + 2 simultaneously for optimal outcome.*",
        "**Match-Day Runsheet Gap Analysis**\n\n⚠️ **3 Critical Gaps Detected:**\n1. **19:30** — No transport dispatch confirmation logged for Bus Route 7. Action needed by 18:45.\n2. **21:15** — Post-match sustainability report window: Carbon meter sync not configured.\n3. **22:00** — Media zone clearance protocol not assigned to a responsible officer.\n\n**Auto-drafted actions for each gap are ready. Approve to send?**",
        "**Sustainability Status — Match Day 3**\n\nCurrent carbon footprint: **847 tonnes CO₂e** (12% above target)\n\n**Key drivers:**\n- Energy (lighting): +18% vs benchmark (LED zone 4 fault)\n- Transport: +7% (shuttle routing suboptimal)\n- Waste: ✅ 8% below target\n\n**AI Recommendation:** Dim non-essential LED banks in empty sections (Sections 220–240) during halftime. Estimated saving: 2.3 tonnes CO₂e. Maintenance alert already drafted."
      ]
    }
  };

  // ── Context-based response selection ──────────────────────
  function detectIntent(message) {
    const m = message.toLowerCase();
    if (/seat|section|gate|where|find|navigate|map|locat/.test(m)) return 'navigation';
    if (/transport|metro|bus|shuttle|ride|leave|exit|park/.test(m)) return 'transport';
    if (/food|eat|halal|beer|snack|drink|concession/.test(m)) return 'navigation';
    if (/score|match|goal|player|team|live|stat/.test(m)) return 'matchday';
    if (/plan|itinerary|day|schedule/.test(m)) return 'matchday';
    if (/crowd|density|gate|flow|surge|heatmap/.test(m)) return 'crowd';
    if (/incident|report|medical|emergency|collapse/.test(m)) return 'incident';
    if (/translate|japanese|arabic|spanish|french|german|hindi/.test(m)) return 'translate';
    if (/escalat|security|urgent|danger/.test(m)) return 'escalation';
    if (/decision|option|situation|congestion|bottleneck/.test(m)) return 'decision';
    if (/sustain|carbon|energy|waste|green/.test(m)) return 'decision';
    return 'general';
  }

  function pickResponse(persona, intent) {
    const pool = RESPONSES[persona]?.[intent] || RESPONSES[persona]?.general || RESPONSES.fan.general;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── Streaming simulation ──────────────────────────────────
  async function streamResponse(text, onChunk) {
    const words = text.split(' ');
    let buffer = '';
    for (let i = 0; i < words.length; i++) {
      buffer += (i > 0 ? ' ' : '') + words[i];
      onChunk(buffer);
      await new Promise(r => setTimeout(r, 18 + Math.random() * 22));
    }
    return text;
  }

  // ── Public API ─────────────────────────────────────────────
  async function chat(persona, userMessage, onStream = null) {
    // Simulate network latency
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    
    const intent = detectIntent(userMessage);
    const response = pickResponse(persona, intent);
    
    if (onStream) {
      await streamResponse(response, onStream);
    }
    return response;
  }

  async function generateReport(type, data) {
    await new Promise(r => setTimeout(r, 1200));
    const reports = {
      sustainability: `**Sustainability Report — Match Day ${data?.match || 3}**\nGenerated: ${new Date().toLocaleString()}\n\n**Executive Summary:**\nOverall carbon performance is 12% above target, primarily driven by lighting inefficiency in Zone 4. Waste management is performing exceptionally well at 8% below target. Immediate action on LED optimization recommended.\n\n**Metrics:**\n• Energy: 847 MWh consumed | Target: 720 MWh\n• Water: 42,000L | Target: 45,000L ✅\n• Waste recycled: 78% | Target: 70% ✅\n• Transport emissions: 340t CO₂e | Target: 315t\n\n**Actions Required:**\n1. LED Zone 4 maintenance (saves ~2.3t CO₂e tonight)\n2. Optimize shuttle routes B7 & B9 (saves ~0.8t)\n3. Commend waste team — share best practice`,
      shift: `**Shift Briefing — Generated by StadiumIQ AI**\nDate: ${new Date().toLocaleDateString()} | Venue: MetLife Stadium\n\nKey priorities, crowd forecasts, and incident history pre-loaded. All staff: check in via tablet before 17:00. Medical channel: Radio 3. Security: Radio 5. Gate supervisors: Radio 7.`
    };
    return reports[type] || reports.sustainability;
  }

  async function analyzeImage(description) {
    await new Promise(r => setTimeout(r, 800));
    return `**AI Vision Analysis:**\n${description}\n\nAssessment: Crowd density elevated. Recommend opening adjacent zone. No imminent safety risk detected. Monitoring continues.`;
  }

  return { chat, generateReport, analyzeImage, SYSTEM_PROMPTS };
})();

// Export for use across modules
window.GeminiClient = GeminiClient;
