/* ============================================================
   StadiumIQ 2026 — Venue Data & i18n Utilities
   ============================================================ */

// ── Venue Database ─────────────────────────────────────────
const VenueData = {
  venues: [
    { id: 'metlife', name: 'MetLife Stadium', city: 'East Rutherford, NJ', country: 'USA', capacity: 82500, flag: '🇺🇸' },
    { id: 'sofi',    name: 'SoFi Stadium',    city: 'Inglewood, CA',       country: 'USA', capacity: 70240, flag: '🇺🇸' },
    { id: 'atandt',  name: 'AT&T Stadium',    city: 'Arlington, TX',       country: 'USA', capacity: 80000, flag: '🇺🇸' },
    { id: 'azteca',  name: 'Estadio Azteca',  city: 'Mexico City',         country: 'MEX', capacity: 87523, flag: '🇲🇽' },
    { id: 'bmo',     name: 'BMO Field',       city: 'Toronto',             country: 'CAN', capacity: 45750, flag: '🇨🇦' },
    { id: 'bcplace', name: 'BC Place',        city: 'Vancouver',           country: 'CAN', capacity: 54500, flag: '🇨🇦' },
  ],

  // MetLife Stadium Floor Plan (simplified grid)
  metlifeMap: {
    gates: ['A','B','C','D','E','F','G','H'],
    sections: Array.from({length: 40}, (_,i) => `Section ${100 + i}`),
    services: [
      { name: 'First Aid Station', icon: '🏥', locations: ['Gate B L1', 'Gate E L2', 'Gate G L1'] },
      { name: 'Halal Food Court', icon: '🥙', locations: ['Zone 3 Gate F', 'Kiosk H12 L2'] },
      { name: 'Vegetarian Zone', icon: '🥗', locations: ['Zone 2 Gate C', 'Zone 5 Gate H'] },
      { name: 'ATM/Cash', icon: '💳', locations: ['Gate A L1', 'Gate C L1', 'Gate F L2'] },
      { name: 'Lost & Found', icon: '🔍', locations: ['Gate A Info Desk'] },
      { name: 'Prayer Room', icon: '🕌', locations: ['Level 3, Section 225'] },
      { name: 'Nursing Room', icon: '👶', locations: ['Gate D L1', 'Gate G L2'] },
      { name: 'Accessible Restroom', icon: '♿', locations: ['All gates, Level 1'] },
      { name: 'Fan Store', icon: '🛍️', locations: ['Gate A Mega Store', 'Gate D Mini Store'] },
      { name: 'WiFi Zone', icon: '📶', locations: ['All concourses — StadiumIQ_FIFA2026'] },
    ],
    elevators: ['Gate A L1', 'Gate C L1', 'Gate E L1', 'Gate G L1'],
    accessibleRoutes: {
      'Gate A': 'Wheelchair ramp at Gate A South, elevator to all levels',
      'Gate C': 'Level entrance, no steps. Elevator at concourse center',
      'Gate E': 'Direct level access. Companion seating blocks 110–115',
    }
  }
};

// ── i18n Language Support ──────────────────────────────────
const i18n = {
  supported: [
    { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
    { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
    { code: 'pt', name: 'Português', flag: '🇧🇷', dir: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
    { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱', dir: 'ltr' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱', dir: 'ltr' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', dir: 'ltr' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰', dir: 'rtl' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  ],

  current: 'en',

  strings: {
    en: {
      welcome: 'Welcome to StadiumIQ 2026',
      assistant: 'AI Assistant',
      navigation: 'Navigation',
      transport: 'Transport',
      matchday: 'Matchday',
      crowd: 'Crowd Intel',
      accessibility: 'Accessibility',
      sustainability: 'Sustainability',
      incident: 'Incidents',
      decision: 'Decision Support',
      translate: 'Translate',
      ask_anything: 'Ask anything...',
      typing: 'StadiumIQ is thinking...',
      live: 'LIVE',
      safe: 'SAFE',
      warning: 'WARNING',
      critical: 'CRITICAL',
    },
    es: {
      welcome: 'Bienvenido a StadiumIQ 2026',
      assistant: 'Asistente IA',
      navigation: 'Navegación',
      transport: 'Transporte',
      matchday: 'Día del Partido',
      crowd: 'Multitud',
      accessibility: 'Accesibilidad',
      sustainability: 'Sostenibilidad',
      incident: 'Incidentes',
      decision: 'Apoyo Decisión',
      translate: 'Traducir',
      ask_anything: 'Pregunta lo que quieras...',
      typing: 'StadiumIQ está pensando...',
      live: 'EN VIVO',
      safe: 'SEGURO',
      warning: 'ALERTA',
      critical: 'CRÍTICO',
    },
    ar: {
      welcome: 'مرحباً بكم في StadiumIQ 2026',
      assistant: 'المساعد الذكي',
      ask_anything: 'اسأل أي شيء...',
      typing: 'StadiumIQ يفكر...',
      live: 'مباشر',
    },
    ja: {
      welcome: 'StadiumIQ 2026へようこそ',
      assistant: 'AIアシスタント',
      ask_anything: '何でも聞いてください...',
      typing: 'StadiumIQが考えています...',
      live: 'ライブ',
    },
    fr: {
      welcome: 'Bienvenue sur StadiumIQ 2026',
      assistant: 'Assistant IA',
      ask_anything: 'Posez une question...',
      typing: 'StadiumIQ réfléchit...',
      live: 'EN DIRECT',
    },
    pt: {
      welcome: 'Bem-vindo ao StadiumIQ 2026',
      assistant: 'Assistente IA',
      ask_anything: 'Pergunte qualquer coisa...',
      typing: 'StadiumIQ está pensando...',
      live: 'AO VIVO',
    },
  },

  t(key) {
    const lang = this.strings[this.current] || this.strings.en;
    return lang[key] || this.strings.en[key] || key;
  },

  setLanguage(code) {
    this.current = code;
    const langData = this.supported.find(l => l.code === code);
    if (langData?.dir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    document.dispatchEvent(new CustomEvent('languageChange', { detail: { code, langData } }));
  },

  getLangOptions() {
    return this.supported.map(l => `<option value="${l.code}" ${l.code === this.current ? 'selected' : ''}>${l.flag} ${l.name}</option>`).join('');
  }
};

// ── Toast Notification Utility ─────────────────────────────
const Toast = {
  container: null,
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  show(message, type = 'info', duration = 4000) {
    if (!this.container) this.init();
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg)    { this.show(msg, 'info'); },
};

// ── Format Utilities ───────────────────────────────────────
const Utils = {
  formatNumber(n) { return n?.toLocaleString() ?? '—'; },
  formatPct(val, total) { return total ? `${Math.round((val / total) * 100)}%` : '0%'; },
  timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  },
  renderMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
      .replace(/^#{1,3} (.+)$/gm, '<strong style="font-size:1.05em">$1</strong>');
  },
  getStatusColor(pct) {
    if (pct < 0.5) return 'var(--accent-green)';
    if (pct < 0.75) return 'var(--accent-gold)';
    if (pct < 0.9) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  },
};

window.VenueData = VenueData;
window.i18n = i18n;
window.Toast = Toast;
window.Utils = Utils;
