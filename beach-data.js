// the stories the admin puts in each category of the Story Beach, shared by the web's beach and the phone's;
// base: where the site's files are from the calling page ('' or '../').
const Beach = (() => {
  // a: has a voiceover · hero: can be personalised through «أنت بطل القصة» · status: '' / '40%' / 'done' · fresh: «جديد»
  const s = (title, about, cover, pages, a, hero, status = '', fresh = false, href = '') => ({ title, about, cover, pages, a, hero, status, fresh, href });
  const SHELVES = [
    { id: 'values', title: 'قيم وأخلاق', count: 12, items: [
      s('الأرنب الصادق', 'زيتون يتعلّم أن الصدق شجاعة', 0, 10, true, true, '60%', false, 'story.html?resume=1'),
      s('السلحفاة الصبورة', 'سلمى تنتظر الزهرة حتى تتفتّح', 1, 8, true, false, 'done'),
      s('مشاركة الكعكة', 'الفرح يكبر عندما نتقاسمه', 2, 6, false, true, '', true),
      s('النملة المجتهدة', 'نملة صغيرة وبذرة كبيرة', 3, 8, true, false)
    ] },
    { id: 'animals', title: 'حيوانات وأصدقاء', count: 9, items: [
      s('صداقة القطة والعصفور', 'صديقان مختلفان يتعلّمان اللعب معاً', 5, 7, true, false),
      s('الفيل الذي يخاف من الفأر', 'حتى الكبار يخافون أحياناً', 6, 6, false, true, '', true),
      s('البطريق الذي يحب الدفء', 'بطريق صغير يبحث عن مكان دافئ', 7, 8, true, false, '30%'),
      s('الحوت الصغير يبحث عن أمه', 'رحلة في البحر الأزرق الكبير', 4, 9, true, false, 'done')
    ] },
    { id: 'trips', title: 'مغامرات ورحلات', count: 10, items: [
      s('رحلة إلى قاع البحر', 'غوّاصة صفراء بين المرجان', 8, 10, true, false),
      s('القارب الورقي', 'ضفدع يبحر في الجدول', 9, 6, false, false, 'done'),
      s('سرّ الجزيرة الملوّنة', 'صندوق غامض على الرمال', 10, 12, false, true, '', true),
      s('الطائرة الورقية الحمراء', 'دبدوب يطيّر طائرته عالياً', 11, 7, true, false)
    ] }
  ];
  // the categories, for the chips that filter the shelves
  const cats = () => SHELVES.map(({ id, title }) => ({ id, title }));
  // each shelf as Shelf.render draws it, on sand
  function shelves(base = '') {
    const AUDIO = { src: base + 'img/forest/I-12.png', c: '#EC6A93', name: 'قصة مسموعة' }, HERO = { src: base + 'img/I-15.png', c: '#F4823F', name: 'أنت بطل القصة' };
    const item = (it) => {
      const going = it.status && it.status !== 'done';
      return { title: it.title, href: it.href ? base + it.href : '#', img: `${base}img/stories/cover-${String(it.cover).padStart(2, '0')}.jpg`, kinds: [it.a && AUDIO, it.hero && HERO].filter(Boolean),
        meta: `${it.pages} صفحات`, tag: it.status === 'done' ? 'done' : it.fresh && !it.status ? 'new' : '', done: 'مكتملة', p: going ? it.status : '',
        label: [it.title, it.about, `${it.pages} صفحات`, it.a ? 'مسموعة' : '', it.hero ? 'يمكنك أن تكون بطلها' : '', it.status === 'done' ? 'مكتملة' : going ? 'جارية' : it.fresh ? 'جديدة' : ''].filter(Boolean).join('، ') };
    };
    return SHELVES.map((sh) => ({ ...sh, look: 'sand', items: sh.items.map(item) }));
  }
  return { shelves, cats };
})();
