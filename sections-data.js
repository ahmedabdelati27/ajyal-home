// every place of the world for «كل الأقسام», in the order a child meets them; shared by the web's page and the phone's.
// base: where the site's files are from the calling page ('' or '../'); the island pages have the same names in both folders.
// The little signs read values.js (the value growing in the garden) and workshop.js (what is left to make) when the page loads them.
const Sections = (() => {
  const PLACES = [
    { id: 'forest', bg: 'img/forest/hero.jpg', href: 'forest.html', title: 'غابة المعرفة', sub: 'فيديوهات وكتب وصور تعليمية', c: '#D7EEFC', d: '#3D96D6', tag: '✓ شاهدت كل الجديد' },
    { id: 'beach', bg: 'img/stories/beach-hero.jpg', href: 'beach.html', title: 'شاطئ الحكايات', sub: 'اقرأ واستمع لقصص ممتعة', c: '#FFE3EA', d: '#E0607F', tag: 'قصة جارية' },
    { id: 'letters', bg: 'img/letters/oasis-hero.jpg', href: 'oasis.html', title: 'واحة الحروف', sub: 'تعلّم الحروف والأرقام', c: '#FFF2C2', d: '#C99A00' },
    { id: 'quran', bg: 'img/quran/quran-hero.jpg', href: 'quran.html', title: 'واحة القرآن', sub: 'استمع وردّد وسمّع سور جزء عمّ', c: '#E2F4D6', d: '#5DAA33' },
    { id: 'games', bg: 'img/games/dunes-hero.jpg', href: 'games.html', title: 'كثبان الألعاب', sub: 'ألعاب تعليمية في أربعة عوالم', c: '#ECE6FD', d: '#7B64DA', tip: true },
    { id: 'colors', bg: 'img/colors/valley-hero.jpg', href: 'colors.html', title: 'وادي الألوان', sub: 'ارسم بحرية ولوّن الرسومات', c: '#FFE8D1', d: '#E58A2B', tip: true },
    { id: 'garden', bg: 'img/garden/garden-scene.jpg', href: 'garden.html', title: 'حديقة القيم', sub: 'رحلات مع نور لتزرع القيم', c: '#D9F3EA', d: '#3FB396' },
    { id: 'peak', bg: 'img/peak/peak-hero.jpg', href: 'peak.html', title: 'قمة الأبطال', sub: 'شارك في المسابقات', c: '#FFE1DC', d: '#E0584A' },
    { id: 'ai', bg: 'img/workshop/workshop-hero.jpg', href: 'workshop.html', title: 'ورشة السحر', sub: 'اصنع قصة أو فيديو، وكن بطل القصة', c: '#ECE6FD', d: '#7B64DA', gate: 'story' }
  ];
  // each place with its pictures from the calling page, and its sign: suggested for the child (tip), or what is under way (tag)
  function places(base = '') {
    const growing = window.Values && Values.current();
    const W = window.Workshop;
    return PLACES.map((p) => {
      let tag = p.tag || '';
      if (p.id === 'garden') tag = growing ? `قيمة ${growing.name} تكبر` : '';
      // the workshop says what is left, unless the parent has switched it off
      if (p.id === 'ai') tag = W && W.open(p.gate) ? `✨ ${W.count('story')}` : '';
      return { ...p, bg: base + p.bg, art: `${base}img/${p.id}.png`, tip: !!p.tip, tag: p.tip ? '' : tag };
    });
  }
  return { places };
})();
