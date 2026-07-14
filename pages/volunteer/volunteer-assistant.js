/* ============================================================
   StadiumIQ 2026 — Volunteer Assistant Module
   AI Translation Relay + Escalation + Briefing
   ============================================================ */

const VolunteerAssistant = (() => {

  const LANG_PAIRS = [
    { from: 'en', fromLabel: '🇬🇧 English', to: 'ar', toLabel: '🇸🇦 Arabic' },
    { from: 'en', fromLabel: '🇬🇧 English', to: 'es', toLabel: '🇪🇸 Spanish' },
    { from: 'en', fromLabel: '🇬🇧 English', to: 'ja', toLabel: '🇯🇵 Japanese' },
    { from: 'en', fromLabel: '🇬🇧 English', to: 'zh', toLabel: '🇨🇳 Chinese' },
    { from: 'en', fromLabel: '🇬🇧 English', to: 'fr', toLabel: '🇫🇷 French' },
    { from: 'en', fromLabel: '🇬🇧 English', to: 'pt', toLabel: '🇧🇷 Portuguese' },
    { from: 'en', fromLabel: '🇬🇧 English', to: 'hi', toLabel: '🇮🇳 Hindi' },
    { from: 'ar', fromLabel: '🇸🇦 Arabic', to: 'en', toLabel: '🇬🇧 English' },
    { from: 'ja', fromLabel: '🇯🇵 Japanese', to: 'en', toLabel: '🇬🇧 English' },
    { from: 'es', fromLabel: '🇪🇸 Spanish', to: 'en', toLabel: '🇬🇧 English' },
  ];

  const COMMON_PHRASES = [
    { en: 'Your seat is this way →', ar: 'مقعدك في هذا الاتجاه ←', es: 'Tu asiento está por aquí →', ja: 'お席はこちらです →', fr: 'Votre siège est par ici →', pt: 'Seu assento é por aqui →', zh: '您的座位在这里 →' },
    { en: 'Please show your ticket', ar: 'الرجاء إظهار التذكرة', es: 'Por favor muestre su entrada', ja: 'チケットをご提示ください', fr: 'Veuillez montrer votre billet', pt: 'Por favor mostre seu ingresso', zh: '请出示您的票' },
    { en: 'Restroom is on the left', ar: 'دورة المياه على اليسار', es: 'El baño está a la izquierda', ja: 'トイレは左手です', fr: 'Les toilettes sont à gauche', pt: 'O banheiro está à esquerda', zh: '洗手间在左边' },
    { en: 'First Aid is nearby', ar: 'الإسعافات الأولية قريبة', es: 'Los primeros auxilios están cerca', ja: '応急処置は近くにあります', fr: 'Les premiers secours sont proches', pt: 'O pronto-socorro está próximo', zh: '急救站在附近' },
    { en: 'Can I help you?', ar: 'هل يمكنني مساعدتك؟', es: '¿Puedo ayudarte?', ja: 'お手伝いできますか？', fr: 'Puis-je vous aider?', pt: 'Posso ajudá-lo?', zh: '我可以帮助您吗？' },
    { en: 'This gate is closed', ar: 'هذا البوابة مغلقة', es: 'Esta puerta está cerrada', ja: 'この出口は閉まっています', fr: 'Cette porte est fermée', pt: 'Este portão está fechado', zh: '此大门已关闭' },
  ];

  const ESCALATION_TEMPLATES = [
    { title: '🏥 Medical Emergency', body: 'URGENT: Medical assistance needed at [LOCATION]. Fan condition: [CONDITION]. Requesting immediate medical team response.' },
    { title: '🛡️ Security Issue', body: 'Security alert at [LOCATION]. Description: [DETAILS]. Fan/group involved. Requesting security personnel immediately.' },
    { title: '♿ Accessibility Emergency', body: 'Accessibility emergency at [LOCATION]. Fan requires [NEED]. Elevator/escort needed urgently.' },
    { title: '🔥 Safety Hazard', body: 'Safety hazard reported at [LOCATION]: [DESCRIPTION]. Requesting immediate safety team and potential evacuation assessment.' },
    { title: '👶 Lost Child', body: 'Lost child reported near [LOCATION]. Child description: [DESCRIPTION]. Age approx: [AGE]. Language: [LANGUAGE].' },
  ];

  let currentFromLang = 'en';
  let currentToLang = 'es';
  let isListeningTranslate = false;

  function init(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = buildUI();
    attachEvents(el);
  }

  function buildUI() {
    return `
    <div class="flex-col gap-6">

      <!-- My Assignment Card -->
      <div class="card" style="background:linear-gradient(135deg,rgba(34,197,94,0.08),rgba(79,142,247,0.08));border-color:rgba(34,197,94,0.2)">
        <div class="flex items-center gap-4">
          <div style="width:52px;height:52px;background:var(--grad-volunteer);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;font-size:24px">🤝</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:var(--text-md)">Your Assignment Today</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:4px">⚽ Brazil vs Argentina | MetLife Stadium</div>
            <div style="display:flex;gap:var(--space-3);margin-top:var(--space-2)">
              <span class="badge badge-green">Gate C–F Zone</span>
              <span class="badge badge-blue">Fan Services</span>
              <span class="badge badge-purple">Multilingual</span>
            </div>
          </div>
          <div style="text-align:right">
            <div class="live-dot">On Duty</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">Shift: 16:00 – 23:00</div>
          </div>
        </div>
        <div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid rgba(34,197,94,0.15)">
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-2)">🤖 AI Shift Briefing:</div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary)">Main languages in your zone today: Arabic, Spanish, Japanese. Gate C overcrowding alert active — redirect fans to Gate D when queue > 50. Keep radio on Channel 7. Medical team on standby Gate B.</div>
        </div>
      </div>

      <!-- AI Translation Tool -->
      <div class="card">
        <div class="section-header">
          <div>
            <div class="section-title">🌍 AI Translation Relay</div>
            <div class="section-subtitle">Speak → AI translates → Fan hears in their language</div>
          </div>
          <span class="badge badge-purple">50+ Languages</span>
        </div>

        <!-- Language Pair Selector -->
        <div class="flex items-center gap-3" style="margin-bottom:var(--space-4)">
          <select class="lang-select" id="from-lang" style="flex:1">
            ${window.i18n.supported.map(l => `<option value="${l.code}" ${l.code === 'en' ? 'selected' : ''}>${l.flag} ${l.name}</option>`).join('')}
          </select>
          <button class="btn btn-ghost btn-icon" id="swap-langs" title="Swap languages">⇄</button>
          <select class="lang-select" id="to-lang" style="flex:1">
            ${window.i18n.supported.map(l => `<option value="${l.code}" ${l.code === 'es' ? 'selected' : ''}>${l.flag} ${l.name}</option>`).join('')}
          </select>
        </div>

        <!-- Translation Box -->
        <div class="translate-box">
          <div class="translate-lang-bar">
            <span style="font-size:var(--text-xs);font-weight:600" id="from-label">🇬🇧 English</span>
            <button class="btn btn-ghost btn-sm" id="clear-translate">Clear</button>
          </div>
          <div class="translate-panel original" id="original-text" contenteditable="true" style="outline:none;min-height:80px">
            Type or speak what you want to say to the fan...
          </div>
          <div class="translate-divider"></div>
          <div class="translate-lang-bar">
            <span style="font-size:var(--text-xs);font-weight:600" id="to-label">🇪🇸 Spanish</span>
            <button class="btn btn-ghost btn-sm" id="copy-translation">📋 Copy</button>
          </div>
          <div class="translate-panel translated" id="translated-text">
            Translation will appear here...
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-3" style="margin-top:var(--space-4)">
          <button class="voice-btn" id="translate-voice" style="width:64px;height:64px;font-size:24px" title="Hold to speak">🎙️</button>
          <div style="flex:1;display:flex;flex-col;gap:var(--space-2)">
            <button class="btn btn-primary btn-full" id="do-translate">🤖 Translate Now</button>
            <button class="btn btn-ghost btn-full" id="speak-translation">🔊 Speak to Fan</button>
          </div>
        </div>
      </div>

      <!-- Common Phrases -->
      <div class="card">
        <div class="section-title" style="margin-bottom:var(--space-4)">⚡ Quick Phrases</div>
        <div id="quick-phrases" class="flex-col gap-2">
          ${COMMON_PHRASES.map((p, i) => `
            <div class="incident-card" id="phrase-${i}" style="cursor:pointer" onclick="VolunteerAssistant.usePhrase(${i})">
              <div style="flex:1">
                <div style="font-size:var(--text-sm);font-weight:500">${p.en}</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px" id="phrase-trans-${i}">Tap to translate</div>
              </div>
              <button class="btn btn-ghost btn-sm">➤ Use</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Escalation Templates -->
      <div class="card" style="border-color:rgba(239,68,68,0.25)">
        <div class="section-header">
          <div class="section-title">🚨 Quick Escalation</div>
          <span class="badge badge-red">Urgent</span>
        </div>
        <div class="flex-col gap-2">
          ${ESCALATION_TEMPLATES.map((t, i) => `
            <button class="btn btn-ghost btn-full" style="justify-content:flex-start;gap:var(--space-3);padding:var(--space-3) var(--space-4)" id="esc-${i}" onclick="VolunteerAssistant.openEscalation(${i})">
              <span>${t.title}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Escalation Modal (hidden) -->
      <div id="esc-modal" style="display:none" class="card" style="border:1px solid rgba(239,68,68,0.3)">
        <div class="section-header">
          <div class="section-title" id="esc-modal-title">Escalation</div>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('esc-modal').style.display='none'">✕</button>
        </div>
        <textarea class="input" id="esc-modal-body" rows="5" style="resize:none;margin-bottom:var(--space-3)"></textarea>
        <div class="flex gap-3">
          <button class="btn btn-danger btn-full" id="send-escalation">📡 Send Escalation Now</button>
        </div>
      </div>
    </div>`;
  }

  // Simulated translations database
  const TRANSLATIONS = {
    'Your seat is this way': { es: 'Tu asiento está por aquí →', ar: 'مقعدك في هذا الاتجاه', ja: 'お席はこちらです', fr: 'Votre siège est par ici', pt: 'Seu assento é por aqui', zh: '您的座位在这里', hi: 'आपकी सीट इस तरफ है', de: 'Ihr Sitz ist in diese Richtung', it: 'Il tuo posto è da questa parte' },
  };

  async function doTranslate(text, toLang) {
    if (!text || text.includes('Type or speak')) return '';

    const transEl = document.getElementById('translated-text');
    transEl.textContent = '⏳ Translating...';
    transEl.style.color = 'var(--text-muted)';

    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));

    // Check our local phrase database
    const key = Object.keys(TRANSLATIONS).find(k => text.toLowerCase().includes(k.toLowerCase()));
    let result;
    if (key && TRANSLATIONS[key][toLang]) {
      result = TRANSLATIONS[key][toLang];
    } else {
      // Simulate AI translation response
      const response = await window.GeminiClient.chat('volunteer', `Translate to ${toLang}: ${text}`);
      // Extract the actual translation from the response
      const match = response.match(/Translation.*?:\s*[""](.+?)[""\n]/i);
      result = match ? match[1] : `[AI Translation to ${toLang}]: ${text} (translated)`;
    }

    transEl.textContent = result;
    transEl.style.color = 'var(--text-primary)';
    return result;
  }

  function usePhrase(idx) {
    const phrase = COMMON_PHRASES[idx];
    const toLang = document.getElementById('to-lang')?.value || 'es';
    const translation = phrase[toLang] || phrase.es;
    document.getElementById('original-text').textContent = phrase.en;
    document.getElementById('translated-text').textContent = translation || 'Translation available via AI';
    document.getElementById('translated-text').style.color = 'var(--text-primary)';

    // Show translated phrase preview inline
    const previewEl = document.getElementById(`phrase-trans-${idx}`);
    if (previewEl) previewEl.textContent = translation || '—';
  }

  function openEscalation(idx) {
    const tmpl = ESCALATION_TEMPLATES[idx];
    const modal = document.getElementById('esc-modal');
    document.getElementById('esc-modal-title').textContent = tmpl.title;
    document.getElementById('esc-modal-body').value = tmpl.body;
    modal.style.display = 'block';
    modal.scrollIntoView({ behavior: 'smooth' });
  }

  function attachEvents(container) {
    container.querySelector('#do-translate')?.addEventListener('click', () => {
      const text = container.querySelector('#original-text')?.textContent;
      const toLang = container.querySelector('#to-lang')?.value || 'es';
      doTranslate(text, toLang);
    });

    container.querySelector('#swap-langs')?.addEventListener('click', () => {
      const fromSel = container.querySelector('#from-lang');
      const toSel = container.querySelector('#to-lang');
      const temp = fromSel.value;
      fromSel.value = toSel.value;
      toSel.value = temp;
      updateLangLabels(container);
    });

    container.querySelector('#from-lang')?.addEventListener('change', () => updateLangLabels(container));
    container.querySelector('#to-lang')?.addEventListener('change', () => updateLangLabels(container));

    container.querySelector('#clear-translate')?.addEventListener('click', () => {
      container.querySelector('#original-text').textContent = '';
      container.querySelector('#translated-text').textContent = 'Translation will appear here...';
    });

    container.querySelector('#copy-translation')?.addEventListener('click', () => {
      const text = container.querySelector('#translated-text')?.textContent;
      navigator.clipboard?.writeText(text).then(() => window.Toast.success('Translation copied!'));
    });

    container.querySelector('#speak-translation')?.addEventListener('click', () => {
      const text = container.querySelector('#translated-text')?.textContent;
      if ('speechSynthesis' in window && text && !text.includes('appear here')) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = container.querySelector('#to-lang')?.value || 'es';
        speechSynthesis.speak(utt);
        window.Toast.info('🔊 Speaking translation...');
      } else {
        window.Toast.info('🔊 Text-to-speech playing (simulated)');
      }
    });

    container.querySelector('#send-escalation')?.addEventListener('click', () => {
      window.Toast.success('🚨 Escalation sent to supervisor via Radio Ch.7');
      document.getElementById('esc-modal').style.display = 'none';
    });

    container.querySelector('#translate-voice')?.addEventListener('click', () => {
      window.Toast.info('🎙️ Voice input: Speak your message...');
      // Simulate voice input
      setTimeout(() => {
        container.querySelector('#original-text').textContent = 'Your seat is this way, please follow me';
        usePhrase(0);
      }, 1500);
    });
  }

  function updateLangLabels(container) {
    const fromCode = container.querySelector('#from-lang')?.value;
    const toCode = container.querySelector('#to-lang')?.value;
    const fromLang = window.i18n.supported.find(l => l.code === fromCode);
    const toLang = window.i18n.supported.find(l => l.code === toCode);
    if (fromLang) container.querySelector('#from-label').textContent = `${fromLang.flag} ${fromLang.name}`;
    if (toLang) container.querySelector('#to-label').textContent = `${toLang.flag} ${toLang.name}`;
  }

  return { init, usePhrase, openEscalation };
})();

window.VolunteerAssistant = VolunteerAssistant;
