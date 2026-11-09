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

  return { doors, works };
})();
