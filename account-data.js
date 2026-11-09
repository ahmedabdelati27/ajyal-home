// the child's points, badges and days in a row as the web's pages and the phone's show them (the numbers are in profile.js),
// and reading aloud for children who do not read yet. base: where the site's files are from the calling page ('' or '../');
// it also picks the links: the phone app has a page of the same name for each place, and «غرفتي» and the board are pages there,
// where the web opens them as panels over the map.
const Account = (() => {
  const { ar } = Profile;
  const place = (href, base) => {
    const m = base && href.match(/^index\.html\?open=([a-z]+)(?:&tab=([a-z]+))?/);
    return m ? `${m[1]}.html${m[2] ? `#${m[2]}` : ''}` : href;
  };
  // a place the parent switched off (the magic workshop's switches, workshop.js)
  const off = (need) => !!need && !!window.Workshop && !Workshop.open(need);
  const days = (n) => (n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : n <= 10 ? `${ar(n)} أيام` : `${ar(n)} يوماً`);

  // «نقاطي»: the total, the level and how far to the next, the levels, and the ways to earn
  function points(base = '') {
    const { LEVELS, EARN, ME_RANK } = Profile, me = Profile.read();
    const top = me.level >= LEVELS.length;
    return { xp: me.xp, level: me.level, top, left: me.to - me.xp, rank: ME_RANK, leaders: place('index.html?open=leaders', base),
      pct: top ? 100 : Math.round((me.xp - me.from) / (me.to - me.from) * 100),
      levels: LEVELS.map((p, i) => ({ n: i + 1, p, state: i + 1 < me.level ? 'done' : i + 1 === me.level ? 'now' : '' })),
      // a way the child cannot use now says so plainly, without prices
      earn: EARN.map((w) => ({ ...w, img: base + w.img, href: place(w.go[0], base), where: w.go[1], shut: off(w.need) })),
      say: (more) => `كيف تكسب النقاط؟ ${EARN.map((w) => `${w.n}: ${w.xp} نقطة`).join('. ')}. ${more}` };
  }

  // «شاراتي»: every badge the admin left on, earned or not, how to earn it and where
  const SHOW = [['all', 'كل الشارات'], ['got', 'حصلت عليها'], ['wait', 'لم أحصل عليها بعد']];
  function badges(base = '') {
    const list = Profile.BADGES.map((b) => {
      const shut = !b.got && off(b.need);
      return { ...b, img: `${base}img/badges/${b.id}.png`, shut, pct: b.prog ? b.prog[0] / b.prog[1] * 100 : 0,
        href: !b.got && b.go && !shut ? place(b.go[0], base) : '', where: b.go ? b.go[1] : '',
        say: `${b.n}. ${b.got ? 'حصلت عليها. شرطها' : 'كيف تحصل عليها'}: ${b.how}` };
    });
    return { list, got: list.filter((b) => b.got).length, of: list.length,
      shown: (show) => list.filter((b) => show === 'all' || (show === 'got' ? b.got : !b.got)) };
  }

  // «الأيام المتتالية»: today's count, the last seven days ending today, and the goals (one may carry a badge)
  function streak(base = '') {
    const { STREAK, BADGES } = Profile, n = STREAK.now, last = STREAK.week.length - 1;
    const next = STREAK.goals.find((g) => g.d > n);
    return { now: n, best: days(STREAK.best), all: !next,
      unit: n === 1 ? 'يوم' : n === 2 ? 'يومان متتاليان' : n <= 10 ? 'أيام متتالية' : 'يوماً متتالياً',
      cheer: n ? `أحسنت! ادخل غداً لتصبح سلسلتك ${days(n + 1)}.` : 'ابدأ اليوم، وأضئ أول يوم في سلسلتك!',
      week: STREAK.week.map(([name, d, on], i) => ({ name: i === last ? 'اليوم' : name, d, on, today: i === last })),
      goals: STREAK.goals.map((g) => {
        const b = g.badge && BADGES.find((x) => x.id === g.badge);
        const done = n >= g.d || (STREAK.best >= g.d && !!b && b.got), isNext = g === next;
        return { d: g.d, n: days(g.d), state: done ? 'done' : isNext ? 'next' : '',
          says: done ? 'وصلت إليه' : isNext ? `باقي ${days(g.d - n)}` : 'هدف قادم',
          badge: b ? { id: b.id, n: b.n, got: b.got, img: `${base}img/badges/${b.id}.png` } : null };
      }) };
  }

  // read aloud in an Arabic voice; tell (a short message) says when the device has none
  const synth = window.speechSynthesis; synth?.getVoices();
  function speak(text, tell) {
    const v = synth?.getVoices().find((x) => x.lang?.startsWith('ar'));
    if (!v) return tell('لا يوجد صوت عربي على هذا الجهاز');
    synth.cancel(); window.Sfx && Sfx.hush(true);
    const u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = 0.9;
    u.onend = u.onerror = () => window.Sfx && Sfx.hush(false); synth.speak(u);
  }

  return { points, badges, streak, SHOW, days, speak };
})();
