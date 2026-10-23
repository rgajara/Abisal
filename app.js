/* ===========================================================
   Abisal · Trivia de rareza offline (PWA) · v3 · ES / EN
   7 preguntas por inmersión · una oportunidad por pregunta
   =========================================================== */
'use strict';

(() => {
  const G = window.AbisalGen;

  const CONFIG = {
    ROUNDS: 7,
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
      daily: 'Reto del día',
      homeTitle: '¿Hasta dónde llegarás hoy?',
      rulesIntro: 'Da una respuesta <strong>correcta</strong>, pero lo más <strong>rara</strong> posible. Cuanto más inusual, más profundo desciendes.',
      rule1: '<b>7</b> preguntas distintas, <b>25 s</b> cada una',
      rule2: '<b>Una sola oportunidad</b> por pregunta: piensa bien antes de enviar',
      rule3: 'Respuesta inválida o fuera de tiempo = <b>0 m</b>',
      rule4: 'Muchas preguntas aceptan respuestas en español o inglés',
      record: 'Récord', today: 'Hoy', streak: 'Racha', bestToday: 'Mejor hoy', games: 'Partidas',
      startDaily: 'Sumergirse ↓', startRandom: 'Aleatoria 🎲',
      nextQ: 'Nuevo reto en', bank: '{n} preguntas en el banco',
      dive: 'Pregunta', placeholder: 'Tu respuesta más rara…', answerAria: 'Tu respuesta', send: 'Enviar respuesta', progressAria: 'Progreso',
      next: 'Siguiente →', seeResults: 'Ver resultado 🌊',
      verdictGood: '✓ {x} · {tier} · +{m} m', verdictBad: '✗ «{x}» no es válida · 0 m', verdictTime: '⏱ Se acabó el tiempo · 0 m',
      revealBest: '🔦 Lo más profundo era «{x}» ({m} m)', revealTop: '🏆 ¡Era la respuesta más profunda posible!',
      resultTitle: 'Resultado de la inmersión', yourAnswers: 'Tus respuestas',
      retryDaily: 'Repetir el reto', retryRandom: 'Otra ronda aleatoria 🎲', share: 'Compartir', home: 'Inicio',
      newRecord: '★ Nuevo récord personal',
      noAnswer: 'Sin respuesta', timeUp: 'Tiempo agotado', invalidTag: 'No válida',
      rarity: 'Rareza: {x}', noAnswers: 'Sin respuestas válidas',
      deepestYou: '🔦 Tu respuesta más profunda: «{x}» ({m} m).', noneValid: '🔦 Esta vez no hubo respuestas válidas. ¡Inténtalo de nuevo!',
      copied: 'Resultado copiado al portapapeles', shareFail: 'No se pudo compartir',
      newDay: '🌊 ¡Nuevo reto del día!', updated: '✨ {n} preguntas nuevas descargadas',
      modeDaily: 'Reto diario', modeRandom: 'Aleatoria',
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
      daily: 'Daily challenge',
      homeTitle: 'How deep will you go today?',
      rulesIntro: 'Give a <strong>correct</strong> answer, but as <strong>rare</strong> as possible. The more unusual, the deeper you dive.',
      rule1: '<b>7</b> different questions, <b>25 s</b> each',
      rule2: '<b>One chance only</b> per question: think before you send',
      rule3: 'Invalid answer or time out = <b>0 m</b>',
      rule4: 'Many questions accept answers in Spanish or English',
      record: 'Best', today: 'Today', streak: 'Streak', bestToday: 'Best today', games: 'Games',
      startDaily: 'Dive in ↓', startRandom: 'Random 🎲',
      nextQ: 'New challenge in', bank: '{n} questions in the bank',
      dive: 'Question', placeholder: 'Your rarest answer…', answerAria: 'Your answer', send: 'Send answer', progressAria: 'Progress',
      next: 'Next →', seeResults: 'See result 🌊',
      verdictGood: '✓ {x} · {tier} · +{m} m', verdictBad: '✗ “{x}” is not valid · 0 m', verdictTime: "⏱ Time's up · 0 m",
      revealBest: '🔦 The deepest answer was “{x}” ({m} m)', revealTop: '🏆 That was the deepest answer possible!',
      resultTitle: 'Dive result', yourAnswers: 'Your answers',
      retryDaily: 'Replay the challenge', retryRandom: 'Another random round 🎲', share: 'Share', home: 'Home',
      newRecord: '★ New personal best',
      noAnswer: 'No answer', timeUp: 'Time ran out', invalidTag: 'Not valid',
      rarity: 'Rarity: {x}', noAnswers: 'No valid answers',
      deepestYou: '🔦 Your deepest answer: “{x}” ({m} m).', noneValid: '🔦 No valid answers this time. Try again!',
      copied: 'Result copied to clipboard', shareFail: 'Could not share',
      newDay: '🌊 New daily challenge!', updated: '✨ {n} new questions downloaded',
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

  // Rareza por respuesta (máx. ~1570 m por pregunta)
  const TIERS = [
    { id: 'legendaria', min: 1050, emoji: '🟨' },
    { id: 'muyrara',    min: 520,  emoji: '🟪' },
    { id: 'rara',       min: 220,  emoji: '🟩' },
    { id: 'poco',       min: 70,   emoji: '🟦' },
    { id: 'comun',      min: 0,    emoji: '⬜' },
  ];
  const ZONE_MINS = [6000, 4000, 1000, 200, 0];

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const el = {};
  [
    'dateLabel', 'langToggle', 'homeCats', 'statBest', 'statToday', 'statStreak',
    'btnDaily', 'btnRandom', 'countdown', 'bankInfo',
    'roundNum', 'roundTotal', 'timerRow', 'timerBar', 'timerText', 'gameCategory', 'gameQuestion',
    'sonar', 'zoneName', 'depthValue', 'gaugeDiver', 'answerList', 'answerForm', 'answerInput',
    'reveal', 'revealVerdict', 'revealBest', 'btnNext',
    'resultMeters', 'resultZone', 'resultRarity', 'newRecord', 'summaryList', 'deepestHint',
    'resBest', 'resToday', 'resGames', 'btnRetry', 'btnShare', 'btnHome', 'toast', 'bubbles',
  ].forEach((id) => { el[id] = $(id); });

  // ---------- Estado ----------
  const state = {
    lang: 'es',
    ready: false,
    curatedRaw: [],
    pool: { gen: [], curated: [] },
    dailySet: [],
    set: [],
    current: null,
    mode: 'daily',
    dateKey: '',
    phase: 'home',
    round: 0,
    total: 0,
    results: [],
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

    // 1) coincidencia exacta (incluye plurales)
    for (const ans of q.answers) if (exact.some((k) => ans.keys.has(k))) return ans;

    // 2) femenino → masculino (doctora → doctor)
    if (base.length > 4 && base.endsWith('a')) {
      const variants = [base.slice(0, -1), base.slice(0, -1) + 'o'];
      for (const ans of q.answers) if (variants.some((k) => ans.keys.has(k))) return ans;
    }

    // 3) errores de tipeo: solo palabras de 6+ letras, mismas 2 primeras letras
    if (base.length < 6) return null;
    const tol = base.length >= 10 ? 2 : 1;
    let best = null; let bestD = Infinity;
    for (const ans of q.answers) {
      for (const k of ans.keys) {
        if (k.slice(0, 2) !== base.slice(0, 2)) continue;
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

  const loadRecent = () => storage.get(CONFIG.RECENT_KEY, []);
  function pushRecent(ids) {
    storage.set(CONFIG.RECENT_KEY, [...ids, ...loadRecent().filter((x) => !ids.includes(x))].slice(0, 120));
  }

  /** Elige 7 preguntas distintas, intentando no repetir categoría */
  function pickSet(mode) {
    const { gen, curated } = state.pool;
    const r = mode === 'daily' ? G.rng(localDayNumber() * 7919 + 13) : Math.random;
    const recent = mode === 'random' ? new Set(loadRecent()) : new Set();
    const pCurated = curated.length ? 0.35 : 0;
    const chosen = []; const ids = new Set(); const cats = new Set();

    for (let i = 0; i < 3000 && chosen.length < CONFIG.ROUNDS; i++) {
      const list = r() < pCurated ? curated : gen;
      const q = list[Math.floor(r() * list.length)];
      if (!q || ids.has(q.id)) continue;
      if (i < 2000 && recent.has(q.id)) continue;
      if (i < 1000 && cats.has(q.category)) continue;
      chosen.push(q); ids.add(q.id); cats.add(q.category);
    }
    return chosen;
  }

  // ---------- Récords ----------
  const defaultRecords = () => ({ best: { meters: 0, date: null }, days: {}, games: 0, streak: 0, lastPlayed: null });
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
      const day = r.days[today] || { best: 0, plays: 0 };
      day.plays += 1;
      day.best = Math.max(day.best, total);
      r.days[today] = day;
      const keys = Object.keys(r.days).sort();
      keys.slice(0, Math.max(0, keys.length - 90)).forEach((k) => delete r.days[k]);
    }

    const isRecord = total > 0 && total > r.best.meters;
    if (isRecord) r.best = { meters: total, date: today };

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
    el.homeCats.textContent = [...new Set(state.dailySet.map((q) => q.category))].join(' · ');
    el.dateLabel.textContent = new Date().toLocaleDateString(L().locale, { weekday: 'short', day: 'numeric', month: 'short' });

    const r = loadRecords();
    el.statBest.textContent = `${fmt(r.best.meters)} m`;
    el.statToday.textContent = `${fmt(r.days[state.dateKey]?.best || 0)} m`;
    el.statStreak.textContent = currentStreak(r);
    el.bankInfo.textContent = t('bank', { n: fmt(state.pool.gen.length + state.pool.curated.length) });
  }

  function applyDaily() {
    state.dateKey = localDateKey();
    state.dailySet = pickSet('daily');
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
    state.set = mode === 'daily' ? state.dailySet : pickSet('random');
    if (mode === 'random') pushRecent(state.set.map((q) => q.id));

    Object.assign(state, { phase: 'game', round: 0, total: 0, results: [], locked: false });

    el.roundTotal.textContent = state.set.length;
    el.depthValue.textContent = '0';
    el.answerList.replaceChildren(...state.set.map(() => h('li', 'dot')));
    setDepthVisual(0);
    showScreen('game');

    startRound();
    el.answerInput.focus();
  }

  function startRound() {
    state.round += 1;
    state.current = state.set[state.round - 1];
    state.locked = false;

    el.roundNum.textContent = state.round;
    el.gameCategory.textContent = `${t(state.mode === 'daily' ? 'modeDaily' : 'modeRandom')} · ${state.current.category}`;
    el.gameQuestion.textContent = state.current.prompt;
    [...el.answerList.children].forEach((d, i) => d.classList.toggle('is-current', i === state.round - 1));

    el.answerInput.value = '';
    el.answerInput.readOnly = false;
    el.answerForm.hidden = false;
    el.btnNext.hidden = true;
    el.reveal.hidden = true;

    state.deadline = performance.now() + CONFIG.ROUND_SECONDS * 1000;
    cancelAnimationFrame(state.raf);
    tickTimer();
  }

  function tickTimer() {
    const left = Math.max(0, state.deadline - performance.now());
    el.timerBar.style.transform = `scaleX(${left / (CONFIG.ROUND_SECONDS * 1000)})`;
    el.timerText.textContent = Math.ceil(left / 1000);
    el.timerRow.classList.toggle('is-danger', left <= CONFIG.DANGER_SECONDS * 1000);
    if (left <= 0) { endRound(null, ''); return; }
    state.raf = requestAnimationFrame(tickTimer);
  }

  function onSubmit(e) {
    e.preventDefault();
    if (state.phase !== 'game' || state.locked) return;
    const raw = el.answerInput.value.trim();
    if (!raw) return;
    endRound(findAnswer(state.current, raw), raw);
  }

  /** Una sola oportunidad: válida o no, la pregunta se cierra */
  function endRound(ans, raw) {
    if (state.locked) return;
    state.locked = true;
    cancelAnimationFrame(state.raf);
    el.answerInput.readOnly = true;
    el.answerInput.blur();

    const meters = ans ? ans.meters : 0;
    const tier = ans ? tierFor(meters) : null;
    const status = ans ? 'ok' : (raw ? 'bad' : 'time');
    state.results.push({ prompt: state.current.prompt, text: ans ? ans.text : null, raw, meters, tier, status });

    const from = state.total;
    state.total += meters;

    const dot = el.answerList.children[state.round - 1];
    if (dot) dot.className = `dot ${tier ? `tier-${tier.id}` : 'tier-none'}`;

    // Veredicto
    if (status === 'ok') {
      el.revealVerdict.textContent = t('verdictGood', { x: ans.text, tier: tierName(tier), m: fmt(meters) });
      el.revealVerdict.className = `reveal__verdict is-good tier-${tier.id}`;
      dive(from, state.total, meters, tier);
    } else {
      el.revealVerdict.textContent = status === 'bad' ? t('verdictBad', { x: raw }) : t('verdictTime');
      el.revealVerdict.className = 'reveal__verdict is-bad';
      restartAnimation(el.answerForm, 'shake');
    }

    // La respuesta más profunda posible
    const deepest = state.current.answers.reduce((a, b) => (b.meters > a.meters ? b : a));
    el.revealBest.textContent = ans && ans.id === deepest.id
      ? t('revealTop')
      : t('revealBest', { x: deepest.text, m: fmt(deepest.meters) });

    el.reveal.hidden = false;
    el.answerForm.hidden = true;
    el.btnNext.textContent = state.round < state.set.length ? t('next') : t('seeResults');
    el.btnNext.hidden = false;
    el.btnNext.focus({ preventScroll: true });
  }

  function nextStep() {
    if (state.phase !== 'game' || !state.locked) return;
    if (state.round < state.set.length) {
      startRound();
      el.answerInput.focus();
    } else {
      finishDive();
    }
  }

  function dive(from, to, gain, tier) {
    animateNumber(el.depthValue, from, to, 1200);
    setDepthVisual(to);
    const float = h('span', `float-gain tier-${tier.id}`, `+${fmt(gain)} m`);
    float.addEventListener('animationend', () => float.remove());
    el.sonar.append(float);
    restartAnimation(el.sonar, 'is-diving');
    if (navigator.vibrate) navigator.vibrate(tier.min >= 520 ? [20, 40, 20] : 25);
  }

  function finishDive() {
    state.phase = 'results';
    document.body.classList.remove('in-game');

    const total = state.total;
    const { records, isRecord } = registerResult(total);

    el.resultMeters.textContent = '0';
    animateNumber(el.resultMeters, 0, total, 1400);

    const zone = zoneFor(total);
    el.resultZone.textContent = `${zone.name} · ${zone.desc}`;

    const valid = state.results.filter((r) => r.status === 'ok');
    const rarity = valid.length ? tierFor(total / state.set.length) : null;
    el.resultRarity.textContent = rarity ? t('rarity', { x: tierName(rarity) }) : t('noAnswers');
    el.resultRarity.className = `rarity-pill ${rarity ? `tier-${rarity.id}` : 'tier-none'}`;
    el.newRecord.hidden = !isRecord;

    el.summaryList.replaceChildren(...state.results.map((r) => {
      const li = h('li', r.tier ? `tier-${r.tier.id}` : 'tier-none');
      const info = h('div');
      const label = r.status === 'ok' ? r.text : (r.status === 'bad' ? `«${r.raw}»` : t('noAnswer'));
      const tag = r.status === 'ok' ? tierName(r.tier) : (r.status === 'bad' ? t('invalidTag') : t('timeUp'));
      info.append(h('strong', '', label), h('span', 'summary__q', r.prompt), h('span', 'summary__tier', tag));
      li.append(info, h('span', 'summary__m', `${fmt(r.meters)} m`));
      return li;
    }));

    const best = valid.reduce((a, b) => (!a || b.meters > a.meters ? b : a), null);
    el.deepestHint.textContent = best ? t('deepestYou', { x: best.text, m: fmt(best.meters) }) : t('noneValid');

    el.resBest.textContent = `${fmt(records.best.meters)} m`;
    el.resToday.textContent = `${fmt(records.days[state.dateKey]?.best || 0)} m`;
    el.resGames.textContent = fmt(records.games);
    el.btnRetry.textContent = t(state.mode === 'daily' ? 'retryDaily' : 'retryRandom');

    showScreen('results');
    if (isRecord && navigator.vibrate) navigator.vibrate([30, 60, 30, 60, 80]);
  }

  async function share() {
    const zone = zoneFor(state.total);
    const squares = state.results.map((r) => (r.tier ? r.tier.emoji : '⬛')).join('');
    const mode = state.mode === 'random' ? t('modeRandom') : t('modeDaily');
    const text = `Abisal · ${state.dateKey} · ${mode}\n🌊 ${fmt(state.total)} m · ${zone.name}\n${squares}`;
    const url = location.href.split('#')[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Abisal', text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast(t('copied'));
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') toast(t('shareFail'));
    }
  }

  // ---------- Reloj / medianoche ----------
  function updateClock() {
    el.countdown.textContent = hms(msToMidnight());
    if (state.ready && localDateKey() !== state.dateKey && state.phase !== 'game') {
      applyDaily();
      toast(t('newDay'));
    }
  }

  function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) updateClock(); });
    window.addEventListener('focus', updateClock);
  }

  // ---------- Decoración ----------
  function spawnBubbles() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const count = window.innerWidth < 600 ? 14 : 24;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const b = h('span', 'bubble');
      const size = 4 + Math.random() * 12;
      b.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;` +
        `animation-duration:${10 + Math.random() * 14}s;animation-delay:${-Math.random() * 20}s;` +
        `--drift:${(Math.random() * 40 - 20).toFixed(1)}px;`;
      frag.append(b);
    }
    el.bubbles.append(frag);
  }

  function setTouchIcon() {
    try {
      const size = 180;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const x = c.getContext('2d');
      x.scale(size / 512, size / 512);
      const bg = x.createLinearGradient(0, 0, 0, 512);
      bg.addColorStop(0, '#0F2A38'); bg.addColorStop(1, '#05090D');
      x.fillStyle = bg; x.fillRect(0, 0, 512, 512);
      const ln = x.createLinearGradient(0, 100, 0, 440);
      ln.addColorStop(0, '#22E3F2'); ln.addColorStop(1, '#3DFFB4');
      x.strokeStyle = ln; x.lineCap = 'round'; x.lineJoin = 'round';
      x.lineWidth = 18; x.beginPath(); x.arc(256, 220, 110, 0, Math.PI * 2); x.stroke();
      x.globalAlpha = 0.45; x.lineWidth = 10; x.beginPath(); x.arc(256, 220, 62, 0, Math.PI * 2); x.stroke();
      x.globalAlpha = 1; x.lineWidth = 30;
      x.beginPath(); x.moveTo(176, 352); x.lineTo(256, 432); x.lineTo(336, 352); x.stroke();
      [[380, 120, 14, '#9B8CFF'], [410, 170, 8, '#22E3F2'], [120, 140, 10, '#3DFFB4']].forEach(([cx, cy, r, col]) => {
        x.globalAlpha = 0.75; x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
      });
      const link = document.getElementById('apple-icon');
      if (link) link.href = c.toDataURL('image/png');
    } catch { /* se queda el SVG */ }
  }

  function registerSW() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' })
        .catch((err) => console.warn('[Abisal] SW no registrado:', err));
    });
  }

  // ---------- Inicio ----------
  async function init() {
    spawnBubbles();
    setTouchIcon();
    registerSW();

    el.btnDaily.addEventListener('click', () => startDive('daily'));
    el.btnRandom.addEventListener('click', () => startDive('random'));
    el.btnRetry.addEventListener('click', () => startDive(state.mode));
    el.btnNext.addEventListener('click', nextStep);
    el.btnHome.addEventListener('click', goHome);
    el.btnShare.addEventListener('click', share);
    el.answerForm.addEventListener('submit', onSubmit);
    el.langToggle.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-lang]');
      if (b) setLang(b.dataset.lang);
    });
    // Enter para pasar a la siguiente pregunta
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && state.phase === 'game' && state.locked && !el.btnNext.hidden) {
        e.preventDefault();
        nextStep();
      }
    });

    setLang(detectLang());

    state.curatedRaw = await loadCurated();
    state.ready = true;
    buildPools();
    applyDaily();
    el.btnDaily.disabled = false;
    el.btnRandom.disabled = false;
    startClock();

    const prev = storage.get(CONFIG.CURATED_COUNT_KEY, 0);
    const now = state.curatedRaw.length;
    if (prev && now > prev) toast(t('updated', { n: now - prev }));
    if (now) storage.set(CONFIG.CURATED_COUNT_KEY, now);
  }

  init();
})();
