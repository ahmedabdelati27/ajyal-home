// shared by «وادي الألوان»: the palette, the coloring pictures, and «إبداعاتي» kept on this device for the prototype
// (in the product the pictures come from the admin and the works are saved to the child's account)
(() => {
  // every color has a name the child can hear and read
  const PALETTE = [
    { c: '#E53935', n: 'أحمر' }, { c: '#FB8C00', n: 'برتقالي' }, { c: '#FDD835', n: 'أصفر' }, { c: '#8BC34A', n: 'أخضر فاتح' },
    { c: '#2E7D32', n: 'أخضر' }, { c: '#4FC3F7', n: 'سماوي' }, { c: '#1E63C6', n: 'أزرق' }, { c: '#8E44AD', n: 'بنفسجي' },
    { c: '#F48FB1', n: 'وردي' }, { c: '#8D5524', n: 'بني' }, { c: '#9E9E9E', n: 'رمادي' }, { c: '#333333', n: 'أسود' }, { c: '#FFFFFF', n: 'أبيض' }
  ];
  const CATS = [{ id: 'all', n: 'الكل' }, { id: 'shapes', n: 'الأشكال' }, { id: 'animals', n: 'الحيوانات' }, { id: 'nature', n: 'الطبيعة' }, { id: 'things', n: 'أشياء حولنا' }];
  // a numbered picture lists its parts: a point inside each part, its number and the suggested color (the child may pick any other)
  const PICS = [
    { id: 'shapes', name: 'بيت الأشكال', cat: 'shapes', parts: [
      { at: [450, 350], n: 1, c: 0, shape: 'المثلث' }, { at: [330, 540], n: 2, c: 2, shape: 'المربع' }, { at: [760, 170], n: 3, c: 1, shape: 'الدائرة' },
      { at: [450, 700], n: 4, c: 9, shape: 'المستطيل' }, { at: [565, 525], n: 5, c: 5, shape: 'المربع الصغير' }] },
    { id: 'cat', name: 'القطة', cat: 'animals' }, { id: 'fish', name: 'السمكة', cat: 'animals' },
    { id: 'butterfly', name: 'الفراشة', cat: 'animals' }, { id: 'camel', name: 'الجمل والنخلة', cat: 'animals' },
    { id: 'flower', name: 'الزهرة', cat: 'nature' }, { id: 'boat', name: 'القارب', cat: 'things' },
    { id: 'house', name: 'البيت والشجرة', cat: 'things' }, { id: 'balloon', name: 'المنطاد', cat: 'things' }
  ];

  // «بيت الأشكال» is drawn here, so its parts are exact: a triangle roof, a square wall, a round sun, a door and a window
  function drawShapes(ctx, s = 900) {
    const k = s / 900;
    ctx.save(); ctx.scale(k, k);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 900, 900);
    ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(210, 430); ctx.lineTo(450, 200); ctx.lineTo(690, 430); ctx.closePath(); ctx.stroke();
    ctx.strokeRect(250, 430, 400, 360);
    ctx.strokeRect(400, 620, 100, 170);
    ctx.strokeRect(520, 480, 90, 90);
    ctx.beginPath(); ctx.arc(760, 170, 90, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // the line drawing of a picture, ready to draw on a canvas
  function lines(pic) {
    if (pic.id === 'shapes') { const c = document.createElement('canvas'); c.width = c.height = 900; drawShapes(c.getContext('2d')); return Promise.resolve(c); }
    return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = `img/colors/line-${pic.id}.png`; });
  }
  const thumb = (pic) => (pic.id === 'shapes' ? (() => { const c = document.createElement('canvas'); c.width = c.height = 300; drawShapes(c.getContext('2d'), 300); return c.toDataURL(); })() : `img/colors/line-${pic.id}.png`);

  // «إبداعاتي»: drawings may be sent for publishing (an admin reviews them); colorings are only saved
  const KEY = 'ajyal.works';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  function save(work) {
    const all = [work, ...read().filter((w) => w.id !== work.id)];
    // the browser keeps only a few megabytes, so the oldest works go first
    for (let n = all.length; n > 0; n--) { try { localStorage.setItem(KEY, JSON.stringify(all.slice(0, n))); return true; } catch {} }
    return false;
  }
  const STATES = { private: 'خاصة بي', review: 'تحت المراجعة', published: 'منشورة', rejected: 'لم تُعتمد', saved: 'محفوظة' };
  const progress = { get: (id) => { try { return localStorage.getItem(`ajyal.color.${id}`); } catch { return null; } },
    set: (id, v) => { try { v ? localStorage.setItem(`ajyal.color.${id}`, v) : localStorage.removeItem(`ajyal.color.${id}`); } catch {} } };

  // the color's name, spoken softly when the child picks it (if the device has an Arabic voice)
  const synth = window.speechSynthesis;
  const voice = () => synth?.getVoices().find((v) => v.lang?.startsWith('ar'));
  synth?.getVoices();
  function say(text) {
    const v = voice(); if (!v) return;
    synth.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = 0.9; synth.speak(u);
  }

  window.Valley = { PALETTE, CATS, PICS, lines, thumb, works: { read, save }, STATES, progress, say };
})();
