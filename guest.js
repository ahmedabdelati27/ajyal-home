// Visitor mode: someone who came in from the landing page without signing in (its «تصفّح كزائر» button, or an island there).
// A visitor can walk the whole world and open what is free for visitors (in the prototype: the first two of each row; the
// rest asks to sign in, as the admin will decide per item), but nothing of the visit is kept: there is no profile, no points,
// badges or streak, and what the pages save lives only until the visit ends. Anything tied to a child's account (my room,
// the boards, the magic workshop, contests, liking, commenting, saving or sending a work) asks to sign in, and the visitor can
// always carry on.
// Loaded first on every page of the world; the sign-in pages end the visit.
(() => {
  const KEY = 'ajyal.guest';
  const q = new URLSearchParams(location.search);
  if (q.get('guest') === '1') sessionStorage.setItem(KEY, '1');
  const on = sessionStorage.getItem(KEY) === '1';
  window.Guest = { on };
  if (!on) return;
  document.documentElement.classList.add('guest');

  // what the pages save goes to this tab's visit only, apart from everything the child's own account keeps
  const proto = Storage.prototype, get = proto.getItem, set = proto.setItem, del = proto.removeItem;
  const mine = (store, k) => store === localStorage && typeof k === 'string' && k.startsWith('ajyal.');
  proto.getItem = function (k) { return mine(this, k) ? get.call(sessionStorage, 'visit:' + k) : get.call(this, k); };
  proto.setItem = function (k, v) { return mine(this, k) ? set.call(sessionStorage, 'visit:' + k, v) : set.call(this, k, v); };
  proto.removeItem = function (k) { return mine(this, k) ? del.call(sessionStorage, 'visit:' + k) : del.call(this, k); };

  // the places that belong to a child's account
  const SHEETS = ['room', 'leaders', 'points', 'badges', 'streak', 'notes', 'settings'];
  const PAGES = /(^|\/)(room|leaders|points|badges|streak|notes|settings|create|hero|contest)\.html/;
  const CONTENT = /(^|\/)(story|video|audio|book|flipbook|pictures|learn|surah|game[a-z-]*|value|color|quiz)\.html/;
  const FREE = 2;
  const end = () => { Object.keys(sessionStorage).filter((k) => k === KEY || k.startsWith('visit:')).forEach((k) => sessionStorage.removeItem(k)); };

  const css = `
html.guest #points-pill, html.guest #badges-pill, html.guest #streak-pill, html.guest #bell, html.guest .hud.pill.time,
html.guest .hud.resume, html.guest .hud.mission, html.guest .isl .mark, html.guest .stats .pill, html.guest [title="النقاط"], html.guest [title="أيام متتالية"], html.guest [title="الشارات"], html.guest [title="الوقت المتبقي اليوم"], html.guest .tag.done, html.guest .prog, html.guest .state { visibility: hidden !important; }
html.guest .cont, html.guest [aria-labelledby="cont"] { display: none !important; }
.visit-bar { position: fixed; z-index: 9000; left: 14px; bottom: 14px; display: flex; align-items: center; gap: 10px; max-width: calc(100vw - 24px);
  padding: 7px 8px 7px 14px; border-radius: 999px; background: rgba(58,35,24,.92); color: #fff; font: 700 15px/1.3 'Thmanyah Sans', system-ui, sans-serif; box-shadow: 0 8px 24px rgba(58,35,24,.25); }
.visit-bar img { width: 30px; height: 30px; }
.visit-bar a { flex-shrink: 0; padding: 6px 14px; border-radius: 999px; font-weight: 800; text-decoration: none; }
.visit-bar .join { background: linear-gradient(#3FA83A, #2E8B2A); color: #fff; }
.visit-bar .out { color: #FFE7A3; padding-inline: 8px; }
.visit-bar .short { display: none; }
@media (max-width: 600px) {
  .visit-bar { left: 10px; bottom: 10px; gap: 6px; padding: 5px 6px 5px 10px; font-size: 13px; }
  .visit-bar img { width: 24px; height: 24px; }
  .visit-bar .long { display: none; } .visit-bar .short { display: inline; }
  .visit-bar a { padding: 5px 12px; }
}
.visit-gate { position: fixed; z-index: 9001; inset: 0; display: grid; place-items: center; padding: 16px; background: rgba(40,28,20,.45); font-family: 'Thmanyah Sans', system-ui, sans-serif; }
.visit-gate[hidden] { display: none; }
.visit-gate .card { display: flex; flex-direction: column; align-items: center; gap: 10px; width: min(400px, 100%); padding: 26px 24px 22px; border-radius: 28px; background: #FFF7EC; text-align: center; color: #3A2318; box-shadow: 0 20px 50px rgba(0,0,0,.25); }
.visit-gate img { width: 96px; }
.visit-gate h2 { margin: 0; font-size: 22px; font-weight: 800; }
.visit-gate p { margin: 0 0 6px; font-size: 16px; font-weight: 600; line-height: 1.6; color: #6B5A48; }
.visit-gate .row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.visit-gate a, .visit-gate button { display: inline-flex; align-items: center; height: 46px; padding: 0 20px; border: 0; border-radius: 999px; font: 800 16px 'Thmanyah Sans', system-ui, sans-serif; text-decoration: none; cursor: pointer; }
.visit-gate .join { background: linear-gradient(#3FA83A, #2E8B2A); color: #fff; box-shadow: 0 4px 0 #1F6A1C; }
.visit-gate .in { background: #fff; color: #3A2318; box-shadow: 0 0 0 2px #F1DEC2, 0 4px 0 #F1DEC2; }
.visit-gate .stay { background: none; color: #2F6FA8; height: auto; padding: 6px; }
.visit-lock { position: absolute; z-index: 5; top: 8px; left: 8px; display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; background: rgba(58,35,24,.85); color: #fff; font: 800 13px/1.3 'Thmanyah Sans', system-ui, sans-serif; pointer-events: none; }`;

  const ready = () => {
    const st = document.createElement('style'); st.textContent = css; document.head.append(st);
    // the bar: the visit is not kept, an account keeps it
    const bar = document.createElement('div');
    bar.className = 'visit-bar'; bar.setAttribute('role', 'note');
    bar.innerHTML = '<img src="img/garden/nour-wave.png" alt=""><span class="long">تتصفّح كزائر، ولا يُحفظ تقدّمك</span><span class="short">زائر</span><a class="join" href="signup.html">أنشئ حساباً</a><a class="out" href="landing.html">خروج</a>';
    bar.querySelector('.out').addEventListener('click', end);
    document.body.append(bar);
    // the ask: this belongs to a child's account
    const gate = document.createElement('div');
    gate.className = 'visit-gate'; gate.hidden = true;
    gate.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="visit-t">
      <img src="img/garden/nour-cheer.png" alt="">
      <h2 id="visit-t"></h2>
      <p id="visit-p"></p>
      <div class="row"><a class="in" href="login.html">دخول ولي الأمر / المؤسسة</a><a class="join" href="signup.html">أنشئ حساباً</a></div>
      <button class="stay" type="button">متابعة التصفّح</button></div>`;
    const close = () => { gate.hidden = true; };
    gate.querySelector('.stay').addEventListener('click', close);
    gate.addEventListener('click', (e) => { if (e.target === gate) close(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !gate.hidden) close(); });
    document.body.append(gate);
    const SAY = {
      account: ['هذه الميزة لحساب الطفل', 'اطلب من ولي أمرك أو معلّمك أن يدخل بحسابه، ليُحفظ تقدّمك ونقاطك وإبداعاتك. ويمكنك متابعة التصفّح كزائر.'],
      content: ['هذا المحتوى بعد الدخول', 'يمكنك كزائر فتح المحتوى المتاح للزوار. ولكل المحتوى، اطلب من ولي أمرك أو معلّمك أن يدخل بحسابه.']
    };
    const ask = (e, what = 'account') => {
      if (e) { e.preventDefault(); e.stopImmediatePropagation(); }
      gate.querySelector('#visit-t').textContent = SAY[what][0]; gate.querySelector('#visit-p').textContent = SAY[what][1];
      gate.hidden = false; gate.querySelector('.in').focus();
    };
    window.Guest.ask = ask;

    // the child's card on the map is a visitor's
    const me = document.getElementById('me');
    if (me) { const n = me.querySelector('.name'); if (n) n.textContent = 'زائر'; const im = me.querySelector('img'); if (im) im.src = 'img/avatar.png'; me.setAttribute('aria-label', 'زائر'); }
    // the map opened on an account sheet (?open=room) opens plain, with the ask
    if (SHEETS.includes(q.get('open'))) { history.replaceState(null, '', location.pathname); ask(); }

    // anything tied to the account, caught before the page acts on it
    document.addEventListener('click', (e) => {
      const t = e.target.closest('a, button');
      if (!t || t.closest('.visit-gate, .visit-bar')) return;
      if (t.matches('#me, #points-pill, #badges-pill, #streak-pill, #bell, #gear, #save, #publish, #like')) return ask(e);
      if (t.classList.contains('visit-locked')) return ask(e, 'content');
      const href = t.getAttribute('href') || '';
      const m = href.match(/[?&]open=([a-z]+)/);
      if ((m && SHEETS.includes(m[1])) || PAGES.test(href)) ask(e);
    }, true);
    // comments: writing one asks too
    document.addEventListener('focusin', (e) => { if (e.target.closest('#write')) { e.target.blur(); ask(); } }, true);
    document.addEventListener('submit', (e) => { if (e.target.closest('#write')) ask(e); }, true);

    // content open to visitors: the first two of each row; the others carry a lock and ask (the pages build their rows in
    // script, sometimes later, so this runs again whenever they change)
    const lock = () => {
      const rows = new Map();
      document.querySelectorAll('a[href]').forEach((a) => {
        const href = a.getAttribute('href');
        // a content page, or a card on a shelf (some shelf cards are not linked yet in the prototype)
        if (!(CONTENT.test(href) || a.matches('.item:not(.all)')) || /[?&]resume=/.test(href) || a.closest('.visit-gate, .visit-bar')) return;
        const row = rows.get(a.parentElement) || []; row.push(a); rows.set(a.parentElement, row);
      });
      rows.forEach((row) => row.slice(FREE).forEach((a) => {
        if (a.classList.contains('visit-locked')) return;
        a.classList.add('visit-locked');
        if (getComputedStyle(a).position === 'static') a.style.position = 'relative';
        const b = document.createElement('span'); b.className = 'visit-lock'; b.textContent = '🔒 بعد الدخول'; a.append(b);
      }));
    };
    // the pages greet the demo child by name; a visitor is greeted as a friend
    const rename = () => {
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('script, style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      const word = /(^|[^؀-ۿ])عمر(?![؀-ۿ])/g;
      for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.nodeValue.includes('عمر')) n.nodeValue = n.nodeValue.replace(word, '$1صديقي');
    };
    const tidy = () => { lock(); rename(); };
    tidy();
    let later = 0;
    new MutationObserver(() => { clearTimeout(later); later = setTimeout(tidy, 60); }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
