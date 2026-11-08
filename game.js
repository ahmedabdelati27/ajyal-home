// shared pieces of the mini games: the fox tips, pops, confetti, the result card and drag-or-tap placing.
// The BRD keeps games to a few reusable mechanics, so each game page holds only its data and its rule
// for what is right; the admin builds a game from a supported type and fills in its items.
(() => {
  const { $ } = Viewer;
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

  function kit() {
    const scene = $('scene'), play = $('play'), over = $('over');
    const tip = (s) => { $('tip').textContent = s; };
    // replay a one-shot animation class on an element
    const nudge = (el, c) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };
    const pop = (el, s) => {
      window.Sfx?.play('right');
      const r = el.getBoundingClientRect(), sr = scene.getBoundingClientRect();
      const p = document.createElement('span'); p.className = 'pop'; p.textContent = s;
      p.style.left = r.left - sr.left + r.width / 2 + 'px'; p.style.top = r.top - sr.top + 'px';
      scene.appendChild(p); setTimeout(() => p.remove(), 800);
    };
    function burst(sound = true) {
      if (sound) window.Sfx?.play('win');
      const c = document.createElement('div'); c.className = 'confetti';
      const colors = ['#F4823F', '#FFC93C', '#5BC236', '#3D96D6', '#F58DA6'];
      c.innerHTML = Array.from({ length: 30 }, (_, i) => `<i style="background:${colors[i % 5]};--x:${(Math.random() - 0.5) * 80}cqw;--y:${-20 - Math.random() * 40}cqh;--r:${Math.random() * 720}deg"></i>`).join('');
      scene.appendChild(c); setTimeout(() => c.remove(), 1300);
    }
    // a stage is done: confetti, then the next stage
    const cheer = (then) => setTimeout(() => { burst(); setTimeout(then, 900); }, 400);
    // a simple celebration at the end: no score, lives or coins. XP comes from gamification and only for
    // the first completion; playing again shows the same celebration without points
    function result({ id, title, text, xp, next }) {
      const key = `ajyal.done.${id}`;
      let first = true;
      try { first = !localStorage.getItem(key); localStorage.setItem(key, '1'); } catch {}
      // a game opened from a value journey in the garden leads back to that journey
      const journey = /value\.html/.test(document.referrer) ? document.referrer : null;
      over.innerHTML = `<div class="box2"><h2>${title}</h2><p>${text}</p>
        ${xp && first ? `<span class="gain"><img src="img/forest/I-06.png" alt="">+${ar(xp)} نقطة</span>` : ''}
        <div class="btns"><a class="btn go" href="${journey || 'games.html'}">${journey ? 'العودة إلى رحلتك مع نور' : 'العودة إلى الكثبان'}</a><button class="btn soft" id="again" type="button">العب مرة أخرى</button>${next ? `<button class="btn soft" id="next-game" type="button">اللعبة التالية: ${next}</button>` : ''}</div></div>`;
      // the stage that just ended already played the celebration sound
      burst(false);
    }
    // two misses on the same item: the right answer glows for a moment
    function miss(item, right, first, second) {
      window.Sfx?.play('retry');
      nudge(item, 'back'); item.classList.remove('picked');
      item.dataset.miss = +(item.dataset.miss || 0) + 1;
      if (item.dataset.miss >= 2 && right) { setTimeout(() => window.Sfx?.play('bubble'), 350); nudge(right, 'hint'); setTimeout(() => right.classList.remove('hint'), 2200); tip(second); }
      else tip(first);
    }
    return { scene, play, over, tip, nudge, pop, burst, cheer, result, miss };
  }

  // drag an item onto a target, or tap the item and then tap the target
  function place({ root, items, targets, onDrop, onPick = () => {} }) {
    let drag = null, picked = null;
    const at = (x, y) => [...root.querySelectorAll(targets)].find((t) => { const r = t.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; });
    const unpick = () => { root.querySelectorAll('.picked').forEach((p) => p.classList.remove('picked')); };
    root.addEventListener('pointerdown', (e) => {
      const it = e.target.closest(items); if (!it) return;
      e.preventDefault();
      const g = it.cloneNode(true); g.classList.remove('picked', 'back', 'hint'); g.classList.add('ghost');
      g.style.width = it.offsetWidth + 'px'; g.style.height = it.offsetHeight + 'px';
      document.body.appendChild(g);
      window.Sfx?.play('pick');
      drag = { it, g, x: e.clientX, y: e.clientY, moved: false };
      move(e);
    });
    function move(e) {
      drag.g.style.left = e.clientX + 'px'; drag.g.style.top = e.clientY + 'px';
      const hot = at(e.clientX, e.clientY);
      root.querySelectorAll(targets).forEach((t) => t.classList.toggle('hot', t === hot));
    }
    addEventListener('pointermove', (e) => { if (!drag) return; if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) drag.moved = true; move(e); });
    addEventListener('pointerup', (e) => {
      if (!drag) return;
      const { it, g, moved } = drag; drag = null; g.remove();
      root.querySelectorAll('.hot').forEach((t) => t.classList.remove('hot'));
      const t = at(e.clientX, e.clientY);
      if (moved && t) { picked = null; unpick(); return onDrop(it, t); }
      if (!moved) { unpick(); picked = it; it.classList.add('picked'); onPick(it); }
    });
    root.addEventListener('click', (e) => {
      const t = e.target.closest(targets);
      if (t && picked && picked.isConnected) { const it = picked; picked = null; it.classList.remove('picked'); return onDrop(it, t); }
      // keyboard: Enter or Space on an item picks it (a pointer pick already happened on pointerup)
      const it = e.target.closest(items);
      if (it && e.detail === 0) { unpick(); picked = it; it.classList.add('picked'); onPick(it); }
    });
    // a target that is not a button (like a build area) still answers Enter and Space
    root.addEventListener('keydown', (e) => {
      const t = e.target.closest(targets);
      if (t && t.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); t.click(); }
    });
    return { reset: () => { picked = null; } };
  }

  window.Game = { ar, kit, place };
})();
