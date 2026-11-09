// shared by «غرفتي» on the web and on the phone: the journeys in «تقدمي», the kinds of works in «إبداعاتي», and what each
// work's state lets the child do. Needs profile.js, values.js and valley.js first.
// base: where the site's files are from the calling page ('' or '../'); own: the pages the caller has its own version of.
const Room = (() => {
  // a path of the site (a page or a picture) is made to work from the calling page; a picture made on the device stays as it is
  const at = (base, p, own = []) => (!p || /^(data:|blob:|https?:|\/)/.test(p) || own.includes(p.split('?')[0]) ? p : base + p);

  // «تقدمي»: only the journeys, with a simple bar, a count and the last thing done
  function journeys(base = '', own = []) {
    const { ar } = Profile, vals = Values.VALUES, doneVals = vals.filter((v) => Values.state(v).complete).length, cur = Values.current();
    return [
      // «أكمل» opens the unfinished thing itself; the counts match what each region shows
      { isl: 'beach', c: '#FFE3EA', d: '#E0607F', n: 'القصص', done: 3, of: 12, last: 'الأرنب الصادق، الصفحة ٦', href: 'story.html?resume=1' },
      { isl: 'letters', c: '#FFF2C2', d: '#E0B000', n: 'الحروف والأرقام', done: 7, of: 64, last: 'حرف الباء', href: 'learn.html?k=l&id=ب' },
      { isl: 'quran', c: '#E2F4D6', d: '#5DAA33', n: 'القرآن الكريم', done: 2, of: 37, last: 'سورة الإخلاص', href: 'surah.html?s=112' },
      { isl: 'games', c: '#ECE6FD', d: '#7B64DA', n: 'الألعاب', done: 2, of: 9, last: 'نظّف البحر', href: 'game.html?resume=1' },
      { isl: 'garden', c: '#D9F3EA', d: '#3FB396', n: 'حديقة القيم', done: doneVals, of: vals.length, last: cur ? `قيمة ${cur.name}، ${ar(Values.state(cur).n)} من ${ar(Values.state(cur).all)} خطوات` : '', href: cur ? `value.html?v=${cur.id}` : 'garden.html' }
    ].map((p) => ({ ...p, img: `${base}img/${p.isl}.png`, href: at(base, p.href, own), pct: Math.round(p.done / p.of * 100) }));
  }

  // «إبداعاتي»: everything the child made, by kind
  const KINDS = [['all', 'الكل'], ['draw', 'رسوماتي'], ['color', 'تلويني'], ['ai-story', 'قصصي'], ['ai-video', 'فيديوهاتي'], ['hero', 'أنت بطل القصة']];
  const KIND_N = { draw: 'رسمة', color: 'تلوين', 'ai-story': 'قصة مصورة', 'ai-video': 'فيديو', hero: 'أنت بطل القصة' };
  const works = (kind = 'all') => Valley.works.read().filter((w) => KIND_N[w.kind] && (kind === 'all' || w.kind === kind));
  const find = (id) => Valley.works.read().find((w) => w.id === id);
  const pic = (w, base = '') => at(base, w.img);
  const open = (w, base = '', own = []) => at(base, w.href || (w.kind === 'color' ? `color.html?pic=${w.pic}` : ''), own);

  // colorings are only kept, and «أنت بطل القصة» copies are not published (Q-105); only what is not under review or published can be deleted
  const SENDABLE = ['draw', 'ai-story', 'ai-video'];
  const SAYS = { private: 'خاصة بك، لا يراها أحد غيرك.', review: 'أرسلتها للنشر، وسيراجعها فريق أجيال، ونخبرك بالنتيجة.', published: 'منشورة، يراها أطفال أجيال. المنشور يبقى في المنصة.', rejected: 'لم تُعتمد للنشر، وتبقى خاصة بك.' };
  const canSend = (w) => w.state === 'private' && SENDABLE.includes(w.kind);
  const canDelete = (w) => w.state === 'private' || w.state === 'rejected';
  const says = (w) => (w.kind === 'color' ? 'أعمال التلوين تُحفظ لك فقط.' : SAYS[w.state]);
  const send = (w) => { w.state = 'review'; Valley.works.save(w); };
  function remove(w) {
    try { localStorage.setItem('ajyal.works', JSON.stringify(Valley.works.read().filter((x) => x.id !== w.id))); } catch {}
    if (w.kind === 'hero') { try { localStorage.removeItem('ajyal.hero.honest'); } catch {} }
  }

  // a drawing from the device is kept private, like a drawing made here; done(saved, what to tell the child)
  function upload(f, done) {
    if (!/^image\/(png|jpeg)$/.test(f.type)) return done(false, 'اختر صورة بصيغة JPG أو PNG');
    const img = new Image();
    img.onload = () => {
      const s = 600, k = Math.min(1, s / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      const ok = Valley.works.save({ id: `upload-${Date.now()}`, kind: 'draw', name: 'رسمة من جهازي', img: c.toDataURL('image/jpeg', .85), state: 'private', at: Date.now() });
      done(ok, ok ? 'حُفظت في إبداعاتي، خاصة بك' : 'لم نستطع الحفظ على هذا الجهاز');
    };
    img.onerror = () => done(false, 'لم نستطع فتح هذه الصورة');
    img.src = URL.createObjectURL(f);
  }

  // the name the child may write: two to twelve letters
  const okName = (v) => /^[ء-ْa-zA-Z ]{2,12}$/.test(v);

  return { journeys, KINDS, KIND_N, works, find, pic, open, canSend, canDelete, says, send, remove, upload, okName };
})();
