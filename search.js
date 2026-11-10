// Search inside an island: the child types or says what they want, and gets that island's things to open.
// From the BRD: text and voice search, suggestions after a few letters, forgiving small spelling or speaking mistakes,
// what suits the child's age first without hiding the rest, a result opens its own page, a clear message and a retry
// when nothing is found, and searching earns no points. In the product the matching is the platform's smart search;
// here it is a forgiving match on names and words.
//   IslandSearch.mount({ button, where: 'غابة المعرفة', items: () => [{ title, sub, img, href, words: [], rank }] })
// rank: lower comes first (the island's own order, the child's age group first). An item without href is not in the prototype yet.
// Sound: this file plays nothing and speaks nothing, so it is safe on the Quran pages.
const IslandSearch = (() => {
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  // one spelling for the letters children (and speech) mix up; marks, tatweel and «ال» don't count
  const norm = (s) => String(s || '').toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  const words = (s) => norm(s).split(' ').filter(Boolean).map((w) => (w.length > 4 && w.startsWith('ال') ? w.slice(2) : w));
  // how many single-letter changes turn one word into the other (stops early past the limit)
  function edits(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let low = i;
      for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); low = Math.min(low, cur[j]); }
      if (low > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  // a typed word against an item's word: the start of it, inside it, or close to it
  // (a number is matched as typed: «112» is surah 112, not 110 or 113)
  function fit(q, w) {
    if (q.length === 1) return w === q ? 3 : 0;
    if (w.startsWith(q)) return 3;
    if (/^\d+$/.test(q)) return 0;
    if (q.length >= 3 && w.includes(q)) return 2;
    const max = q.length >= 6 ? 2 : q.length >= 3 ? 1 : 0;
    if (max && edits(q, w.slice(0, Math.max(q.length, Math.min(w.length, q.length + 1))), max) <= max) return 1.5;
    if (max && edits(q, w, max) <= max) return 1.5;
    return 0;
  }
  function score(item, q) {
    const qs = words(q); if (!qs.length) return 0;
    const own = item._w || (item._w = [...words(item.title), ...(item.words || []).flatMap(words), ...words(item.sub)]);
    const title = item._t || (item._t = words(item.title));
    let total = 0, loose = false;
    for (const x of qs) {
      let best = 0, near = 0;
      for (const w of own) { const s = fit(x, w); if (s >= 2) best = Math.max(best, s * (title.includes(w) ? 1.3 : 1)); else near = Math.max(near, s); }
      if (!best && !near) return 0;
      if (!best) loose = true;
      total += best || near;
    }
    // a match only by a near spelling, kept aside for when nothing matches as typed
    item._loose = loose;
    return total;
  }

  const css = `
.isearch { position: fixed; z-index: 8000; inset: 0; display: flex; flex-direction: column; background: #FFFAF2; font-family: 'Thmanyah Sans', system-ui, sans-serif; color: #3A2318; direction: rtl;
  padding: max(var(--safe-top, env(safe-area-inset-top)), 12px) calc(14px + var(--safe-right, env(safe-area-inset-right))) max(var(--safe-bottom, env(safe-area-inset-bottom)), 12px) calc(14px + var(--safe-left, env(safe-area-inset-left))); }
.isearch[hidden] { display: none; }
.isearch * { box-sizing: border-box; }
.isearch .row { display: flex; align-items: center; gap: 8px; width: min(760px, 100%); margin: 0 auto; }
.isearch .field { position: relative; flex: 1; min-width: 0; }
.isearch input { width: 100%; height: 56px; padding: 0 50px 0 16px; border: 3px solid #F1DEC2; border-radius: 999px; background: #FFFFFF; font: 700 19px 'Thmanyah Sans', system-ui, sans-serif; color: inherit; outline: none; -webkit-appearance: none; appearance: none; }
.isearch input:focus { border-color: #F4823F; }
.isearch input::-webkit-search-cancel-button { display: none; }
.isearch .field svg { position: absolute; right: 16px; top: 50%; width: 24px; height: 24px; translate: 0 -50%; color: #B4531C; pointer-events: none; }
.isearch .mic, .isearch .x { flex-shrink: 0; display: grid; place-items: center; width: 56px; height: 56px; border: 0; border-radius: 50%; cursor: pointer; }
.isearch .mic { background: linear-gradient(#F4823F, #D6531E); color: #FFFFFF; box-shadow: 0 4px 0 #A8401A; }
.isearch .mic svg { width: 26px; height: 26px; }
.isearch .mic.on { animation: isearch-pulse 1s ease-in-out infinite; }
@keyframes isearch-pulse { 50% { box-shadow: 0 4px 0 #A8401A, 0 0 0 10px rgba(244,130,63,.25); } }
.isearch .x { width: 48px; height: 48px; background: #FFFFFF; color: #6B5A48; box-shadow: 0 0 0 2px #F1DEC2; }
.isearch .x svg { width: 22px; height: 22px; }
.isearch .where { width: min(760px, 100%); margin: 10px auto 0; font-size: 15px; font-weight: 800; color: #6B5A48; }
.isearch .hear { width: min(760px, 100%); margin: 8px auto 0; padding: 8px 14px; border-radius: 16px; background: #FFF1D6; font-size: 16px; font-weight: 800; color: #8A4A12; }
.isearch .hear[hidden], .isearch .sugs[hidden], .isearch .none[hidden] { display: none; }
.isearch .sugs { display: flex; gap: 8px; width: min(760px, 100%); margin: 10px auto 0; overflow-x: auto; scrollbar-width: none; }
.isearch .sugs::-webkit-scrollbar { display: none; }
.isearch .sugs button { flex-shrink: 0; height: 40px; padding: 0 14px; border: 0; border-radius: 999px; background: #FFFFFF; box-shadow: 0 0 0 2px #F1DEC2; font: 800 15px 'Thmanyah Sans', system-ui, sans-serif; color: inherit; cursor: pointer; }
.isearch .sugs b { color: #D6531E; }
.isearch .list { flex: 1; min-height: 0; overflow-y: auto; width: min(760px, 100%); margin: 12px auto 0; padding-bottom: 10px; display: grid; grid-template-columns: 1fr; align-content: start; gap: 10px; scrollbar-width: none; }
.isearch .list::-webkit-scrollbar { display: none; }
.isearch .hit { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 8px; border-radius: 20px; background: #FFFFFF; box-shadow: 0 4px 0 #F1DEC2; color: inherit; text-decoration: none; text-align: start; border: 0; font: inherit; cursor: pointer; }
.isearch .hit img { flex-shrink: 0; width: 84px; height: 60px; border-radius: 14px; object-fit: cover; background: #F6EAD6; }
.isearch .hit span { min-width: 0; }
.isearch .hit b { display: block; font-size: 17px; font-weight: 800; line-height: 1.3; }
.isearch .hit small { display: block; margin-top: 2px; font-size: 13px; font-weight: 700; color: #6B5A48; }
.isearch .hit mark { background: #FFE08A; color: inherit; border-radius: 4px; }
.isearch .none { width: min(760px, 100%); margin: 24px auto 0; text-align: center; }
.isearch .none p { margin: 0 0 12px; font-size: 18px; font-weight: 800; line-height: 1.6; }
.isearch .none button { height: 48px; padding: 0 22px; border: 0; border-radius: 999px; background: #2E8B2A; color: #FFFFFF; font: 800 17px 'Thmanyah Sans', system-ui, sans-serif; box-shadow: 0 4px 0 #1F6A1C; cursor: pointer; }
.isearch .tip { width: min(760px, 100%); margin: 18px auto 0; text-align: center; font-size: 16px; font-weight: 700; color: #6B5A48; line-height: 1.7; }
.isearch .toast { position: fixed; left: 50%; bottom: calc(max(var(--safe-bottom, env(safe-area-inset-bottom)), 12px) + 12px); translate: -50% 0; max-width: calc(100% - 32px); padding: 9px 16px; border-radius: 999px; background: rgba(58,35,24,.92); color: #FFFFFF; font-size: 14px; font-weight: 700; text-align: center; opacity: 0; transition: opacity .25s; pointer-events: none; }
.isearch .toast.show { opacity: 1; }
@media (min-width: 700px) { .isearch .list { grid-template-columns: 1fr 1fr; } }
@media (max-height: 500px) {
  .isearch input, .isearch .mic { height: 46px; } .isearch .mic { width: 46px; } .isearch .x { width: 42px; height: 42px; }
  .isearch .where { margin-top: 6px; font-size: 14px; } .isearch .sugs { margin-top: 6px; } .isearch .sugs button { height: 34px; }
  .isearch .list { margin-top: 8px; grid-template-columns: 1fr 1fr; } .isearch .hit img { width: 70px; height: 48px; }
}
@media (prefers-reduced-motion: reduce) { .isearch .mic.on { animation: none; } }`;

  const ICON = {
    find: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // the longest typed word lit in a name: each letter of the name is matched in its plain spelling,
  // and the name keeps its own marks and spelling inside the highlight
  const lit = (text, q) => {
    const chars = [...text], flat = [], at = [];
    chars.forEach((ch, i) => { const n = /\s/.test(ch) ? ' ' : norm(ch); if (n) { flat.push(n); at.push(i); } });
    const hay = flat.join(''), w = words(q).sort((a, b) => b.length - a.length).find((x) => x.length > 1 && hay.includes(x));
    if (!w) return esc(text);
    const s = hay.indexOf(w), from = at[s];
    let to = at[s + w.length - 1] + 1;
    while (to < chars.length && /[ً-ٰٟـ]/.test(chars[to])) to++;
    return esc(chars.slice(0, from).join('')) + '<mark>' + esc(chars.slice(from, to).join('')) + '</mark>' + esc(chars.slice(to).join(''));
  };

  let box = null;
  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.append(st);
    box = document.createElement('div');
    box.className = 'isearch'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'البحث');
    box.innerHTML = `<div class="row">
        <label class="field">${ICON.find}<input type="search" enterkeyhint="search" autocomplete="off" aria-label="ابحث"></label>
        <button class="mic" type="button" aria-label="ابحث بصوتك">${ICON.mic}</button>
        <button class="x" type="button" aria-label="أغلق البحث">${ICON.x}</button></div>
      <p class="where"></p>
      <p class="hear" hidden role="status"></p>
      <div class="sugs" hidden aria-label="اقتراحات"></div>
      <p class="tip"></p>
      <div class="none" hidden><p></p><button type="button">ابحث من جديد</button></div>
      <div class="list" role="list"></div>
      <div class="toast" role="status"></div>`;
    document.body.append(box);
    return box;
  }

  // min: letters before searching (the oasis searches from one letter, «ب», which then has to match a word exactly)
  function mount({ button, where, items, min = 2 }) {
    if (!button) return;
    button.addEventListener('click', (e) => { e.preventDefault(); open({ where, items, min }); });
  }

  let current = null, rec = null, last = null;
  function open(opts) {
    current = opts; build.done || (build(), build.done = true, wire());
    last = document.activeElement;
    const input = box.querySelector('input');
    input.value = ''; input.placeholder = `ابحث في ${opts.where}`;
    box.querySelector('.where').textContent = '';
    box.querySelector('.tip').textContent = 'اكتب اسم ما تريده، أو اضغط على الميكروفون وقُله بصوتك.';
    box.querySelector('.tip').hidden = false;
    show('');
    box.hidden = false; document.documentElement.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 50);
  }
  function close() {
    stop();
    box.hidden = true; document.documentElement.style.overflow = '';
    if (last && last.focus) last.focus();
  }
  const say = (s) => { const t = box.querySelector('.toast'); t.textContent = s; t.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => t.classList.remove('show'), 2400); };

  // suggestions after two letters, the results under them; what suits the child comes first, nothing is hidden
  function show(q) {
    const list = box.querySelector('.list'), sugs = box.querySelector('.sugs'), none = box.querySelector('.none'), where = box.querySelector('.where');
    const all = current.items() || [];
    const typed = norm(q).length >= (current.min || 2);
    box.querySelector('.tip').hidden = typed;
    if (!typed) { list.innerHTML = ''; sugs.hidden = true; none.hidden = true; where.textContent = ''; return; }
    let hits = all.map((it, i) => ({ it, s: score(it, q), i })).filter((h) => h.s > 0)
      .sort((a, b) => b.s - a.s || (a.it.rank ?? 0) - (b.it.rank ?? 0) || a.i - b.i);
    // near spellings help only when nothing matches as typed («الفيل» doesn't bring «الليل»)
    if (hits.some((h) => !h.it._loose)) hits = hits.filter((h) => !h.it._loose);
    const names = [...new Set(hits.map((h) => h.it.title))].slice(0, 5);
    sugs.hidden = !names.length || (names.length === 1 && norm(names[0]) === norm(q));
    sugs.innerHTML = names.map((n) => `<button type="button" data-s="${esc(n)}">${lit(n, q)}</button>`).join('');
    none.hidden = hits.length > 0;
    none.querySelector('p').textContent = `لم نجد شيئاً باسم «${q.trim()}» في ${current.where}. جرّب كلمة أخرى${canHear() ? '، أو قُلها بصوتك' : ''}.`;
    where.textContent = hits.length ? `وجدنا ${ar(hits.length)} في ${current.where}` : '';
    list.innerHTML = hits.map(({ it }) => `<${it.href ? `a href="${esc(it.href)}"` : 'button type="button" data-soon'} class="hit" role="listitem">
        ${it.img ? `<img src="${esc(it.img)}" alt="">` : ''}<span><b>${lit(it.title, q)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span></${it.href ? 'a' : 'button'}>`).join('');
  }

  // speaking: the device listens in Arabic and the words go into the field; a device without it says so,
  // and the island's sounds stay quiet while it listens
  const canHear = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const quiet = (on) => { if (window.Sfx && Sfx.hush) Sfx.hush(on); };
  function listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition, hear = box.querySelector('.hear'), mic = box.querySelector('.mic');
    if (rec) { stop(); return; }
    if (!SR) { hear.hidden = false; hear.textContent = 'البحث بالصوت غير متاح على هذا الجهاز، اكتب ما تريده.'; return; }
    rec = new SR(); quiet(true); rec.lang = 'ar-SA'; rec.interimResults = true; rec.maxAlternatives = 1;
    mic.classList.add('on'); mic.setAttribute('aria-label', 'أوقف الاستماع');
    hear.hidden = false; hear.textContent = 'أنا أسمعك… قل ما تبحث عنه.';
    rec.onresult = (e) => { const t = [...e.results].map((r) => r[0].transcript).join(' '); box.querySelector('input').value = t; show(t); };
    rec.onerror = (e) => { hear.textContent = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'لم يُسمح باستخدام الميكروفون. اطلب من ولي أمرك السماح به، أو اكتب ما تريده.' : e.error === 'no-speech' ? 'لم أسمع شيئاً. اضغط على الميكروفون وجرّب مرة أخرى.' : 'لم أفهم جيداً. جرّب مرة أخرى أو اكتب ما تريده.'; };
    rec.onend = () => { quiet(false); mic.classList.remove('on'); mic.setAttribute('aria-label', 'ابحث بصوتك'); rec = null; if (box.querySelector('input').value.trim() && !/لم/.test(hear.textContent)) hear.hidden = true; };
    try { rec.start(); } catch { stop(); }
  }
  function stop() { if (rec) { try { rec.stop(); } catch {} rec = null; quiet(false); } }

  function wire() {
    const input = box.querySelector('input');
    input.addEventListener('input', () => { box.querySelector('.hear').hidden = true; show(input.value); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    box.querySelector('.mic').addEventListener('click', listen);
    box.querySelector('.x').addEventListener('click', close);
    box.querySelector('.none button').addEventListener('click', () => { input.value = ''; show(''); input.focus(); });
    box.addEventListener('click', (e) => {
      const s = e.target.closest('[data-s]'); if (s) { input.value = s.dataset.s; show(input.value); return; }
      if (e.target.closest('.hit[data-soon]')) say('في النموذج: هذا المحتوى لم يُضف بعد');
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close(); });
  }

  return { mount, open, norm, score };
})();
