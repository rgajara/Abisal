/* ===========================================================
   Abisal · Trivia de rareza offline (PWA) · v5 · ES / EN
   - 7 preguntas nuevas en cada inmersión (sin repetir)
   - Respuesta inválida: puedes seguir intentando hasta los 25 s
   - Historial para repetir inmersiones anteriores
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
    PLAYED_KEY: 'abisal.played',
    HISTORY_KEY: 'abisal.history',
    CURATED_COUNT_KEY: 'abisal.curatedCount',
    HISTORY_MAX: 60,
  };

  // ---------- Textos ES / EN ----------
  const I18N = {
    es: {
      locale: 'es-ES',
      docTitle: 'Abisal · Trivia de rareza',
      langAria: 'Idioma',
      newDive: 'Nueva inmersión',
      homeTitle: '¿Hasta dónde llegarás?',
      record: 'Récord', today: 'Hoy', streak: 'Racha', bestToday: 'Mejor hoy', games: 'Partidas',
      startDive: 'Sumergirse ↓', history: 'Inmersiones anteriores',
      bank: '{n} preguntas nuevas por descubrir',
      dive: 'Pregunta', placeholder: 'Tu respuesta más rara…', answerAria: 'Tu respuesta', send: 'Enviar respuesta', progressAria: 'Progreso',
      invalid: '«{x}» no es válida. ¡Sigue intentando!',
      next: 'Siguiente →', seeResults: 'Ver resultado 🌊',
      verdictGood: '✓ {x} · {tier} · +{m} m', verdictTime: '⏱ Se acabó el tiempo · 0 m',
      revealBest: '🔦 Lo más profundo era «{x}» ({m} m)', revealTop: '🏆 ¡Era la respuesta más profunda posible!',
      resultTitle: 'Resultado de la inmersión', yourAnswers: 'Tus respuestas',
      retryNew: 'Nueva inmersión ↓', retryReplay: 'Repetir otra vez', share: 'Compartir', home: 'Inicio',
      newRecord: '★ Nuevo récord personal',
      noAnswer: 'Sin respuesta válida', timeUp: 'Tiempo agotado',
      rarity: 'Rareza: {x}', noAnswers: 'Sin respuestas válidas',
      deepestYou: '🔦 Tu respuesta más profunda: «{x}» ({m} m).', noneValid: '🔦 Esta vez no hubo respuestas válidas. ¡Inténtalo de nuevo!',
      copied: 'Resultado copiado al portapapeles', shareFail: 'No se pudo compartir',
      updated: '✨ {n} preguntas nuevas descargadas',
      bankReset: '🔄 ¡Jugaste todo el banco! Las preguntas vuelven a empezar.',
      modeNew: 'Inmersión #{n}', modeReplay: 'Repetición #{n}',
      historyEmpty: 'Aún no tienes inmersiones guardadas. ¡Sumérgete!', back: '← Volver',
      missing: 'No se encontraron las preguntas de esa inmersión.',
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
      newDive: 'New dive',
      homeTitle: 'How deep will you go?',
      record: 'Best', today: 'Today', streak: 'Streak', bestToday: 'Best today', games: 'Games',
      startDive: 'Dive in ↓', history: 'Past dives',
      bank: '{n} new questions to discover',
      dive: 'Question', placeholder: 'Your rarest answer…', answerAria: 'Your answer', send: 'Send answer', progressAria: 'Progress',
      invalid: '“{x}” is not valid. Keep trying!',
      next: 'Next →', seeResults: 'See result 🌊',
      verdictGood: '✓ {x} · {tier} · +{m} m', verdictTime: "⏱ Time's up · 0 m",
      revealBest: '🔦 The deepest answer was “{x}” ({m} m)', revealTop: '🏆 That was the deepest answer possible!',
      resultTitle: 'Dive result', yourAnswers: 'Your answers',
      retryNew: 'New dive ↓', retryReplay: 'Replay again', share: 'Share', home: 'Home',
      newRecord: '★ New personal best',
      noAnswer: 'No valid answer', timeUp: 'Time ran out',
      rarity: 'Rarity: {x}', noAnswers: 'No valid answers',
      deepestYou: '🔦 Your deepest answer: “{x}” ({m} m).', noneValid: '🔦 No valid answers this time. Try again!',
      copied: 'Result copied to clipboard', shareFail: 'Could not share',
      updated: '✨ {n} new questions downloaded',
      bankReset: '🔄 You played the whole bank! Questions start over.',
      modeNew: 'Dive #{n}', modeReplay: 'Replay #{n}',
      historyEmpty: 'No saved dives yet. Dive in!', back: '← Back',
      missing: "Couldn't find that dive's questions.",
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
    'dateLabel', 'langToggle', 'homeCats', 'statBest', 'statToday', 'statStreak', 'btnPlay', 'btnHistory', 'bankInfo',
    'roundNum', 'roundTotal', 'timerRow', 'timerBar', 'timerText', 'gameCategory', 'gameQuestion',
    'sonar', 'zoneName', 'depthValue', 'gaugeDiver', 'answerList', 'answerForm', 'answerInput', 'feedback',
    'reveal', 'revealVerdict', 'revealBest', 'btnNext',
    'resultMeters', 'resultZone', 'resultRarity', 'newRecord', 'summaryList', 'deepestHint',
    'resBest', 'resToday', 'resGames', 'btnRetry', 'btnShare', 'btnHome',
    'historyList', 'historyEmpty', 'btnHistoryBack', 'toast', 'bubbles',
  ].forEach((id) => { el[id] = $(id); });

  // ---------- Estado ----------
  const state = {
    lang: 'es',
    ready: false,
    curatedRaw: [],
    pool: { gen: [], curated: [] },
    nextSet: null,
    set: [],
    mode: 'new',          // new | replay
    diveNumber: 1,
    replayEntry: null,
    current: null,
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
  const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return localDateKey(d); };

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
    toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 2600);
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

    for (const ans of q.answers) if (exact.some((k) => ans.keys.has(k))) return ans;

    if (base.length > 4 && base.endsWith('a')) {
      const variants = [base.slice(0, -1), base.slice(0, -1) + 'o'];
      for (const ans of q.answers) if (variants.some((k) => ans.keys.has(k))) return ans;
    }

    // Errores de tipeo: solo 6+ letras y mismas 2 primeras letras
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

  function poolFor(lang) {
    return {
      gen: G.buildPool(lang),
      curated: state.curatedRaw
        .filter((q) => q && q.id && q.prompt && Array.isArray(q.answers))
        .map((q) => fromCurated(q, lang))
        .filter((q) => q.prompt && q.answers.length >= 5),
    };
  }

  // ---------- Preguntas ya jugadas ----------
  const loadPlayed = () => storage.get(CONFIG.PLAYED_KEY, []);
  function markPlayed(ids) {
    storage.set(CONFIG.PLAYED_KEY, [...new Set([...loadPlayed(), ...ids])]);
  }

  /** 7 preguntas que nunca has jugado, de categorías distintas si es posible */
  function pickNewSet() {
    const { gen, curated } = state.pool;
    let played = new Set(loadPlayed());
    let cur = curated.filter((q) => !played.has(q.id));
    let gn = gen.filter((q) => !played.has(q.id));

    if (cur.length + gn.length < CONFIG.ROUNDS) {
      storage.set(CONFIG.PLAYED_KEY, []);
      played = new Set();
      cur = curated.slice();
      gn = gen.slice();
      if (state.ready) toast(t('bankReset'));
    }

    const pCurated = cur.length ? 0.35 : 0;
    const chosen = []; const ids = new Set(); const cats = new Set();
    for (let i = 0; i < 3000 && chosen.length < CONFIG.ROUNDS; i++) {
      const useCur = (Math.random() < pCurated && cur.length) || !gn.length;
      const list = useCur ? cur : gn;
      const q = list[Math.floor(Math.random() * list.length)];
      if (!q || ids.has(q.id)) continue;
      if (i < 1500 && cats.has(q.category)) continue;
      chosen.push(q); ids.add(q.id); cats.add(q.category);
    }
    return chosen;
  }

  function unplayedCount() {
    const played = new Set(loadPlayed());
    return [...state.pool.gen, ...state.pool.curated].filter((q) => !played.has(q.id)).length;
  }

  // ---------- Historial ----------
  const loadHistory = () => storage.get(CONFIG.HISTORY_KEY, []);
  const saveHistory = (list) => storage.set(CONFIG.HISTORY_KEY, list.slice(0, CONFIG.HISTORY_MAX));

  /** Reconstruye las preguntas de una inmersión en su idioma original */
  function questionsFor(entry) {
    const pool = entry.lang === state.lang ? state.pool : poolFor(entry.lang);
    const map = new Map([...pool.gen, ...pool.curated].map((q) => [q.id, q]));
    return entry.ids.map((id) => map.get(id)).filter(Boolean);
  }

  // ---------- Récords ----------
  const defaultRecords = () => ({ best: { meters: 0, date: null }, days: {}, games: 0, streak: 0, lastPlayed: null });
  const loadRecords = () => ({ ...defaultRecords(), ...storage.get(CONFIG.STORAGE_KEY, {}) });
  const currentStreak = (r) => (r.lastPlayed === localDateKey() || r.lastPlayed === yesterdayKey() ? r.streak : 0);

  function registerResult(total) {
    const r = loadRecords();
    const today = localDateKey();
    r.games += 1;

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
    if (!state.ready) return;
    state.pool = poolFor(state.lang);
    state.nextSet = null;
    if (state.phase === 'history') renderHistory();
    else goHome();
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
    if (window.AbisalScene) window.AbisalScene.setDepth(meters);
  }

  function renderHome() {
    if (!state.nextSet) state.nextSet = pickNewSet();
    el.homeCats.textContent = [...new Set(state.nextSet.map((q) => q.category))].join(' · ');
    el.dateLabel.textContent = new Date().toLocaleDateString(L().locale, { weekday: 'short', day: 'numeric', month: 'short' });

    const r = loadRecords();
    el.statBest.textContent = `${fmt(r.best.meters)} m`;
    el.statToday.textContent = `${fmt(r.days[localDateKey()]?.best || 0)} m`;
    el.statStreak.textContent = currentStreak(r);
    el.bankInfo.textContent = t('bank', { n: fmt(unplayedCount()) });
  }

  function goHome() {
    state.phase = 'home';
    setDepthVisual(0);
    renderHome();
    showScreen('home');
  }

  function renderHistory() {
    const list = loadHistory();
    el.historyEmpty.hidden = list.length > 0;
    el.historyList.replaceChildren(...list.map((entry) => {
      const li = h('li');
      const btn = h('button', 'hist-item');
      btn.type = 'button';
      const info = h('div', 'hist-info');
      const when = new Date(entry.ts).toLocaleString(L().locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      info.append(h('strong', '', when), h('span', '', (entry.cats || []).join(' · ')));
      btn.append(h('span', 'hist-n', `#${entry.n}`), info, h('span', 'hist-m', `${fmt(entry.best || entry.total || 0)} m`));
      btn.addEventListener('click', () => startReplay(entry));
      li.append(btn);
      return li;
    }));
  }

  function openHistory() {
    state.phase = 'history';
    renderHistory();
    showScreen('history');
  }

  // ---------- Juego ----------
  function startNew() {
    if (!state.ready) return;
    const set = state.nextSet && state.nextSet.length ? state.nextSet : pickNewSet();
    state.nextSet = null;
    markPlayed(set.map((q) => q.id));
    state.mode = 'new';
    state.replayEntry = null;
    state.diveNumber = (loadHistory()[0]?.n || 0) + 1;
    begin(set);
  }

  function startReplay(entry) {
    if (!state.ready || !entry) return;
    const set = questionsFor(entry);
    if (!set.length) { toast(t('missing')); return; }
    state.mode = 'replay';
    state.replayEntry = entry;
    state.diveNumber = entry.n;
    begin(set);
  }

  function begin(set) {
    state.set = set;
    Object.assign(state, { phase: 'game', round: 0, total: 0, results: [], locked: false });

    el.roundTotal.textContent = set.length;
    el.depthValue.textContent = '0';
    el.answerList.replaceChildren(...set.map(() => h('li', 'dot')));
    setDepthVisual(0);
    showScreen('game');

    startRound();
    el.answerInput.focus();
  }

  function startRound() {
    state.round += 1;
    state.current = state.set[state.round - 1];
    state.locked = false;

    const label = t(state.mode === 'new' ? 'modeNew' : 'modeReplay', { n: state.diveNumber });
    el.roundNum.textContent = state.round;
    el.gameCategory.textContent = `${label} · ${state.current.category}`;
    el.gameQuestion.textContent = state.current.prompt;
    [...el.answerList.children].forEach((d, i) => d.classList.toggle('is-current', i === state.round - 1));

    el.answerInput.value = '';
    el.answerInput.readOnly = false;
    el.answerForm.hidden = false;
    el.btnNext.hidden = true;
    el.reveal.hidden = true;
    setFeedback('');

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

  function setFeedback(text) {
    el.feedback.textContent = text;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (state.phase !== 'game' || state.locked) return;
    const raw = el.answerInput.value.trim();
    if (!raw) return;

    const ans = findAnswer(state.current, raw);
    if (!ans) {
      // Inválida: el reloj sigue corriendo y puedes intentar otra
      setFeedback(t('invalid', { x: raw }));
      restartAnimation(el.answerForm, 'shake');
      el.answerInput.select();
      return;
    }
    endRound(ans);
  }

  /** Se cierra con una respuesta válida o cuando se acaba el tiempo */
  function endRound(ans) {
    if (state.locked) return;
    state.locked = true;
    cancelAnimationFrame(state.raf);
    el.answerInput.readOnly = true;
    el.answerInput.blur();
    setFeedback('');

    const meters = ans ? ans.meters : 0;
    const tier = ans ? tierFor(meters) : null;
    const status = ans ? 'ok' : 'time';
    state.results.push({ id: state.current.id, prompt: state.current.prompt, text: ans ? ans.text : null, meters, tier, status });

    const from = state.total;
    state.total += meters;

    const dot = el.answerList.children[state.round - 1];
    if (dot) dot.className = `dot ${tier ? `tier-${tier.id}` : 'tier-none'}`;

    if (status === 'ok') {
      el.revealVerdict.textContent = t('verdictGood', { x: ans.text, tier: tierName(tier), m: fmt(meters) });
      el.revealVerdict.className = `reveal__verdict is-good tier-${tier.id}`;
      dive(from, state.total, meters, tier);
    } else {
      el.revealVerdict.textContent = t('verdictTime');
      el.revealVerdict.className = 'reveal__verdict is-bad';
    }

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
    if (window.AbisalScene) window.AbisalScene.dive(tier.id);
    if (navigator.vibrate) navigator.vibrate(tier.min >= 520 ? [20, 40, 20] : 25);
  }

  function finishDive() {
    state.phase = 'results';
    document.body.classList.remove('in-game');

    const total = state.total;
    const { records, isRecord } = registerResult(total);

    // Guardar en el historial
    const history = loadHistory();
    if (state.mode === 'new') {
      history.unshift({
        n: state.diveNumber,
        ts: Date.now(),
        lang: state.lang,
        ids: state.set.map((q) => q.id),
        cats: [...new Set(state.set.map((q) => q.category))],
        total,
        best: total,
      });
    } else if (state.replayEntry) {
      const entry = history.find((e) => e.n === state.replayEntry.n);
      if (entry) entry.best = Math.max(entry.best || 0, total);
    }
    saveHistory(history);

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
      info.append(
        h('strong', '', r.status === 'ok' ? r.text : t('noAnswer')),
        h('span', 'summary__q', r.prompt),
        h('span', 'summary__tier', r.status === 'ok' ? tierName(r.tier) : t('timeUp')),
      );
      li.append(info, h('span', 'summary__m', `${fmt(r.meters)} m`));
      return li;
    }));

    const best = valid.reduce((a, b) => (!a || b.meters > a.meters ? b : a), null);
    el.deepestHint.textContent = best ? t('deepestYou', { x: best.text, m: fmt(best.meters) }) : t('noneValid');

    el.resBest.textContent = `${fmt(records.best.meters)} m`;
    el.resToday.textContent = `${fmt(records.days[localDateKey()]?.best || 0)} m`;
    el.resGames.textContent = fmt(records.games);
    el.btnRetry.textContent = t(state.mode === 'new' ? 'retryNew' : 'retryReplay');

    showScreen('results');
    if (isRecord && navigator.vibrate) navigator.vibrate([30, 60, 30, 60, 80]);
  }

  async function share() {
    const zone = zoneFor(state.total);
    const squares = state.results.map((r) => (r.tier ? r.tier.emoji : '⬛')).join('');
    const label = t(state.mode === 'new' ? 'modeNew' : 'modeReplay', { n: state.diveNumber });
    const text = `Abisal · ${label}\n🌊 ${fmt(state.total)} m · ${zone.name}\n${squares}`;
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

    el.btnPlay.addEventListener('click', startNew);
    el.btnHistory.addEventListener('click', openHistory);
    el.btnHistoryBack.addEventListener('click', goHome);
    el.btnRetry.addEventListener('click', () => (state.mode === 'new' ? startNew() : startReplay(state.replayEntry)));
    el.btnNext.addEventListener('click', nextStep);
    el.btnHome.addEventListener('click', goHome);
    el.btnShare.addEventListener('click', share);
    el.answerForm.addEventListener('submit', onSubmit);
    el.langToggle.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-lang]');
      if (b) setLang(b.dataset.lang);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && state.phase === 'game' && state.locked && !el.btnNext.hidden) {
        e.preventDefault();
        nextStep();
      }
    });

    setLang(detectLang());

    state.curatedRaw = await loadCurated();
    state.pool = poolFor(state.lang);
    state.ready = true;
    renderHome();
    el.btnPlay.disabled = false;
    el.btnHistory.disabled = false;

    const prev = storage.get(CONFIG.CURATED_COUNT_KEY, 0);
    const now = state.curatedRaw.length;
    if (prev && now > prev) toast(t('updated', { n: now - prev }));
    if (now) storage.set(CONFIG.CURATED_COUNT_KEY, now);
  }

  init();
})();
