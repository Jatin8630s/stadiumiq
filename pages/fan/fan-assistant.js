/* ============================================================
   StadiumIQ 2026 — Fan Assistant Module
   Multilingual AI chat with voice, quick prompts, streaming
   ============================================================ */

const FanAssistant = (() => {

  let isListening = false;
  let recognition = null;
  let conversationHistory = [];

  const QUICK_PROMPTS = [
    { label: '🗺️ Find my seat', msg: 'Where is my seat in Section 114, Row G?' },
    { label: '🍔 Halal food', msg: 'Where is the nearest halal food?' },
    { label: '🚇 Best exit time', msg: 'When should I leave for the metro?' },
    { label: '♿ Accessibility', msg: 'I need wheelchair assistance to my seat' },
    { label: '🏥 First Aid', msg: 'Where is the nearest first aid station?' },
    { label: '⚽ Match stats', msg: 'What are the current match statistics?' },
  ];

  function init(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = buildUI();
    attachEvents(el);
    addWelcomeMessage(el);
    initVoice();
  }

  function buildUI() {
    return `
    <div class="chat-container" style="height:100%;">
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-quick-prompts" id="quick-prompts">
        ${QUICK_PROMPTS.map(p => `
          <button class="quick-prompt-chip" data-msg="${p.msg}">${p.label}</button>
        `).join('')}
      </div>
      <div class="chat-input-area">
        <button class="btn btn-ghost btn-icon" id="voice-toggle" title="Voice input" style="flex-shrink:0">
          🎙️
        </button>
        <select class="lang-select" id="lang-selector" style="width:auto;flex-shrink:0">
          ${window.i18n.getLangOptions()}
        </select>
        <textarea class="chat-input" id="chat-input" placeholder="Ask anything... (e.g. Where is Gate C?)" rows="1"></textarea>
        <button class="chat-send-btn" id="send-btn">➤</button>
      </div>
    </div>`;
  }

  function addWelcomeMessage(container) {
    const msg = `👋 **Hello! I'm StadiumIQ**, your AI match companion for FIFA World Cup 2026!\n\nI can help you with navigation, food, transport, accessibility, and live match info — in 50+ languages. What do you need?`;
    addMessage(container, 'ai', msg);
  }

  function addMessage(container, role, text, streaming = false) {
    const msgs = container.querySelector('#chat-messages');
    const wrap = document.createElement('div');
    wrap.className = `chat-message ${role}`;

    const avatar = role === 'ai'
      ? `<div class="chat-avatar ai-avatar">🤖</div>`
      : `<div class="chat-avatar user-avatar">👤</div>`;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.id = streaming ? 'streaming-bubble' : '';
    bubble.innerHTML = `<span class="bubble-text">${window.Utils.renderMarkdown(text)}</span><span class="bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;

    wrap.innerHTML = avatar;
    wrap.appendChild(bubble);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;

    conversationHistory.push({ role, text });
    return bubble;
  }

  function showTypingIndicator(container) {
    const msgs = container.querySelector('#chat-messages');
    const wrap = document.createElement('div');
    wrap.className = 'chat-message ai';
    wrap.id = 'typing-indicator';
    wrap.innerHTML = `
      <div class="chat-avatar ai-avatar">🤖</div>
      <div class="chat-bubble ai">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTypingIndicator(container) {
    container.querySelector('#typing-indicator')?.remove();
  }

  async function sendMessage(container, text) {
    if (!text.trim()) return;

    const input = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#send-btn');
    input.value = '';
    sendBtn.disabled = true;

    addMessage(container, 'user', text);
    showTypingIndicator(container);

    try {
      await window.GeminiClient.chat('fan', text, null);
      removeTypingIndicator(container);

      const lang = window.i18n.current;
      let response = await window.GeminiClient.chat('fan', text);

      // For non-English, add a translation note
      if (lang !== 'en') {
        const langData = window.i18n.supported.find(l => l.code === lang);
        response = `${response}\n\n---\n*${langData?.flag} Responding in your language: ${langData?.name}*`;
      }

      const bubble = addMessage(container, 'ai', '', true);
      const bubbleText = bubble.querySelector('.bubble-text');

      // Streaming simulation
      const words = response.split(' ');
      let rendered = '';
      for (const word of words) {
        rendered += (rendered ? ' ' : '') + word;
        bubbleText.innerHTML = window.Utils.renderMarkdown(rendered);
        await new Promise(r => setTimeout(r, 25));
        container.querySelector('#chat-messages').scrollTop = 999999;
      }
      bubble.id = '';

    } catch (err) {
      removeTypingIndicator(container);
      addMessage(container, 'ai', '⚠️ Connection issue. Please try again.');
    } finally {
      sendBtn.disabled = false;
    }
  }

  function attachEvents(container) {
    const input = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#send-btn');

    sendBtn.addEventListener('click', () => sendMessage(container, input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(container, input.value);
      }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    container.querySelector('#lang-selector').addEventListener('change', e => {
      window.i18n.setLanguage(e.target.value);
      const lang = window.i18n.supported.find(l => l.code === e.target.value);
      window.Toast.info(`Language changed to ${lang?.flag} ${lang?.name}`);
    });

    container.querySelector('#voice-toggle').addEventListener('click', () => toggleVoice(container));

    container.querySelectorAll('.quick-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => sendMessage(container, chip.dataset.msg));
    });
  }

  function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  }

  function toggleVoice(container) {
    const btn = container.querySelector('#voice-toggle');
    const input = container.querySelector('#chat-input');

    if (!recognition) {
      window.Toast.warning('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      isListening = false;
      btn.innerHTML = '🎙️';
      btn.style.color = '';
      return;
    }

    isListening = true;
    btn.innerHTML = '<div class="waveform"><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div></div>';
    btn.style.color = 'var(--accent-red)';

    recognition.onresult = e => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      input.value = transcript;
    };
    recognition.onend = () => {
      isListening = false;
      btn.innerHTML = '🎙️';
      btn.style.color = '';
      if (input.value.trim()) sendMessage(container, input.value);
    };
    recognition.start();
  }

  return { init };
})();

window.FanAssistant = FanAssistant;
