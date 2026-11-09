// short sound effects: taps, the map's flight and clouds, game feedback and page turns.
// Quran pages never load this file, and a page marked <html data-sfx="none"> gets no sound even if it does.
// Browsers allow sound only after the child's first touch, so the sounds load and wake up then.
// A switch in the top bar turns them off, and the choice is remembered on this device.
(() => {
  if (document.documentElement.dataset.sfx === 'none') { window.Sfx = { play() {}, taps() {}, hush() {}, setOff() {}, isOff: () => true }; return; }
  // each sound with its own volume, so a soft page turn and a bright chime come out about equally loud
  const FILES = { tap: 0.49, open: 1.45, clouds: 0.62, right: 0.83, retry: 1.07, pick: 0.75, win: 0.54, page: 2.2, bubble: 0.6 };
  const KEY = 'ajyal.sfx.off', VOLUME = 0.6;
  // where the site's files are, so the app folder finds the sounds too
  const BASE = (document.currentScript && document.currentScript.src.replace(/sfx\.js(\?.*)?$/, '')) || '';
  const bufs = {};
  let ctx = null, master = null, hushed = false, off = false;
  try { off = localStorage.getItem(KEY) === '1'; } catch {}

  // nothing is downloaded while the sounds are off
  function wake() {
    if (off) return;
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = VOLUME; master.connect(ctx.destination);
    Object.keys(FILES).forEach((n) => fetch(`${BASE}sfx/${n}.mp3`).then((r) => r.arrayBuffer())
      .then((a) => ctx.decodeAudioData(a)).then((b) => { bufs[n] = b; }).catch(() => {}));
  }
  ['pointerdown', 'keydown'].forEach((t) => addEventListener(t, wake, { capture: true, passive: true }));

  function play(n) {
    if (off || hushed || !ctx || !bufs[n]) return;
    if (ctx.state === 'suspended') ctx.resume();
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = bufs[n]; g.gain.value = FILES[n];
    s.connect(g).connect(master); s.start();
  }

  // the switch, next to the time left today. Its icon is a speaker with a little star,
  // so it is not mistaken for the "read to me" speaker in the stories
  const css = document.createElement('style');
  css.textContent = `.sfx-btn { width: 46px; height: 46px; flex-shrink: 0; padding: 0; border: 0; border-radius: 50%; background: #FFFFFF; color: #3A2318; box-shadow: 0 4px 0 rgba(58,35,24,.18); display: grid; place-items: center; cursor: pointer; }
    .sfx-btn svg { width: 26px; height: 26px; }
    .sfx-btn .star { fill: #F7B347; stroke: none; }
    .sfx-btn[aria-pressed="false"] { color: #A08E7C; }
    .sfx-btn[aria-pressed="false"] .star { fill: #D8CCBE; }`;
  const SPEAKER = '<path d="M3 10h3.2L10.5 6v12l-4.3-4H3z" fill="currentColor"/>';
  const ICON_ON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SPEAKER}<path d="M13.5 10a3 3 0 0 1 0 4"/><path class="star" d="M18.5 3.5l1.1 2.4 2.4 1.1-2.4 1.1-1.1 2.4-1.1-2.4-2.4-1.1 2.4-1.1z"/></svg>`;
  const ICON_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SPEAKER}<path d="M14 10.5l4 4M18 10.5l-4 4"/><path class="star" d="M18.5 3.5l1.1 2.4 2.4 1.1-2.4 1.1-1.1 2.4-1.1-2.4-2.4-1.1 2.4-1.1z"/></svg>`;
  function paint(b) { b.setAttribute('aria-pressed', String(!off)); b.innerHTML = off ? ICON_OFF : ICON_ON; b.title = off ? 'المؤثرات الصوتية مغلقة' : 'المؤثرات الصوتية تعمل'; }
  // the switch for the sounds lives in the settings only (settings.html), not on every screen
  document.head.appendChild(css);
  // the settings page turns the sounds on or off too; every open page follows
  function setOff(v) { off = !!v; try { localStorage.setItem(KEY, off ? '1' : '0'); } catch {} document.querySelectorAll('.sfx-btn').forEach(paint); if (!off) { wake(); play('tap'); } }
  addEventListener('storage', (e) => { if (e.key === KEY) { off = e.newValue === '1'; document.querySelectorAll('.sfx-btn').forEach(paint); } });

  window.Sfx = {
    play, setOff, isOff: () => off,
    // taps on these elements make the soft tap sound; elements marked data-sfx="none" stay silent
    taps(selector = 'a, button') {
      document.addEventListener('click', (e) => { const t = e.target.closest(selector); if (t && !t.closest('[data-sfx="none"], .sfx-btn')) play('tap'); }, true);
    },
    // silent while a voice or a recording is playing (read to me, and any media later)
    hush(on) { hushed = !!on; }
  };
})();
