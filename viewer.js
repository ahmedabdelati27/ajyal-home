// shared behaviour for the content viewers: pictures, video, audio, books
window.Viewer = (() => {
  const $ = (id) => document.getElementById(id);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 8 5.5z" fill="#6B3A1E"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.6" fill="#6B3A1E"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.6" fill="#6B3A1E"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="#6B3A1E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="#6B3A1E"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    muted: '<svg viewBox="0 0 24 24" fill="none" stroke="#6B3A1E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="#6B3A1E"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>'
  };

  // likes, the comments drawer, internal share and toasts
  function social({ likes, onOpenTalk }) {
    const like = $('like'), drawer = $('drawer'), scrim = $('scrim');
    const toast = (s) => { const el = $('toast'); el.textContent = s; el.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('show'), 2200); };
    // pages without interactions (stories) only get the toast
    if (!like) return { toast, isOpen: () => false, closeTalk() {} };
    const isOpen = () => drawer.classList.contains('open');
    const openTalk = () => { drawer.classList.add('open'); scrim.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); $('msg').focus(); };
    const closeTalk = () => { drawer.classList.remove('open'); scrim.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); $('talk').focus(); };

    like.addEventListener('click', () => { const on = like.getAttribute('aria-pressed') !== 'true'; like.setAttribute('aria-pressed', on); $('likes').textContent = likes + (on ? 1 : 0); });
    $('talk').addEventListener('click', () => { onOpenTalk?.(); openTalk(); });
    $('close').addEventListener('click', closeTalk);
    scrim.addEventListener('click', closeTalk);
    $('write').addEventListener('submit', (e) => { e.preventDefault(); if (!$('msg').value.trim()) return; $('msg').value = ''; toast('وصل تعليقك، وسيظهر بعد المراجعة'); });
    $('share').addEventListener('click', () => toast('المشاركة مع أصدقائك داخل المنصة قريباً'));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) closeTalk(); });
    return { toast, isOpen, closeTalk };
  }

  // a timed player (video or audio): resume prompt, RTL timeline, saving the place, time's up, finished
  function media({ dur, key, start, likes, xp = 0, stage }) {
    const q = new URLSearchParams(location.search);
    // ?demo=timeup runs out the daily time a few seconds into playback
    let timeLeft = q.get('demo') === 'timeup' ? 4 : 35 * 60;
    const store = { get() { try { return +localStorage.getItem(key) || 0; } catch { return 0; } }, set(v) { try { localStorage.setItem(key, String(Math.floor(v))); } catch {} } };

    // a finished (or almost finished) item starts over
    const saved = store.get();
    let t = saved > 0 && saved < dur - 10 ? saved : saved >= dur - 10 ? 0 : start, playing = false, tick = null, muted = false, sinceSave = 0;
    const bar = $('bar');
    const s = social({ likes, onOpenTalk: () => playing && setPlaying(false) });

    function draw() {
      bar.style.setProperty('--p', (t / dur) * 100 + '%');
      bar.setAttribute('aria-valuenow', Math.floor(t)); bar.setAttribute('aria-valuetext', fmt(t));
      $('cur').textContent = fmt(t);
    }
    function setPlaying(on) {
      playing = on;
      stage.classList.toggle('playing', on);
      $('play').innerHTML = on ? ICON.pause : ICON.play;
      $('play').setAttribute('aria-label', on ? 'إيقاف مؤقت' : 'تشغيل');
      clearInterval(tick);
      if (on) tick = setInterval(step, 250); else store.set(t);
    }
    function step() {
      t = Math.min(dur, t + 0.25); draw();
      // keep the place even if the app closes or the connection drops
      if ((sinceSave += 0.25) >= 5) { sinceSave = 0; store.set(t); }
      timeLeft -= 0.25; $('left').textContent = Math.max(0, Math.ceil(timeLeft / 60)) + ' د';
      if (timeLeft <= 0) return timeUp();
      if (t >= dur) finish();
    }
    const seek = (v) => { t = Math.max(0, Math.min(dur, v)); draw(); store.set(t); };

    function finish() {
      setPlaying(false); store.set(0);
      // XP only when the admin marked this item as XP-eligible on completion (never just for opening)
      $('xp').hidden = !xp; $('xp-n').textContent = '+' + xp;
      $('done').hidden = false; $('again').focus();
    }
    function timeUp() {
      setPlaying(false); store.set(t);
      if (document.fullscreenElement) document.exitFullscreen();
      if (s.isOpen()) s.closeTalk();
      $('kept').textContent = fmt(t); $('left').textContent = '0 د';
      $('stop').hidden = false; $('ask').focus();
    }

    // resume prompt shows only when there's a saved place; coming from «أكمل» skips it
    $('at').textContent = fmt(t);
    if (q.get('resume') === '1' || t === 0) $('resume').hidden = true;
    $('go-on').addEventListener('click', () => { $('resume').hidden = true; setPlaying(true); });
    $('restart').addEventListener('click', () => { $('resume').hidden = true; seek(0); setPlaying(true); });
    $('again').addEventListener('click', () => { $('done').hidden = true; seek(0); setPlaying(true); });
    $('ask').addEventListener('click', (e) => { e.preventDefault(); s.toast('أرسلنا طلبك، وسنخبرك عندما يوافق'); });

    const toggle = () => { if (!$('resume').hidden) $('resume').hidden = true; setPlaying(!playing); };
    $('play').addEventListener('click', toggle);
    $('big')?.addEventListener('click', toggle);
    $('back10').addEventListener('click', () => seek(t - 10));
    $('fwd10').addEventListener('click', () => seek(t + 10));
    $('mute')?.addEventListener('click', () => { muted = !muted; $('mute').innerHTML = muted ? ICON.muted : ICON.sound; $('mute').setAttribute('aria-pressed', muted); $('mute').setAttribute('aria-label', muted ? 'تشغيل الصوت' : 'كتم الصوت'); });

    // timeline: RTL, so the start is on the right
    const fromX = (x) => { const r = bar.getBoundingClientRect(); return ((r.right - x) / r.width) * dur; };
    let dragging = false;
    bar.addEventListener('pointerdown', (e) => { dragging = true; bar.setPointerCapture(e.pointerId); seek(fromX(e.clientX)); });
    bar.addEventListener('pointermove', (e) => { if (dragging) seek(fromX(e.clientX)); });
    bar.addEventListener('pointerup', () => { dragging = false; });
    bar.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { seek(t + 10); e.preventDefault(); } if (e.key === 'ArrowRight') { seek(t - 10); e.preventDefault(); } });

    addEventListener('keydown', (e) => {
      if (document.activeElement === $('msg') || e.target === bar) return;
      if (e.key === ' ') { e.preventDefault(); toggle(); }
      if (e.key === 'ArrowLeft') seek(t + 10);
      if (e.key === 'ArrowRight') seek(t - 10);
    });

    // no saving or copying
    addEventListener('contextmenu', (e) => { if (e.target.closest('.frame, .cover')) e.preventDefault(); });
    addEventListener('pagehide', () => store.set(t >= dur ? 0 : t));
    // app in the background or screen locked: pause and keep the place, no time counted (Q-39)
    document.addEventListener('visibilitychange', () => { if (document.hidden && playing) setPlaying(false); });

    if ($('mute')) $('mute').innerHTML = ICON.sound;
    setPlaying(false); draw();
    return { toggle, toast: s.toast };
  }

  // a paged reader (PDF or Flipbook): steps are pages or spreads, label(i) names the place for the child
  // save/load turn a step into what's stored (e.g. a page number) and back
  // onFinish replaces the well-done card (stories open their quiz instead)
  // canNext(step) can hold the child on a step until it's done (tracing, an activity)
  function pages({ steps, key, likes, xp = 0, start = 0, label, onShow, onFinish, canNext, save = (i) => i, load = (v) => v }) {
    const q = new URLSearchParams(location.search);
    let timeLeft = q.get('demo') === 'timeup' ? 4 : 35 * 60;
    const raw = { get() { try { return +localStorage.getItem(key) || 0; } catch { return 0; } }, set(v) { try { localStorage.setItem(key, String(v)); } catch {} } };
    const store = { get: () => (raw.get() ? load(raw.get()) : 0), set: (i) => raw.set(i ? save(i) : 0) };
    const s = social({ likes });
    // a finished book starts over
    const saved = store.get();
    let at = saved > 0 && saved < steps ? saved : start, stopped = false;

    function go(i, dir = i >= at ? 1 : -1) {
      at = Math.max(0, Math.min(steps - 1, i));
      store.set(at); onShow(at, dir);
    }
    const next = () => { if (stopped || (canNext && !canNext(at))) return; at < steps - 1 ? go(at + 1, 1) : finish(); };
    const prev = () => { if (!stopped && at > 0) go(at - 1, -1); };

    function finish() {
      // a story keeps its place until the quiz is done, so leaving mid-quiz comes back to it
      if (onFinish) return onFinish();
      store.set(0);
      // XP only when the admin marked this item as XP-eligible on completion (never just for opening)
      $('xp').hidden = !xp; $('xp-n').textContent = '+' + xp;
      $('done').hidden = false; $('again').focus();
    }
    // reading time counts only while the page is on screen
    const clock = setInterval(() => {
      if (document.hidden || stopped) return;
      timeLeft -= 1; $('left').textContent = Math.max(0, Math.ceil(timeLeft / 60)) + ' د';
      if (timeLeft > 0) return;
      stopped = true; clearInterval(clock); store.set(at);
      if (s.isOpen()) s.closeTalk();
      $('kept').textContent = label(at); $('left').textContent = '0 د';
      $('stop').hidden = false; $('ask').focus();
    }, 1000);

    $('at').textContent = label(at);
    if (q.get('resume') === '1' || at === 0) $('resume').hidden = true;
    $('go-on').addEventListener('click', () => { $('resume').hidden = true; });
    $('restart').addEventListener('click', () => { $('resume').hidden = true; go(0); });
    $('again')?.addEventListener('click', () => { $('done').hidden = true; go(0); });
    $('ask').addEventListener('click', (e) => { e.preventDefault(); s.toast('أرسلنا طلبك، وسنخبرك عندما يوافق'); });

    addEventListener('keydown', (e) => {
      if (document.activeElement === $('msg') || stopped) return;
      if (e.key === 'ArrowLeft') next();
      if (e.key === 'ArrowRight') prev();
    });
    addEventListener('contextmenu', (e) => { if (e.target.closest('.book')) e.preventDefault(); });

    onShow(at, 0);
    return { next, prev, go, at: () => at, toast: s.toast, clear: () => store.set(0) };
  }

  // an open book of spreads {r, l} (see book.css): paints both halves and turns one leaf at a time.
  // Forward lifts the left page over to the right, like an Arabic book; on phones pages just slide.
  function spreadbook({ book, spreads, page, single }) {
    const R = book.querySelector('.half.r'), L = book.querySelector('.half.l');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let shown = null, busy = false;
    book.classList.toggle('single', single);
    const paint = (s) => { R.innerHTML = page(spreads[s].r); L.innerHTML = page(spreads[s].l); };

    // ---- page curl
    // The turning page lives in the frame of a left page (hinge = spine on its right edge, x = W).
    // Its outer bottom corner travels from (0, H) over the spine to (2W, H). The fold is the line
    // halfway between where the corner started and where it is now: the part on the hinge side stays
    // flat (front), the lifted part is mirrored across the fold and shows the back of the page.
    // Turning back is the same curl played in reverse.
    const DUR = 1000;
    const blank = '<div class="page"></div>';
    const pts = (poly) => (poly.length ? `polygon(${poly.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})` : 'polygon(0 0,0 0,0 0)');
    // keep the part of a polygon where side(p) * sign >= 0
    function cut(poly, side, sign) {
      const out = [];
      poly.forEach((p, i) => {
        const q = poly[(i + 1) % poly.length], sp = side(p) * sign, sq = side(q) * sign;
        if (sp >= 0) out.push(p);
        if ((sp >= 0) !== (sq >= 0)) { const k = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]); }
      });
      return out;
    }
    // a gradient across a fold line: offset 0 at point X0, growing along unit direction g
    function band(W, H, g, X0, stops) {
      const a = Math.atan2(g[0], -g[1]);
      const len = Math.abs(W * Math.sin(a)) + Math.abs(H * Math.cos(a));
      const s0 = (X0[0] - (W / 2 - g[0] * len / 2)) * g[0] + (X0[1] - (H / 2 - g[1] * len / 2)) * g[1];
      return `linear-gradient(${a}rad, rgba(0,0,0,0) ${s0}px, ${stops.map(([o, c]) => `${c} ${s0 + o}px`).join(', ')})`;
    }

    function curl(front, back, rev, done) {
      const el = document.createElement('div');
      el.className = 'curl';
      el.innerHTML = `<div class="cfw"><div class="cf">${page(front) || blank}<i class="fs"></i></div></div><div class="cbw"><div class="cb">${page(back) || blank}<i class="bs"></i></div></div>`;
      book.appendChild(el);
      const cf = el.querySelector('.cf'), cb = el.querySelector('.cb'), fs = el.querySelector('.fs'), bs = el.querySelector('.bs');
      const W = el.offsetWidth, H = el.offsetHeight, rect = [[0, 0], [W, 0], [W, H], [0, H]];

      function frame(t) {
        const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        const phi = Math.PI * e;
        const P = [W - W * Math.cos(phi), H - 0.34 * W * Math.sin(phi)];
        const n = [0 - P[0], H - P[1]], len = Math.hypot(n[0], n[1]);
        if (len < 0.5) { cf.style.clipPath = ''; cb.style.clipPath = pts([]); return; }
        const u = [n[0] / len, n[1] / len], M = [P[0] / 2, (H + P[1]) / 2];
        const side = (p) => (p[0] - M[0]) * u[0] + (p[1] - M[1]) * u[1];
        cf.style.clipPath = pts(cut(rect, side, -1));
        // back: mirror the page (its back faces the other way), then reflect it across the fold
        const d = [-u[1], u[0]];
        const r11 = 2 * d[0] * d[0] - 1, r12 = 2 * d[0] * d[1], r22 = 2 * d[1] * d[1] - 1;
        const tx = M[0] + r11 * (W - M[0]) + r12 * -M[1], ty = M[1] + r12 * (W - M[0]) + r22 * -M[1];
        cb.style.transform = `matrix(${-r11},${-r12},${r12},${r22},${tx},${ty})`;
        cb.style.clipPath = pts(cut(rect, side, 1).map(([x, y]) => [W - x, y]));
        // shading: the flat page darkens just before the fold; the curled back gets a soft highlight
        const reach = Math.min(W * 0.35, len * 0.5);
        fs.style.background = band(W, H, [-u[0], -u[1]], M, [[0, 'rgba(0,0,0,.3)'], [reach, 'rgba(0,0,0,0)']]);
        bs.style.background = band(W, H, [-u[0], u[1]], [W - M[0], M[1]], [[0, 'rgba(0,0,0,.28)'], [reach * 0.18, 'rgba(255,255,255,.32)'], [reach * 0.6, 'rgba(0,0,0,.06)'], [reach * 1.4, 'rgba(0,0,0,.14)']]);
      }

      let raf = 0, ended = false;
      const end = () => { if (ended) return; ended = true; cancelAnimationFrame(raf); done(); el.remove(); };
      const start = performance.now();
      const tick = (now) => { const t = Math.min(1, (now - start) / DUR); frame(rev ? 1 - t : t); if (t < 1) raf = requestAnimationFrame(tick); else end(); };
      frame(rev ? 1 : 0);
      raf = requestAnimationFrame(tick);
      setTimeout(end, DUR + 300); // in case frames stop (background tab)
      return el;
    }

    function turn(from, to) {
      const a = spreads[from], b = spreads[to], fwd = to > from;
      busy = true;
      const land = () => { paint(to); busy = false; };
      window.Sfx?.play('page');
      if (reduce) return land();
      // forward: the next page is already underneath; back: the page it returns to is revealed
      if (single) { if (fwd) R.innerHTML = page(b.r); curl(fwd ? a.r : b.r, null, !fwd, land); }
      else if (fwd) { L.innerHTML = page(b.l); curl(a.l, b.r, false, land); }
      else { R.innerHTML = page(b.r); curl(b.l, a.r, true, land); }
    }

    function show(s, dir) {
      // a key pressed mid-turn: land the current page first
      if (busy) { book.querySelector('.curl')?.remove(); paint(shown); busy = false; }
      if (shown === null || !dir || Math.abs(s - shown) !== 1) paint(s);
      else turn(shown, s);
      shown = s;
    }
    return { show, busy: () => busy };
  }

  return { $, fmt, social, media, pages, spreadbook };
})();
