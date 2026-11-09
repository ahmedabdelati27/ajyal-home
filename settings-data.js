// shared by the web's settings and the phone's: what the parent or teacher decides, shown to the child and never changed there.
// base: where the site's files are from the calling page ('' or '../'). Needs workshop.js (what the package has and the parent left on).
const Settings = (() => {
  // the time for today: set by the parent or teacher (the prototype's numbers)
  const TIME = '٦٠ دقيقة كل يوم، وباقي لك اليوم ٣٥ دقيقة';
  // the features the package has and the parent left on: key, name, what it does, picture (none: a camera)
  const FEATS = [
    ['ai', 'ورشة السحر', 'اصنع قصة أو فيديو', 'img/ai.png'],
    ['enhance', 'تحسين الرسم بالذكاء الاصطناعي', 'اجعل رسمتك أجمل', 'img/colors.png'],
    ['hero', 'أنت بطل القصة', 'ضع اسمك في قصة', 'img/I-15.png'],
    ['contests', 'المسابقات', 'شارك في قمة الأبطال', 'img/peak.png'],
    ['photos', 'رفع الصور', 'صورك وصور أسرتك في أنت بطل القصة', '']
  ];
  const on = (k) => (k === 'photos' ? Workshop.photos && Workshop.open('photos') : k === 'ai' ? Workshop.open('story') || Workshop.open('video') : Workshop.open(k));
  const feats = (base = '') => FEATS.map(([k, n, s, img]) => ({ k, n, s, img: img && base + img, on: on(k) }));
  // leaving the child's world: the parent confirms it is them first, then picks a child or signs out (children.html)
  const leave = (base = '') => `${base}children.html?check=1`;
  return { TIME, feats, leave };
})();
