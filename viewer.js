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
  function pages({ steps, key, likes, xp = 0, start = 0, label, onShow, save = (i) => i, load = (v) => v }) {
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
    const next = () => { if (stopped) return; at < steps - 1 ? go(at + 1, 1) : finish(); };
    const prev = () => { if (!stopped && at > 0) go(at - 1, -1); };

    function finish() {
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
    $('again').addEventListener('click', () => { $('done').hidden = true; go(0); });
    $('ask').addEventListener('click', (e) => { e.preventDefault(); s.toast('أرسلنا طلبك، وسنخبرك عندما يوافق'); });

    addEventListener('keydown', (e) => {
      if (document.activeElement === $('msg')) return;
      if (e.key === 'ArrowLeft') next();
      if (e.key === 'ArrowRight') prev();
    });
    addEventListener('contextmenu', (e) => { if (e.target.closest('.book')) e.preventDefault(); });

    onShow(at, 0);
    return { next, prev, go, at: () => at, toast: s.toast };
  }

  return { $, fmt, social, media, pages };
})();
