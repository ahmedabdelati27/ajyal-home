// what the child can find in «حديقة القيم», shared by the web's garden and the phone's; it reads the values from values.js
// (load that first). base: where the site's files are from the calling page ('' or '../'); the journey page sits beside each garden page.
const Garden = (() => {
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  // where the child is with a value, as the garden's signs say it
  const where = (s) => (s.complete ? 'أزهرت' : s.n ? `تنمو، أكملت ${ar(s.n)} من ${ar(s.all)}` : 'لم تبدأ بعد');
  const short = (s) => (s.complete ? 'أزهرت' : s.n ? 'تنمو' : 'لم تبدأ بعد');
  // every value and every station on its journey; a station opens the value's journey, where the child meets it on the way.
  // The values come first, then their stations; the garden has no age groups of its own.
  // A station says «قيمة …», not «رحلة …»: «رحلة» is one letter away from «رحمة» and would bring back every station
  function searchItems(base = '') {
    const { VALUES, KIND, state } = window.Values;
    return VALUES.flatMap((v) => {
      const s = state(v), href = `value.html?v=${v.id}`;
      return [
        { title: v.name, sub: `${where(s)} · ${v.about}`, img: `${base}img/garden/v-${v.id}.jpg`, href, rank: 0,
          words: [`قيمة ${v.name}`, v.badge || ''] },
        ...v.stations.map((x) => ({ title: x.name, sub: `${KIND[x.kind]} · قيمة ${v.name} · ${short(s)}`, img: base + x.img, href, rank: 1,
          words: [KIND[x.kind], `قيمة ${v.name}`] }))
      ];
    });
  }
  return { searchItems };
})();
