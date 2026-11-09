// what the child can open in «وادي الألوان», for the valley's search; shared by the web's valley and the phone's.
// It reads valley.js (load that first) and changes nothing in it. valley.js gives paths from the site's root,
// so base is where the site's files are from the calling page ('' or '../').
const Colors = (() => {
  // a few more words a child may use for each kind of picture
  const MORE = { shapes: ['شكل', 'أشكال'], animals: ['حيوان'], nature: ['طبيعة', 'نبات', 'ورد'], things: ['أشياء', 'حولنا'] };
  const KIND = { draw: 'رسمة حرة', color: 'تلوين' };
  // «بيت الأشكال» is drawn on a canvas, so its little picture is made once and kept
  const thumbs = {};
  const thumb = (p) => thumbs[p.id] || (thumbs[p.id] = Valley.thumb(p));

  function searchItems(base = '') {
    const { PICS, CATS, works, STATES, progress } = Valley;
    const up = (s) => (!s || /^(data:|blob:|https?:|\/)/.test(s) ? s : base + s);
    const mine = works.read();
    const colored = new Set(mine.filter((w) => w.kind === 'color').map((w) => w.pic));
    // a picture the child left half colored comes first, then the pictures and free drawing, then the saved works
    const pics = PICS.map((p) => {
      const cat = CATS.find((c) => c.id === p.cat);
      const state = colored.has(p.id) ? 'لوّنتها' : progress.get(p.id) ? 'بدأت تلوينها' : '';
      return { title: p.name, img: up(thumb(p)), href: `${base}color.html?pic=${p.id}`, rank: state === 'بدأت تلوينها' ? 0 : 1,
        sub: ['رسمة للتلوين', cat && cat.n, p.parts && 'بالأرقام', state].filter(Boolean).join(' · '),
        words: [cat && cat.n, ...(MORE[p.cat] || []), 'تلوين', 'لون', 'رسمة', ...(p.parts ? ['بالأرقام', 'أرقام', 'أعداد'] : [])].filter(Boolean) };
    });
    const draw = { title: 'ارسم بحرية', sub: 'لوحة بيضاء وأقلام وألوان', img: `${base}img/colors/mode-draw.jpg`, href: `${base}draw.html`, rank: 1,
      words: ['رسم', 'رسمة', 'لوحة', 'أقلام', 'ألوان', 'حرة'] };
    // the valley's works open in «إبداعاتي» of the child's room: the map's panel on the web, the room's own screen on the phone
    const room = base ? 'room.html?tab=works&w=' : 'index.html?open=room&tab=works&w=';
    const mineHere = mine.filter((w) => KIND[w.kind]).map((w) => ({ title: w.name, img: up(w.img), href: room + encodeURIComponent(w.id), rank: 2,
      sub: ['إبداعاتي', KIND[w.kind], STATES[w.state]].filter(Boolean).join(' · '),
      words: ['إبداعاتي', 'أعمالي', KIND[w.kind], STATES[w.state]].filter(Boolean) }));
    return [...pics, draw, ...mineHere];
  }
  return { searchItems };
})();
