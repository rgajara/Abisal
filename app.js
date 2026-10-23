/* ===========================================================
   Abisal · Trivia de rareza offline (PWA) · v2 · ES / EN
   =========================================================== */
'use strict';

(() => {
  const G = window.AbisalGen;

  const CONFIG = {
    ROUNDS: 3,
    ROUND_SECONDS: 25,
    DANGER_SECONDS: 5,
    MAX_DEPTH: 11000,
    DATA_URL: './questions.json',
    STORAGE_KEY: 'abisal.records.v1',
    LANG_KEY: 'abisal.lang',
    RECENT_KEY: 'abisal.recent',
    CURATED_COUNT_KEY: 'abisal.curatedCount',
  };

  // ---------- Textos ES / EN ----------
  const I18N = {
    es: {
      locale: 'es-ES',
      docTitle: 'Abisal · Trivia de rareza',
      langAria: 'Idioma',
      daily: 'Pregunta del día',
      rulesIntro: 'Da una respuesta <strong>correcta</strong>, pero lo más <strong>rara</strong> posible. Cuanto más inusual, más profundo desciendes.',
      rule1: '<b>3</b> inmersiones de <b>25 s</b> cada una',
      rule2: 'Las respuestas inválidas no penalizan: sigue intentando',
      rule3: 'No puedes repetir respuestas',
      rule4: 'Muchas preguntas aceptan respuestas en español o inglés',
      record: 'Récord', today: 'Hoy', streak: 'Racha', bestToday: 'Mejor hoy', games: 'Partidas',
      startDaily: 'Sumergirse ↓', startRandom: 'Aleatoria 🎲',
      nextQ: 'Nueva pregunta del día en', bank: '{n} preguntas en el banco',
      dive: 'Inmersión', placeholder: 'Tu respuesta más rara…', answerAria: 'Tu respuesta', send: 'Enviar respuesta', answersAria: 'Respuestas dadas',
      resultTitle: 'Resultado de la inmersión', yourAnswers: 'Tus respuestas',
      retryDaily: 'Volver a sumergirse', retryRandom: 'Otra aleatoria 🎲', share: 'Compartir', home: 'Inicio',
      newRecord: '★ Nuevo récord personal',
      invalid: '«{x}» no es válida. ¡Sigue intentando!', used: 'Ya usaste «{x}». Prueba otra.',
      timeout: '⏱ Se acabó el tiempo · 0 m', noAnswer: 'Sin respuesta', timeUp: 'Tiempo agotado',
      rarity: 'Rareza: {x}', noAnswers: 'Sin respuestas',
      deepest: '🔦 La respuesta más profunda que no usaste: «{x}» ({m} m).', allDeep: '🔦 ¡Usaste las respuestas más profundas posibles!',
      copied: 'Resultado copiado al portapapeles', shareFail: 'No se pudo compartir',
      newDay: '🌊 ¡Nueva pregunta del día!', updated: '✨ {n} preguntas nuevas descargadas',
      modeDaily: 'Diaria', modeRandom: 'Aleatoria',
      tiers: { comun: 'Común', poco: 'Poco común', rara: 'Rara', muyrara: 'Muy rara', legendaria: 'Legendaria' },
      zones: [
        ['Zona Hadal', 'Las fosas más profundas. Pocos llegan aquí.'],
        ['Zona Abisopelágica', 'Presión aplastante y agua a 2 °C.'],
        ['Zona Batipelágica', 'Oscuridad total: solo bioluminiscencia.'],
        ['Zona Mesopelágica', 'El crepúsculo del océano.'],
        ['Zona Epipelágica', 'Todavía se ve la luz del sol.'],
      ],
    },
    en: {
      locale: 'en-US',
      docTitle: 'Abisal · Rare-answer trivia',
      langAria: 'Language',
      daily: 'Question of the day',
      rulesIntro: 'Give a <strong>correct</strong> answer, but as <strong>rare</strong> as possible. The more unusual, the deeper you dive.',
      rule1: '<b>3</b> dives, <b>25 s</b> each',
      rule2: 'Invalid answers cost nothing: keep trying',
      rule3: 'No repeated answers',
      rule4: 'Many questions accept answers in Spanish or English',
      record: 'Best', today: 'Today', streak: 'Streak', bestToday: 'Best today', games: 'Games',
      startDaily: 'Dive in ↓', startRandom: 'Random 🎲',
      nextQ: 'New daily question in', bank: '{n} questions in the bank',
      dive: 'Dive', placeholder: 'Your rarest answer…', answerAria: 'Your answer', send: 'Send answer', answersAria: 'Answers given',
      resultTitle: 'Dive result', yourAnswers: 'Your answers',
      retryDaily: 'Dive again', retryRandom: 'Another random 🎲', share: 'Share', home: 'Home',
      newRecord: '★ New personal best',
      invalid: '“{x}” is not valid. Keep trying!', used: 'You already used “{x}”. Try another.',
      timeout: "⏱ Time's up · 0 m", noAnswer: 'No answer', timeUp: 'Time ran out',
      rarity: 'Rarity: {x}', noAnswers: 'No answers',
      deepest: "🔦 The deepest answer you didn't use: “{x}” ({m} m).", allDeep: '🔦 You used the deepest answers possible!',
      copied: 'Result copied to clipboard', shareFail: 'Could not share',
      newDay: '🌊 New question of the day!', updated: '✨ {n} new questions downloaded',
      modeDaily: 'Daily', modeRandom: 'Random',
      tiers: { comun: 'Common', poco: 'Uncommon', rara: 'Rare', muyrara: 'Very rare', legendaria: 'Legendary' },
      zones: [
        ['Hadal Zone', 'The deepest trenches. Few make it here.'],
        ['Abyssal Zone', 'Crushing pressure and 2 °C water.'],
        ['Midnight Zone', 'Total darkness: only bioluminescence.'],
        ['Twilight Zone', "The ocean's twilight."],
        ['Sunlight Zone', 'You can still see sunlight.'],
      ],
    },
  };

  const TIERS = [
    { id: 'legendaria', min: 2400, emoji: '🟨' },
    { id: 'muyrara',    min: 1200, emoji: '🟪' },
    { id: 'rara',       min: 500,  emoji: '🟩' },
    { id: 'poco',       min: 150,  emoji: '🟦' },
    { id: 'comun',      min: 0,    emoji: '⬜' },
  ];
  const ZONE_MINS = [6000, 4000, 1000, 200, 0];

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const el = {};
  [
    'dateLabel', 'langToggle', 'homeCategory', 'homeQuestion', 'statBest', 'statToday', 'statStreak',
    'btnDaily', 'btnRandom', 'countdown', 'bankInfo',
    'roundNum', 'roundTotal', 'timerRow', 'timerBar', 'timerText', 'gameCategory', 'gameQuestion',
    'sonar', 'zoneName', 'depthValue', 'gaugeDiver', 'answerList', 'answerForm', 'answerInput', 'feedback',
    'resultMeters', 'resultZone', 'resultRarity', 'newRecord', 'summaryList', 'deepestHint',
    'resBest', 'resToday', 'resGames', 'btnRetry', 'btnShare', 'btnHome', 'toast', 'bubbles',
  ].forEach((id) => { el[id] = $(id); });

  // ---------- Estado ----------
  const state = {
    lang: 'es',
    ready: false,
    curatedRaw: [],
    pool: { gen: [], curated: [] },
    daily: null,
    current: null,
    mode: 'daily',
    dateKey: '',
    phase: 'home',
    round: 0,
    total: 0,
    results: [],
    used: new Set(),
    deadline: 0,
    raf: 0,
    locked: false,
  };

  const L = () => I18N[state.lang];
  const t = (key, vars = {}) =>
    Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), L()[key] ?? key);
  const tierFor = (m) => TIERS.find((x) => m >= x.min);
  const tierName = (tier) => L().tiers[tier.id];
  const zoneFor = (m) => {
    const [name, desc] = L().zones[ZONE_MINS.findIndex((z) => m >= z)];
    return { name, desc };
  };

  // ---------- Utilidades ----------
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (n) => new Intl.NumberFormat(L().locale).format(Math.round(n));

  const localDateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const localDayNumber = (d = new Date()) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return localDateKey(d); };
  const msToMidnight = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1) - n; };
  const hms = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return [s / 3600, (s % 3600) / 60, s % 60].map((v) => pad(Math.floor(v))).join(':');
  };

  function h(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function animateNumber(node, from, to, ms) {
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms);
      node.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  let toastTimer;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 2400);
  }

  function restartAnimation(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let diag = prev[0];
      prev[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = prev[j];
        prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
        diag = tmp;
      }
    }
    return prev[b.length];
  }

  const storage = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin espacio / privado */ } },
  };

  // ---------- Validación de respuestas ----------
  function findAnswer(q, raw) {
    const exact = G.toKeys(raw);
    const base = exact[0];
    if (!base) return null;

    // 1) coincidencia exacta (con variantes de plural)
    for (const ans of q.answers) if (exact.some((k) => ans.keys.has(k))) return ans;

    // 2) femenino → masculino (doctora → doctor)
    if (base.length > 4 && base.endsWith('a')) {
      const variants = [base.slice(0, -1), base.slice(0, -1) + 'o'];
      for (const ans of q.answers) if (variants.some((k) => ans.keys.has(k))) return ans;
    }

    // 3) tolerancia a errores de tipeo
    const tol = base.length >= 9 ? 2 : base.length >= 5 ? 1 : 0;
    if (!tol) return null;
    let best = null; let bestD = Infinity;
    for (const ans of q.answers) {
      for (const k of ans.keys) {
        if (Math.abs(k.length - base.length) > tol) continue;
        const d = levenshtein(k, base);
        if (d <= tol && d < bestD) { best = ans; bestD = d; }
      }
    }
    return best;
  }

  // ---------- Banco de preguntas ----------
  async function loadCurated() {
    try {
      const res = await fetch(CONFIG.DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data.questions) ? data.questions : [];
    } catch (err) {
      console.warn('[Abisal] questions.json no disponible; se usa solo el generador.', err);
      return [];
    }
  }

  /** Convierte una pregunta de questions.json al formato interno, en el idioma activo */
  function fromCurated(q, lang) {
    const pick = (v) => (typeof v === 'string' ? v : (v?.[lang] || v?.es || v?.en || ''));
    const list = (q.answers || []).map((a) => {
      if (typeof a === 'string') return { names: G.parseNames(a), meters: null };
      const alt = a.alt || [];
      return {
        names: { es: [a.es || a.text, ...alt].filter(Boolean), en: [a.en || a.text, ...alt].filter(Boolean) },
        meters: Number(a.meters) || null,
      };
    }).filter((a) => a.names.es.length || a.names.en.length);

    const n = list.length;
    return {
      id: `c:${q.id}`,
      source: 'curated',
      category: pick(q.category),
      prompt: pick(q.prompt),
      answers: list.map((a, i) => ({
        id: i,
        text: a.names[lang][0] || a.names.es[0] || a.names.en[0],
        meters: a.meters ?? G.metersFor(i, n),
        keys: G.keysOf([...a.names.es, ...a.names.en]),
      })),
    };
  }

  function buildPools() {
    const lang = state.lang;
    state.pool = {
      gen: G.buildPool(lang),
      curated: state.curatedRaw
        .filter((q) => q && q.id && q.prompt && Array.isArray(q.answers))
        .map((q) => fromCurated(q, lang))
        .filter((q) => q.prompt && q.answers.length >= 5),
    };
  }

  /** Pregunta del día: determinista según la fecha local */
  function pickDaily() {
    const { gen, curated } = state.pool;
    const r = G.rng(localDayNumber() * 7919 + 13);
    const useCurated = curated.length > 0 && r() < 0.5;
    const list = useCurated ? curated : gen;
    return list[Math.floor(r() * list.length)];
  }

  const loadRecent = () => storage.get(CONFIG.RECENT_KEY, []);
  function pushRecent(id) {
    storage.set(CONFIG.RECENT_KEY, [id, ...loadRecent().filter((x) => x !== id)].slice(0, 60));
  }

  function pickRandom() {
    const { gen, curated } = state.pool;
    const total = gen.length + curated.length;
    const pCurated = curated.length ? Math.max(0.3, curated.length / total) : 0;
    const recent = new Set(loadRecent());
    for (let i = 0; i < 40; i++) {
      const list = Math.random() < pCurated ? curated : gen;
      const q = list[Math.floor(Math.random() * list.length)];
      if (q && !recent.has(q.id) && q.id !== state.daily?.id) return q;
    }
    return gen[Math.floor(Math.random() * gen.length)];
  }

  // ---------- Récords ----------
  const defaultRecords = () => ({ best: { meters: 0, date: null, questionId: null }, days: {}, games: 0, streak: 0, lastPlayed: null });
  const loadRecords = () => ({ ...defaultRecords(), ...storage.get(CONFIG.STORAGE_KEY, {}) });
  const currentStreak = (r) => (r.lastPlayed === localDateKey() || r.lastPlayed === yesterdayKey() ? r.streak : 0);

  function registerResult(total) {
    const r = loadRecords();
    const today = state.dateKey;
    r.games += 1;

    if (state.mode === 'daily') {
      if (r.lastPlayed !== today) {
        r.streak = r.lastPlayed === yesterdayKey() ? r.streak + 1 : 1;
        r.lastPlayed = today;
      }
      const day = r.days[today] || { best: 0, plays: 0, questionId: state.current.id };
      day.plays += 1;
      day.best = Math.max(day.best, total);
      r.days[today] = day;
      const keys = Object.keys(r.days).sort();
      keys.slice(0, Math.max(0, keys.length - 90)).forEach((k) => delete r.days[k]);
    }

    const isRecord = total > 0 && total > r.best.meters;
    if (isRecord) r.best = { meters: total, date: today, questionId: state.current.id };

    storage.set(CONFIG.STORAGE_KEY, r);
    return { records: r, isRecord };
  }

  // ---------- Idioma ----------
  function applyStaticTexts() {
    document.documentElement.lang = state.lang;
    document.title = t('docTitle');
    document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach((n) => { n.innerHTML = t(n.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-ph]').forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-aria]').forEach((n) => { n.setAttribute('aria-label', t(n.dataset.i18nAria)); });
    el.langToggle.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  }

  function detectLang() {
    const saved = storage.get(CONFIG.LANG_KEY, null);
    if (I18N[saved]) return saved;
    return (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  }

  function setLang(lang) {
    if (state.phase === 'game') return;
    state.lang = I18N[lang] ? lang : 'es';
    storage.set(CONFIG.LANG_KEY, state.lang);
    applyStaticTexts();
    if (state.ready) {
      buildPools();
      applyDaily();
      if (state.phase === 'results') goHome();
    }
  }

  // ---------- Pantallas ----------
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('is-active', s.id === `screen-${name}`));
    document.body.classList.toggle('in-game', name === 'game');
    window.scrollTo(0, 0);
  }

  function setDepthVisual(meters) {
    const ratio = Math.min(meters / CONFIG.MAX_DEPTH, 1);
    document.documentElement.style.setProperty('--depth', ratio.toFixed(3));
    el.gaugeDiver.style.top = `${ratio * 100}%`;
    el.zoneName.textContent = zoneFor(meters).name;
  }

  function renderHome() {
    const q = state.daily;
    el.homeCategory.textContent = q.category;
    el.homeQuestion.textContent = q.prompt;
    el.dateLabel.textContent = new Date().toLocaleDateString(L().locale, { weekday: 'short', day: 'numeric', month: 'short' });

    const r = loadRecords();
    el.statBest.textContent = `${fmt(r.best.meters)} m`;
    el.statToday.textContent = `${fmt(r.days[state.dateKey]?.best || 0)} m`;
    el.statStreak.textContent = currentStreak(r);
    el.bankInfo.textContent = t('bank', { n: fmt(state.pool.gen.length + state.pool.curated.length) });
  }

  function applyDaily() {
    state.dateKey = localDateKey();
    state.daily = pickDaily();
    renderHome();
  }

  function goHome() {
    state.phase = 'home';
    setDepthVisual(0);
    renderHome();
    showScreen('home');
  }

  // ---------- Juego ----------
  function startDive(mode) {
    if (!state.ready) return;
    if (localDateKey() !== state.dateKey) applyDaily();

    state.mode = mode;
    state.current = mode === 'daily' ? state.daily : pickRandom();
    if (mode === 'random') pushRecent(state.current.id);

    Object.assign(state, { phase: 'game', round: 0, total: 0, results: [], locked: false });
    state.used.clear();

    el.roundTotal.textContent = CONFIG.ROUNDS;
    el.gameCategory.textContent = `${t(mode === 'daily' ? 'modeDaily' : 'modeRandom')} · ${state.current.category}`;
    el.gameQuestion.textContent = state.current.prompt;
    el.depthValue.textContent = '0';
    el.answerList.replaceChildren();
    setDepthVisual(0);
    showScreen('game');

    startRound();
    el.answerInput.focus();
  }

  function startRound() {
    state.round += 1;
    state.locked = false;
    el.roundNum.textContent = state.round;
    el.answerInput.value = '';
    el.answerInput.readOnly = false;
    setFeedback('', '');
    state.deadline = performance.now() + CONFIG.ROUND_SECONDS * 1000;
    cancelAnimationFrame(state.raf);
    tickTimer();
  }

  function tickTimer() {
    const left = Math.max(0, state.deadline - performance.now());
    el.timerBar.style.transform = `scaleX(${left / (CONFIG.ROUND_SECONDS * 1000)})`;
    el.timerText.textContent = Math.ceil(left / 1000);
    el.timerRow.classList.toggle('is-danger', left <= CONFIG.DANGER_SECONDS * 1000);
    if (left <= 0) { endRound(null); return; }
    state.raf = requestAnimationFrame(tickTimer);
  }

  function setFeedback(text, cls) {
    el.feedback.textContent = text;
    el.feedback.className = `feedback ${cls}`.trim();
  }

  function onSubmit(e) {
    e.preventDefault();
    if (state.phase !== 'game' || state.locked) return;
    const raw = el.answerInput.value.trim();
    if (!raw) return;

    const ans = findAnswer(state.current, raw);
    if (!ans) {
      setFeedback(t('invalid', { x: raw }), 'is-bad');
      restartAnimation(el.answerForm, 'shake');
      el.answerInput.select();
      return;
    }
    if (state.used.has(ans.id)) {
      setFeedback(t('used', { x: ans.text }), 'is-warn');
      restartAnimation(el.answerForm, 'shake');
      el.answerInput.select();
      return;
