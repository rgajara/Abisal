/* ===========================================================
   Abisal · Escena: cielo, bote, océano y submarino
   Expone window.AbisalScene = { setDepth(m), dive(tier) }
   =========================================================== */
(function (global) {
  'use strict';

  const PX = 0.55;    // píxeles por metro
  const SKY = 1000;   // alto del cielo sobre la superficie (px)
  const MAX = 11000;  // profundidad máxima (m)

  const $ = (id) => document.getElementById(id);
  const scene = $('scene');
  const world = $('world');
  const sub = $('sub');
  const subSprite = $('subSprite');
  const snow = $('snow');
  if (!scene || !world || !sub) return;

  // Aleatorio con semilla: la decoración siempre queda igual
  let seed = 1337;
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const between = (a, b) => a + rand() * (b - a);
  const yAt = (m) => SKY + m * PX;

  // ---------- Pixel art: filas de texto → SVG ----------
  function sprite(rows, pal, scale) {
    const w = Math.max(...rows.map((r) => r.length));
    const hgt = rows.length;
    let out = '';
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length;) {
        const c = row[x];
        if (c === '.' || !pal[c]) { x++; continue; }
        let x2 = x;
        while (x2 < row.length && row[x2] === c) x2++;
        out += `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${pal[c]}"/>`;
        x = x2;
      }
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hgt}" width="${Math.round(w * scale)}" height="${Math.round(hgt * scale)}" shape-rendering="crispEdges">${out}</svg>`;
  }

  const S = {
    BOAT: [
      '...........M..............',
      '...........MPPP...........',
      '...........MPPPP..........',
      '...........MPP............',
      '...........M..............',
      '........CCCCCCCC..........',
      '........CWWCWWCC..........',
      '........CCCCCCCCC.........',
      '..HHHHHHHHHHHHHHHHHHHHHHH.',
      '...HHHHHHHHHHHHHHHHHHHHH..',
      '....RRRRRRRRRRRRRRRRRRR...',
      '.....HHHHHHHHHHHHHHHHH....',
    ],
    SUB: [
      '.........PP...........',
      '.........PP...........',
      '........SSSSS.........',
      '...YYYYYYYYYYYYYYY....',
      '..YYYGGYYYGGYYYGGYY.TT',
      '.YYYYGGYYYGGYYYGGYYYTT',
      'YYYYYYYYYYYYYYYYYYYY.T',
      '.YYYYYYYYYYYYYYYYYY..T',
      '..DDDDDDDDDDDDDDDD....',
      '....DDDDDDDDDDDD......',
    ],
    FISH: [
      '..FFFF...',
      '.FFFFFF.F',
      'FEFFFFFFF',
      '.FFFFFF.F',
      '..FFFF...',
    ],
    WHALE: [
      '..........WWWWWWW.............',
      '......WWWWWWWWWWWWWWWW........',
      '...WWWWWWWWWWWWWWWWWWWWWW...WW',
      '.WWEWWWWWWWWWWWWWWWWWWWWWW.WW.',
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWW.',
      'WWWWWWWWWWWWWWWWWWWWWWWWWWW.WW',
      '.WWWWWWWWWWWWWWWWWWWWWWW.....W',
      '...WWWWWWWWWWWW....WW.........',
      '....................W.........',
    ],
    JELLY: [
      '...JJJ...',
      '.JJJJJJJ.',
      'JJLJJJLJJ',
      'JJJJJJJJJ',
      'J.J.J.J.J',
      '.T..T..T.',
      '.T.T..T..',
      'T..T.T..T',
      '.T..T..T.',
      '..T..T...',
    ],
    ANGLER: [
      'L.................',
      'LL................',
      '.A................',
      '..A...............',
      '...DDDDDDD........',
      '..DDDEDDDDDDDD..TT',
      '.DDDDDDDDDDDDDDTTT',
      'DWDWDWDDDDDDDDDDTT',
      'DDDDDDDDDDDDDD..TT',
      '.DWDWDDDDDDDD.....',
      '...DDDDDD.........',
    ],
    CLOUD: [
      '....CCCC......',
      '..CCCCCCCC....',
      '.CCCCCCCCCCCC.',
      'CCCCCCCCCCCCCC',
      '.SSSSSSSSSSSS.',
    ],
    GULL: [
      'GG...GG',
      '..G.G..',
      '...G...',
    ],
  };

  const P = {
    BOAT: { M: '#1b2435', P: '#ff5c8a', C: '#e8eef5', W: '#22e3f2', H: '#16202e', R: '#ff5c8a' },
    SUB: { P: '#9aa7b8', S: '#e0a93a', Y: '#ffc94d', G: '#22e3f2', D: '#c98f2a', T: '#9aa7b8' },
    FISH: { F: 'currentColor', E: 'rgba(255,255,255,.55)' },
    WHALE: { W: 'currentColor', E: '#9fd8ef' },
    ANGLER: { L: '#fff3a0', A: '#3a4a5e', D: '#1c2a3b', E: '#ff4d6d', W: '#e5e7eb', T: '#1c2a3b' },
    CLOUD: { C: '#fff1f4', S: '#f5c6d2' },
    GULL: { G: '#3b2f4a' },
  };
  const JELLY_COLORS = [['#c084fc', '#f0d4ff'], ['#22e3f2', '#c9fbff'], ['#ff5c8a', '#ffd0de'], ['#3dffb4', '#d4ffef']];

  function el(cls, parent, style, html) {
    const d = document.createElement('div');
    d.className = cls;
    if (style) Object.assign(d.style, style);
    if (html) d.innerHTML = html;
    (parent || world).appendChild(d);
    return d;
  }

  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  function rockColor(m) {
    const t = Math.min(1, m / 9000);
    return `rgb(${lerp(9, 2, t)}, ${lerp(40, 7, t)}, ${lerp(60, 14, t)})`;
  }

  // ---------- Construcción del mundo ----------
  function build() {
    world.style.height = `${yAt(MAX + 700)}px`;

    // Cielo
    const sky = el('sky', world, { top: '0px', height: `${SKY}px` });
    for (let i = 0; i < 30; i++) {
      el('star', sky, { left: `${between(0, 100)}%`, top: `${between(0, SKY * 0.45)}px`, animationDelay: `${-between(0, 4)}s` });
    }
    el('sun', sky);
    for (let i = 0; i < 6; i++) {
      el('cloud', sky, {
        top: `${between(SKY * 0.35, SKY - 150)}px`,
        animationDuration: `${between(70, 130)}s`,
        animationDelay: `${-between(0, 130)}s`,
      }, sprite(S.CLOUD, P.CLOUD, between(4, 7)));
    }
    for (let i = 0; i < 3; i++) {
      el('gull', sky, {
        top: `${between(SKY * 0.55, SKY - 220)}px`,
        animationDuration: `${between(28, 45)}s`,
        animationDelay: `${-between(0, 45)}s`,
      }, sprite(S.GULL, P.GULL, 3));
    }

    // Agua: se oscurece con la profundidad
    const stops = [[0, '#3f9cc4'], [150, '#2479a6'], [500, '#15557f'], [1000, '#0d3a5c'], [2500, '#08233d'],
      [4000, '#05172b'], [6000, '#030d1a'], [9000, '#02070f'], [MAX + 700, '#010307']];
    el('water', world, {
      top: `${SKY}px`,
      height: `${(MAX + 700) * PX}px`,
      background: `linear-gradient(180deg, ${stops.map(([m, c]) => `${c} ${Math.round(m * PX)}px`).join(', ')})`,
    });
    el('rays', world, { top: `${SKY}px` });

    // Líneas de zona
    [200, 1000, 4000, 6000].forEach((m) => el('zone-line', world, { top: `${yAt(m)}px` }));

    // Rocas laterales (con algas cerca de la superficie)
    for (let m = 260; m < MAX; m += between(260, 420)) {
      const left = rand() < 0.5;
      const w = between(40, 150);
      const hh = between(160, 440);
      const pts = left
        ? `0 0, ${between(30, 70)}% 0, 100% ${between(20, 45)}%, ${between(55, 85)}% ${between(55, 80)}%, ${between(30, 60)}% 100%, 0 100%`
        : `100% 0, ${between(30, 70)}% 0, 0 ${between(20, 45)}%, ${between(15, 45)}% ${between(55, 80)}%, ${between(40, 70)}% 100%, 100% 100%`;
      el('rock', world, {
        top: `${yAt(m)}px`, [left ? 'left' : 'right']: '0px',
        width: `${w}px`, height: `${hh}px`,
        background: rockColor(m), clipPath: `polygon(${pts})`,
      });
      if (m < 1100) {
        for (let k = 0; k < 3; k++) {
          const kh = between(70, 170);
          el('kelp', world, {
            top: `${yAt(m) - kh + 14}px`,
            [left ? 'left' : 'right']: `${between(6, w * 0.45)}px`,
            height: `${kh}px`,
            animationDelay: `${-between(0, 4)}s`,
          });
        }
      }
    }

    // Cardúmenes (0–950 m)
    for (let i = 0; i < 18; i++) {
      const m = between(30, 950);
      const n = 3 + Math.floor(rand() * 5);
      const rtl = rand() < 0.5;
      let html = '';
      for (let k = 0; k < n; k++) {
        html += `<span style="margin-top:${Math.round(between(-12, 14))}px">${sprite(S.FISH, P.FISH, between(2.4, 3.4))}</span>`;
      }
      el(`school${rtl ? ' rtl' : ''}`, world, {
        top: `${yAt(m)}px`,
        color: m < 400 ? '#0b3550' : '#09263c',
        animationDuration: `${between(28, 55)}s`,
        animationDelay: `${-between(0, 55)}s`,
      }, html);
    }

    // Ballenas
    [[650, '#0a2e48'], [2300, '#061a2c']].forEach(([m, color], i) => {
      el(`school whale${i % 2 ? ' rtl' : ''}`, world, {
        top: `${yAt(m)}px`, color,
        animationDuration: `${between(80, 110)}s`,
        animationDelay: `${-between(0, 80)}s`,
      }, sprite(S.WHALE, P.WHALE, 6));
    });

    // Medusas (900–4800 m)
    for (let i = 0; i < 16; i++) {
      const [c1, c2] = JELLY_COLORS[Math.floor(rand() * JELLY_COLORS.length)];
      el('jelly', world, {
        top: `${yAt(between(900, 4800))}px`,
        left: `${between(6, 88)}%`,
        color: c1,
        animationDelay: `${-between(0, 6)}s`,
      }, sprite(S.JELLY, { J: c1, L: c2, T: c1 }, between(3, 4.5)));
    }

    // Peces abisales (4300–10500 m)
    for (let i = 0; i < 8; i++) {
      el('angler', world, {
        top: `${yAt(between(4300, 10500))}px`,
        left: `${between(8, 80)}%`,
        animationDelay: `${-between(0, 16)}s`,
      }, sprite(S.ANGLER, P.ANGLER, 4));
    }

    // Bioluminiscencia
    for (let i = 0; i < 60; i++) {
      el('glow-dot', world, {
        top: `${yAt(between(2500, MAX))}px`,
        left: `${between(2, 96)}%`,
        animationDelay: `${-between(0, 4)}s`,
      });
    }

    // Regla de profundidad
    const ruler = el('ruler', world, { top: `${SKY}px`, height: `${MAX * PX}px` });
    for (let m = 0; m <= MAX; m += 100) {
      const major = m % 500 === 0;
      const t = el(`tick${major ? ' major' : ''}`, ruler, { top: `${m * PX}px` });
      if (major) t.innerHTML = `<span>${m} m</span>`;
    }

    // Lecho marino
    const bed = el('seabed', world, { top: `${yAt(MAX + 40)}px`, height: `${700 * PX + 120}px` });
    for (let i = 0; i < 4; i++) el('vent', bed, { left: `${between(10, 85)}%`, animationDelay: `${-between(0, 3)}s` });

    // Bote y olas (las olas tapan el casco)
    el('boat', world, { top: `${SKY - 48 + 14}px` }, sprite(S.BOAT, P.BOAT, 4));
    el('surface', world, { top: `${SKY - 9}px` });

    // Submarino
    if (subSprite) subSprite.innerHTML = sprite(S.SUB, P.SUB, 4);

    // Nieve marina
    if (snow) {
      for (let i = 0; i < 55; i++) {
        const size = `${between(1, 3).toFixed(1)}px`;
        el('flake', snow, {
          left: `${between(0, 100)}%`, width: size, height: size,
          animationDuration: `${between(10, 24)}s`,
          animationDelay: `${-between(0, 24)}s`,
        });
      }
    }
  }

  // ---------- Cámara ----------
  let current = 0;
  let ready = false;

  function subCenter() {
    const r = sub.getBoundingClientRect();
    return r.top + r.height / 2;
  }

  function apply(m, animate, fast) {
    world.style.transition = animate ? `transform ${fast ? 1.1 : 1.9}s cubic-bezier(.45,.05,.2,1)` : 'none';
    const y = subCenter() - 40 - yAt(m);
    world.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
  }

  function setDepth(m) {
    const target = Math.max(0, Math.min(MAX, Number(m) || 0));
    if (!ready) { current = target; return; }
    apply(target, target !== current, target < current);
    current = target;
  }

  // ---------- Efecto de inmersión ----------
  let diveTimer;
  function dive(tier) {
    sub.dataset.tier = tier || '';
    sub.classList.remove('is-diving');
    void sub.offsetWidth;
    sub.classList.add('is-diving');
    clearTimeout(diveTimer);
    diveTimer = setTimeout(() => sub.classList.remove('is-diving'), 2000);

    const r = sub.getBoundingClientRect();
    for (let i = 0; i < 16; i++) {
      setTimeout(() => {
        const size = `${between(3, 8).toFixed(1)}px`;
        const b = el('trail', scene, {
          left: `${r.right - 8 + between(-6, 6)}px`,
          top: `${r.top + r.height * 0.5 + between(-10, 10)}px`,
          width: size, height: size,
        });
        b.addEventListener('animationend', () => b.remove());
      }, i * 90);
    }
  }

  build();
  requestAnimationFrame(() => { apply(current, false); ready = true; });
  window.addEventListener('resize', () => apply(current, false));

  global.AbisalScene = { setDepth, dive };
})(window);
