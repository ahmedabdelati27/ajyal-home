// shared by «قمة الأبطال»: the competitions the admin creates, and the child's part in them.
// Two kinds (BRD): an instant one (questions with a time limit, scored by correctness and speed, no live play between children)
// and an ongoing one (entries uploaded or picked from «إبداعاتي», voting, the most votes wins when it ends).
// The child's results, entries and votes are kept on this device for the prototype.
(() => {
  const DAY = 86400000, now = Date.now();
  const kid = (name, img, votes, title) => ({ id: img, name, img, votes, title });
  const COMPS = [
    { id: 'animals', kind: 'quiz', name: 'تحدي عالم الحيوانات', cover: 'c-animals', about: 'خمسة أسئلة سريعة عن الحيوانات وأين تعيش وماذا تأكل',
      start: now - 2 * DAY, end: now + 3 * DAY, people: 128, seconds: 20,
      questions: [
        { type: 'pics', q: 'أي هذه الحيوانات يعيش في البحر؟', opts: [{ img: 'img/games/an-cat.png', name: 'القطة' }, { img: 'img/games/item-05.png', name: 'السمكة' }, { img: 'img/games/an-hen.png', name: 'الدجاجة' }], a: 1 },
        { type: 'tf', q: 'يستطيع الجمل أن يعيش في الصحراء', a: 0 },
        { type: 'mcq', q: 'ماذا تأكل الدجاجة؟', opts: ['الحبوب', 'السمك', 'الحليب'], a: 0 },
        { type: 'pics', q: 'اختر صورة السلحفاة', opts: [{ img: 'img/games/item-07.png', name: 'قنديل البحر' }, { img: 'img/games/an-rabbit.png', name: 'الأرنب' }, { img: 'img/games/item-06.png', name: 'السلحفاة' }], a: 2 },
        { type: 'tf', q: 'تطير القطة في السماء مثل العصفور', a: 1 }] },
    { id: 'home', kind: 'contest', name: 'أفضل رسمة: بيتي الجميل', cover: 'c-draw', about: 'ارسم بيتك أو البيت الذي تحلم به، وصوّت لأجمل رسمة',
      start: now - 4 * DAY, due: now + 3 * DAY, end: now + 5 * DAY, people: 46, votes: 'end', accepts: 'رسمة: صورة JPG أو PNG، أو رسمة من «إبداعاتي»', mine: 'draw',
      rules: ['رسمة واحدة لكل طفل', 'من عمل الطفل نفسه', 'تراجع إدارة أجيال المشاركة قبل أن تظهر للتصويت'],
      entries: [kid('سارة', 'entry-01', 24), kid('عمر', 'entry-02', 17), kid('ليان', 'entry-03', 21), kid('حمد', 'entry-04', 30),
        kid('نورة', 'entry-05', 12), kid('فيصل', 'entry-06', 9), kid('جود', 'entry-07', 15), kid('راشد', 'entry-08', 19)] },
    { id: 'letters', kind: 'quiz', name: 'من يعرف الحروف؟', cover: 'c-letters', about: 'أسئلة سريعة عن الحروف العربية وأصواتها',
      start: now - 12 * DAY, end: now - 2 * DAY, people: 203, seconds: 20, done: { score: 86, right: 4, of: 5 }, questions: [] },
    { id: 'desert', kind: 'contest', name: 'أفضل قصة: مغامرة في الصحراء', cover: 'c-story', about: 'اكتب قصة قصيرة عن مغامرة في الصحراء',
      start: now - 20 * DAY, due: now - 4 * DAY, end: now - 1 * DAY, people: 31, votes: 'live', accepts: 'قصة من تأليفك: ملف PDF أو صور صفحاتها', mine: 'story',
      rules: ['قصة واحدة لكل طفل'],
      entries: [kid('مريم', 'entry-03', 41, 'جمّولي في الصحراء'), kid('يوسف', 'entry-07', 12, 'بيت بين الكثبان'), kid('سلطان', 'entry-04', 27, 'القطة وقوس قزح'), kid('هيا', 'entry-08', 19, 'رحلة إلى الواحة')], me: 'entry-07' }
  ];
  const visible = (c) => c.active !== false && now >= c.start;
  const isOpen = (c) => visible(c) && now < c.end;
  const canEnter = (c) => isOpen(c) && now < (c.due || c.end);
  const until = (t, word) => { const d = Math.ceil((t - now) / DAY); return d <= 1 ? `${word} اليوم` : d === 2 ? `${word} بعد يومين` : `${word} بعد ${ar(d)} أيام`; };
  const left = (c) => { const d = Math.ceil((c.end - now) / DAY); return d <= 1 ? 'تنتهي اليوم' : d === 2 ? 'تنتهي بعد يومين' : `تنتهي بعد ${ar(d)} أيام`; };
  const ago = (c) => { const d = Math.floor((now - c.end) / DAY); return d <= 1 ? 'انتهت أمس' : d === 2 ? 'انتهت قبل يومين' : `انتهت قبل ${ar(d)} أيام`; };
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

  // the child's part: a quiz result, or an entry and a vote
  const key = (id) => `ajyal.comp.${id}`;
  const mine = (id) => { try { return JSON.parse(localStorage.getItem(key(id))) || {}; } catch { return {}; } };
  const keep = (id, v) => { try { localStorage.setItem(key(id), JSON.stringify({ ...mine(id), ...v })); } catch {} };
  // the winner is the entry with the most votes, chosen by the system when the competition ends
  const winner = (c) => (c.entries.length ? c.entries.reduce((a, b) => (b.votes > a.votes ? b : a)) : null);

  window.Peak = { COMPS, visible, isOpen, canEnter, until, left, ago, ar, mine, keep, winner };
})();
