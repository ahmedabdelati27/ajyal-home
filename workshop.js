// shared by «ورشة السحر»: what is left to make, the topics, the made story and video, and the stories the child can be the hero of
// (in the product the limits come from the parent's package, the topics from the admin, and the results from the AI; here they are kept on this device)
(() => {
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  // the child's profile: the AI uses the name, the age and the gender, nothing more
  const CHILD = { name: 'يوسف', age: 8, boy: true };

  // what is left of each feature until the subscription renews (the parent may also switch a feature off)
  const KINDS = {
    story: { n: 'قصة مصورة', one: 'قصة', about: 'قصة بالصور والصوت، تُكتب عنك', cover: 'k-story', of: 5, used: 2,
      steps: ['نكتب القصة', 'نرسم الصور', 'نسجّل الصوت'] },
    video: { n: 'فيديو', one: 'فيديو', about: 'فيديو قصير تشاهده، يُصنع عنك', cover: 'k-video', of: 2, used: 1,
      steps: ['نكتب الفكرة', 'نرسم المشاهد', 'نحرّك الفيديو'] }
  };
  const KEY = 'ajyal.ai';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
  const left = (k) => Math.max(0, KINDS[k].of - KINDS[k].used - (read()[k] || 0));
  // a result counts once it is shown; a failed attempt does not count
  const spend = (k) => { const v = read(); v[k] = (v[k] || 0) + 1; write(v); };
  // how much is left, said the way a child reads it
  const count = (k) => {
    const n = left(k);
    if (k === 'story') return n === 0 ? 'لا قصص متاحة الآن' : n === 1 ? 'باقي قصة واحدة' : n === 2 ? 'باقي قصتان' : `باقي ${ar(n)} قصص`;
    return n === 0 ? 'لا فيديوهات متاحة الآن' : n === 1 ? 'باقي فيديو واحد' : n === 2 ? 'باقي فيديوهان' : `باقي ${ar(n)} فيديوهات`;
  };

  // topics come ready from the admin; the child picks one and never writes a prompt
  const TOPICS = [
    { id: 'space', n: 'رحلة إلى الفضاء' }, { id: 'sea', n: 'مغامرة تحت البحر' },
    { id: 'desert', n: 'في الصحراء مع الجمل' }, { id: 'forest', n: 'الغابة المسحورة' },
    { id: 'farm', n: 'يوم في المزرعة' }, { id: 'dino', n: 'صديقي الديناصور' }
  ];
  // the prototype holds one made result of each kind
  const MADE = {
    story: { topic: 'space', title: 'يوسف ورحلة إلى القمر', cover: 's-00', pages: [
      'في ليلةٍ صافية، نظر يوسف من نافذته إلى القمر الكبير المضيء، وتمنّى أن يزوره.',
      'وفجأة، هبط صاروخٌ صغيرٌ ملوّن في حديقة البيت، ولمعت أضواؤه بين الأشجار!',
      'ركب يوسف الصاروخ، ولوّح بيده، وانطلق عالياً عالياً بين النجوم والكواكب.',
      'على القمر، قفز يوسف قفزاتٍ طويلةً خفيفة، وضحك كثيراً لأنه صار خفيفاً كالريشة.',
      'جلس يوسف ينظر إلى الأرض من بعيد، زرقاءَ جميلة، فتذكّر أسرته واشتاق إليها.',
      'عاد يوسف إلى بيته، وحكى لأمه عن رحلته، ثم نام سعيداً يحلم بالنجوم.'
    ] },
    video: { topic: 'sea', title: 'يوسف تحت البحر', src: 'img/workshop/sea.mp4', poster: 'sea-poster' }
  };

  // stories from the beach the admin marked as personalisable; only the characters already in the story can be changed
  const HERO = [
    { id: 'honest', title: 'الأرنب الصادق', cover: 0, ready: true, roles: [
      { id: 'hero', from: 'زيتون', who: 'بطل القصة: الأرنب زيتون', me: true },
      { id: 'friend', from: 'سلمى', who: 'صديقته: السلحفاة سلمى', hint: 'اسم صديقة' },
      { id: 'bear', from: 'دبدوب', who: 'الجار: الدب دبدوب', hint: 'اسم الجار' }
    ] },
    { id: 'cake', title: 'مشاركة الكعكة', cover: 2 },
    { id: 'elephant', title: 'الفيل الذي يخاف من الفأر', cover: 6 },
    { id: 'island', title: 'سرّ الجزيرة الملوّنة', cover: 10 }
  ];
  // the child's copy of a story: the names and pictures that replace the characters
  const copy = {
    get: (id) => { try { return JSON.parse(localStorage.getItem(`ajyal.hero.${id}`)); } catch { return null; } },
    set: (id, v) => { try { localStorage.setItem(`ajyal.hero.${id}`, JSON.stringify(v)); return true; } catch { return false; } }
  };
  // the parent decides whether the child may upload pictures (for the prototype: ?photos=off)
  const q = new URLSearchParams(location.search);
  const photos = q.get('photos') !== 'off';
  // a feature is open when the package has it and the parent has not switched it off
  // (for the prototype: ?off=story,video,hero, kept for the visit; ?off= opens them again)
  if (q.has('off')) { try { sessionStorage.setItem('ajyal.ai.off', q.get('off')); } catch {} }
  let offs = ''; try { offs = sessionStorage.getItem('ajyal.ai.off') || ''; } catch {}
  const open = (k) => !offs.split(',').includes(k);

  window.Workshop = { ar, CHILD, KINDS, left, spend, count, TOPICS, MADE, HERO, copy, photos, open };
})();
