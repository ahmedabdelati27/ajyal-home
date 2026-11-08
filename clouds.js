// the cloud curtain (see clouds.css). Clouds.go(url) closes the clouds and opens the region;
// Clouds.cover(fn) closes them, runs fn behind them, and parts them again; Clouds.part() opens them at once
// (for a message that must not wait, like the end of today's time).
// A page reached through Clouds.go starts with the clouds closed and parts them once its first screen has loaded.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'ajyal.clouds', SRC = 'img/clouds/cloud.webp?v=3', CLOSE = 500;
  let arrived = false;
  try { arrived = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch {}

  // while the clouds are closed nothing behind them can be tapped or read out
  const block = (on) => { if (document.body) document.body.inert = on; };
  // timers rather than animation frames, so the clouds still part in a tab that opened in the background
  function part() {
    root.classList.remove('clouds-still');
    void getComputedStyle(root, '::before').transform;
    setTimeout(() => { root.classList.remove('clouds-shut'); block(false); wait(false); }, 30);
  }

  if (arrived && !reduce) {
    root.classList.add('clouds-shut', 'clouds-still');
    let done = false;
    const go = () => { if (!done) { done = true; setTimeout(part, 60); } };
    // part when the pictures on the first screen are in, and never keep a child behind the clouds for long
    document.addEventListener('DOMContentLoaded', () => {
      block(true);
      const first = [...document.images].filter((i) => !i.complete && i.getBoundingClientRect().top < innerHeight);
      Promise.all(first.map((i) => new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))).then(go);
    });
    setTimeout(go, 1500);
  }
  // coming back with the browser's back button can restore a page with its clouds still closed
  addEventListener('pageshow', (e) => { if (e.persisted) { root.classList.remove('clouds-shut', 'clouds-still'); block(false); wait(false); } });

  // a few soft dots on the clouds if the next page is slow to answer
  function wait(on) {
    let el = document.getElementById('clouds-wait');
    if (!on) { el?.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'clouds-wait'; el.setAttribute('role', 'status'); el.innerHTML = '<span><i></i><i></i><i></i></span>لحظة من فضلك'; document.body.appendChild(el); }
  }

  // close once the cloud picture is ready (the map loads it early), and never wait on it for long
  function shut(then) {
    block(true);
    const img = new Image(); img.src = SRC;
    let closed = false;
    const close = () => { if (closed) return; closed = true; window.Sfx?.play('clouds'); root.classList.add('clouds-shut'); setTimeout(then, CLOSE + 50); };
    if (img.complete) return close();
    img.onload = img.onerror = close;
    setTimeout(close, 300);
  }

  window.Clouds = {
    go(url) {
      if (reduce) { location.href = url; return; }
      const pre = document.createElement('link'); pre.rel = 'prefetch'; pre.href = url; document.head.appendChild(pre);
      try { sessionStorage.setItem(KEY, '1'); } catch {}
      shut(() => { setTimeout(() => wait(true), 1000); location.href = url; });
    },
    cover(fn) {
      if (reduce) { fn(); return; }
      shut(() => { fn(); setTimeout(part, 60); });
    },
    part,
    // the map warms the picture up after its own pictures are in
    warm() { addEventListener('load', () => { const i = new Image(); i.src = SRC; }); }
  };
})();
