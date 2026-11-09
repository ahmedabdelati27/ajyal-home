// the doors of «ورشة السحر» and the child's works made there, shared by the web's workshop and the phone's.
// base: where the site's files are from the calling page ('' or '../'). Needs valley.js and workshop.js.
const WorkshopBoard = (() => {
  const { KINDS, left, count, open } = Workshop;
  const KIND_OF = { 'ai-story': 'قصة مصورة', 'ai-video': 'فيديو', hero: 'أنت بطل القصة' };
  // a saved work keeps its paths from the site's folder; a picture may also be kept as data
  const at = (base, src) => (/^(data:|blob:|https?:|\/)/.test(src || '') ? src : base + src);

  // two AI doors show what is left of them; the hero door uses stories already in the library
  // a closed feature (not in the package, or switched off by the parent) says so without «انتهت» and without prices
  function doors(base = '') {
    const ai = (k) => {
      const K = KINDS[k], on = open(k), n = on && left(k);
      return { k, href: `${base}create.html?k=${k}`, art: `${base}img/workshop/${K.cover}.jpg`, name: K.n, about: K.about, out: !n,
        badge: window.Guest && Guest.on ? '🔒 بعد الدخول' : on ? `✨ ${count(k)}` : '🔒 غير متاحة الآن', cta: n ? (k === 'story' ? 'اصنع قصة' : 'اصنع فيديو') : 'لماذا لا أستطيع؟' };
    };
    const hero = open('hero');
    return [ai('story'), ai('video'), { k: 'hero', href: `${base}hero.html`, art: `${base}img/workshop/k-hero.jpg`, name: 'أنت بطل القصة',
      about: 'ضع اسمك وصورتك في قصة من شاطئ الحكايات', out: !hero, badge: hero ? '' : '🔒 غير متاحة الآن', cta: hero ? 'اختر قصة' : 'لماذا لا أستطيع؟' }];
  }

  // «إبداعاتي» made here: AI stories and videos, and the child's own copies of beach stories
  const works = (base = '') => Valley.works.read().filter((w) => KIND_OF[w.kind])
    .map((w) => ({ href: at(base, w.href), img: at(base, w.img), name: w.name, kind: KIND_OF[w.kind], state: w.state, said: Valley.STATES[w.state] }));

  // everything the child can open in the workshop, for its search: the doors first, then the topics and the stories
  // to be the hero of, then «إبداعاتي». A closed door still shows and says so, as on the board (a visitor sees «بعد الدخول»).
  const SAY = { story: ['قصة', 'قصص', 'صور', 'حكاية', 'اصنع', 'ذكاء اصطناعي'], video: ['فيديو', 'فيديوهات', 'فلم', 'فيلم', 'اصنع', 'ذكاء اصطناعي'],
    hero: ['بطل', 'قصة', 'اسمي', 'صورتي', 'شاطئ الحكايات'] };
  function searchItems(base = '') {
    const { TOPICS, HERO, MADE } = Workshop;
    const guest = window.Guest && Guest.on;
    const state = (k) => (guest ? 'بعد الدخول' : open(k) ? '' : 'غير متاحة الآن');
    const ds = doors(base).map((d) => ({ title: d.name, img: d.art, href: d.href, rank: 0, words: SAY[d.k],
      sub: [d.about, d.badge.replace(/^\S+\s/, '')].filter(Boolean).join(' · ') }));
    // a topic opens the making of the kind it is ready for in the prototype (the story, unless it is the video's)
    const topics = TOPICS.map((t) => {
      const k = MADE.video.topic === t.id ? 'video' : 'story';
      return { title: t.n, img: `${base}img/workshop/t-${t.id}.jpg`, href: `${base}create.html?k=${k}`, rank: 1, words: ['موضوع', KINDS[k].n, ...SAY[k]],
        sub: [`موضوع · ${KINDS[k].n}`, state(k)].filter(Boolean).join(' · ') };
    });
    // only the ready story opens straight to its characters; the others are not in the prototype yet
    const tales = HERO.map((t) => ({ title: t.title, img: `${base}img/stories/cover-${String(t.cover).padStart(2, '0')}.jpg`, rank: 1, words: SAY.hero,
      href: t.ready ? `${base}hero.html?s=${t.id}` : undefined, sub: ['أنت بطل القصة', state('hero')].filter(Boolean).join(' · ') }));
    const mine = works(base).map((w) => ({ title: w.name, img: w.img, href: w.href, rank: 2, words: ['إبداعاتي', w.kind, w.said],
      sub: `من إبداعاتي · ${w.kind} · ${w.said}` }));
    return [...ds, ...topics, ...tales, ...mine];
  }

  return { doors, works, searchItems };
})();
