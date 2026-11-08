// shared by «حديقة القيم»: each value is a journey through content that already exists on the platform
// (the BRD asks to link it, not to make new content), with Nour's words for each step.
// In the product the admin sets all of this; the child's progress is kept on this device for the prototype.
(() => {
  // a station opens existing content; the admin marks which stations are required to complete the value
  const st = (id, kind, name, href, img, req = true) => ({ id, kind, name, href, img, req });
  const KIND = { story: 'قصة', book: 'كتاب', video: 'فيديو', pictures: 'صور', game: 'لعبة' };
  const VALUES = [
    { id: 'honesty', name: 'الصدق', about: 'نقول الحقيقة دائماً، حتى عندما يكون ذلك صعباً', color: '#3D96D6', plot: [87, 63], badge: 'صديق الصدق',
      intro: 'أهلاً يا يوسف! اليوم نزرع شجرة الصدق معاً. الصادق يقول الحقيقة دائماً. هيا نبدأ رحلتنا!',
      done: 'رائع يا يوسف! أزهرت شجرة الصدق في حديقتك. أنت صادق وشجاع!',
      stations: [st('story', 'story', 'الأرنب الصادق', 'story.html', 'img/stories/cover-00.jpg'),
        st('book', 'book', 'البومة الحكيمة', 'book.html', 'img/forest/t04.jpg'),
        st('honest', 'game', 'ماذا يفعل الصادق؟', 'game-honest.html', 'img/games/g-09.jpg')] },
    { id: 'cooperation', name: 'التعاون', about: 'نساعد بعضنا لنصنع شيئاً أجمل', color: '#F4823F', plot: [70, 49],
      intro: 'هل رأيت الطيور كيف تطير معاً؟ هيا نتعلم التعاون!', done: 'أحسنت! أزهرت شجرة التعاون.',
      stations: [st('video', 'video', 'كيف تطير الطيور؟', 'video.html', 'img/forest/t01.jpg'),
        st('house', 'game', 'ابنِ البيت', 'game-house.html', 'img/games/g-08.jpg'),
        st('story', 'story', 'قصة عن التعاون', '#', 'img/stories/cover-02.jpg')] },
    { id: 'mercy', name: 'الرحمة', about: 'نرحم الصغير والحيوان، ونعامل الجميع بلطف', color: '#E0559A', plot: [51, 46],
      intro: 'الرحمة أن نعتني بمن حولنا. هيا نعتني بالحيوانات!', done: 'أزهرت شجرة الرحمة، شكراً لقلبك الطيب!',
      stations: [st('pics', 'pictures', 'صغار الحيوانات', 'pictures.html', 'img/forest/t03.jpg'),
        st('feed', 'game', 'أطعم الحيوانات', 'game-feed.html', 'img/games/g-04.jpg'),
        st('story', 'story', 'قصة عن الرحمة', '#', 'img/stories/cover-03.jpg')] },
    { id: 'responsibility', name: 'المسؤولية', about: 'نهتم بأشيائنا وبيئتنا، ونقوم بواجبنا', color: '#5BC236', plot: [27, 49],
      intro: 'المسؤول يعتني بأشيائه وبالأرض التي نعيش عليها. هيا نبدأ!', done: 'أزهرت شجرة المسؤولية، أنت تعتمد على نفسك!',
      stations: [st('plant', 'game', 'ازرع نبتة', 'game-plant.html', 'img/games/g-03.jpg'),
        st('sea', 'game', 'نظّف البحر', 'game.html', 'img/games/g-01.jpg'),
        st('room', 'game', 'رتّب الغرفة', '#', 'img/games/g-05.jpg')] },
    { id: 'mastery', name: 'الإتقان', about: 'نعمل بإتقان، خطوة بعد خطوة', color: '#9B6BD6', plot: [13, 60],
      intro: 'المتقن يعمل بهدوء ويهتم بكل خطوة. هيا نتقن عملنا!', done: 'أزهرت شجرة الإتقان، عمل رائع ومتقن!',
      stations: [st('house', 'game', 'ابنِ البيت', 'game-house.html', 'img/games/g-08.jpg'),
        st('moon', 'book', 'لماذا يتغير شكل القمر؟', 'flipbook.html', 'img/forest/t07.jpg'),
        st('puzzle', 'game', 'أكمل الصورة', '#', 'img/games/g-07.jpg')] }
  ];
  // the prototype starts with one journey half way and one value already in bloom, like a child who has been here before
  const DEMO = { honesty: ['book'], mercy: ['pics', 'feed', 'story'] };

  const key = (v) => `ajyal.value.${v}`;
  const read = (v) => { try { const s = localStorage.getItem(key(v)); return s ? JSON.parse(s) : DEMO[v] || []; } catch { return DEMO[v] || []; } };
  const write = (v, list) => { try { localStorage.setItem(key(v), JSON.stringify(list)); } catch {} };
  // a value is complete when its required stations are done; extra stations are welcome but do not count
  const state = (val) => {
    const req = val.stations.filter((x) => x.req), d = read(val.id).filter((s) => val.stations.some((x) => x.id === s));
    const n = req.filter((x) => d.includes(x.id)).length;
    return { done: d, n, all: req.length, complete: n === req.length };
  };
  // the plant shows the journey: a seed, a sprout, a young plant, a tree in bloom
  const stage = (val) => { const s = state(val); return s.complete ? 3 : s.n === 0 ? 0 : s.n / s.all >= 0.5 ? 2 : 1; };
  // the journey the child touched last is the one the garden and the map offer to continue
  const LAST = 'ajyal.value.last';
  const touch = (v) => { try { localStorage.setItem(LAST, v); } catch {} };
  const last = () => { try { return localStorage.getItem(LAST); } catch { return null; } };
  function finish(v, station) { const d = read(v); if (!d.includes(station)) { d.push(station); write(v, d); } touch(v); }
  // the journey under way: the last one touched if it is not finished, otherwise the first started one
  function current() {
    const open = VALUES.filter((x) => { const s = state(x); return s.n > 0 && !s.complete; });
    return open.find((x) => x.id === last()) || open[0] || null;
  }

  // the prototype counts a station as done when the child comes back from it
  const PENDING = 'ajyal.value.pending';
  const leave = (v, station) => { touch(v); try { sessionStorage.setItem(PENDING, JSON.stringify([v, station])); } catch {} };
  function back() {
    try { const p = JSON.parse(sessionStorage.getItem(PENDING)); sessionStorage.removeItem(PENDING); if (p) { finish(p[0], p[1]); return p; } } catch {}
    return null;
  }

  // Nour speaks her words when the device has an Arabic voice; the words are always on screen too
  const synth = window.speechSynthesis;
  synth?.getVoices();
  function say(text) {
    const v = synth?.getVoices().find((x) => x.lang?.startsWith('ar'));
    if (!v) return false;
    synth.cancel(); window.Sfx?.hush(true);
    const u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = 0.92;
    u.onend = u.onerror = () => window.Sfx?.hush(false);
    synth.speak(u); return true;
  }

  window.Values = { VALUES, KIND, state, stage, finish, leave, back, say, current };
})();
