// shared by the map's bell and «إشعاراتي»: the child's notifications, and which ones were read
// (in the product they come from the platform's events for the child's file; here the read ones are kept on this device)
(() => {
  // kind: badge, done (an achievement), approved (a creation published), status (a creation's state changed),
  // contest (a competition started), result (its result is out), ai (an AI creation is ready), content (something new from the admin)
  // go: where opening the notification takes the child
  const NOTES = [
    { id: 'n1', kind: 'badge', when: 'today', ago: 'قبل ساعة', t: 'شارة جديدة!', p: 'حصلت على شارة «شعلة الأيام» لأنك دخلت ٥ أيام متتالية.', img: 'img/badges/S-06.png', go: 'index.html?open=badges&b=S-06' },
    { id: 'n2', kind: 'approved', when: 'today', ago: 'قبل ٣ ساعات', t: 'نُشرت رسمتك', p: 'اعتمد فريق أجيال رسمتك «القطة الملوّنة»، ويراها الآن أطفال أجيال.', img: 'img/peak/entry-05.jpg', go: 'index.html?open=room&tab=works&w=demo-cat' },
    { id: 'n3', kind: 'ai', when: 'today', ago: 'قبل ٥ ساعات', t: 'قصتك جاهزة', p: 'صنعت نور قصتك «عمر ورحلة إلى القمر». اقرأها الآن!', img: 'img/workshop/s-00.jpg', go: 'create.html?k=story&w=demo-moon' },
    { id: 'n4', kind: 'contest', when: 'yesterday', ago: 'أمس', t: 'بدأت مسابقة جديدة', p: 'مسابقة «أفضل رسمة: بيتي الجميل» بدأت في قمة الأبطال. شارك برسمتك!', img: 'img/peak/c-draw.jpg', go: 'contest.html?c=home' },
    { id: 'n5', kind: 'status', when: 'yesterday', ago: 'أمس', t: 'رسمتك تحت المراجعة', p: 'وصلت رسمتك «رسمة حرة» إلى فريق أجيال، وسنخبرك بالنتيجة.', img: 'img/colors/mode-draw.jpg', go: 'index.html?open=room&tab=works&w=demo-free' },
    { id: 'n6', kind: 'result', when: 'week', ago: 'قبل ٣ أيام', t: 'ظهرت نتيجة المسابقة', p: 'انتهت مسابقة «أجمل قصة عن الصحراء». شاهد المشاركة الفائزة ونتيجتك.', img: 'img/peak/c-story.jpg', go: 'contest.html?c=desert' },
    { id: 'n7', kind: 'done', when: 'week', ago: 'قبل ٤ أيام', t: 'أزهرت شجرة الرحمة', p: 'أكملت رحلة قيمة الرحمة في حديقتك. أحسنت!', img: 'img/garden.png', go: 'value.html?v=mercy' },
    { id: 'n8', kind: 'content', when: 'older', ago: 'قبل أسبوعين', t: 'فيديو جديد في الغابة', p: 'أضاف فريق أجيال فيديو «كيف تطير الطيور؟». هل تشاهده؟', img: 'img/forest/t01.jpg', go: 'video.html' }
  ];
  // the prototype starts with the three of today unread
  const KEY = 'ajyal.notes.read', SEEN = ['n4', 'n5', 'n6', 'n7', 'n8'];
  const readIds = () => { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : SEEN; } catch { return SEEN; } };
  const isRead = (id) => readIds().includes(id);
  const mark = (ids) => { try { localStorage.setItem(KEY, JSON.stringify([...new Set([...readIds(), ...ids])])); } catch {} };
  const unread = () => NOTES.filter((n) => !isRead(n.id)).length;
  try {
    if (!localStorage.getItem('ajyal.notes.seeded')) {
      const works = JSON.parse(localStorage.getItem('ajyal.works') || '[]'), has = (id) => works.some((w) => w.id === id);
      const add = [
        { id: 'demo-cat', kind: 'draw', name: 'القطة الملوّنة', img: 'img/peak/entry-05.jpg', state: 'published', at: 1 },
        { id: 'demo-free', kind: 'draw', name: 'رسمة حرة', img: 'img/colors/mode-draw.jpg', state: 'review', at: 2 },
        { id: 'demo-moon', kind: 'ai-story', name: 'عمر ورحلة إلى القمر', img: 'img/workshop/s-00.jpg', state: 'private', href: 'create.html?k=story&w=demo-moon', at: 3 }
      ].filter((w) => !has(w.id));
      localStorage.setItem('ajyal.works', JSON.stringify([...works, ...add]));
      localStorage.setItem('ajyal.notes.seeded', '1');
    }
  } catch {}
  window.Notes = { NOTES, isRead, mark, unread };
})();
